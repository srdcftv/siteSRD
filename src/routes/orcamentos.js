const express = require('express');
const router = express.Router();
const db = require('../database');
const { enviarEmail, escapeHtml } = require('../mailer');

router.post('/', (req, res) => {
  const { nome, telefone, email, cidade, servico, detalhes, mensagem } = req.body;
  if (!nome || !telefone || !servico) {
    return res.status(400).json({ erro: 'Nome, telefone e serviço são obrigatórios' });
  }
  const detalhesJSON = typeof detalhes === 'object' ? JSON.stringify(detalhes) : (detalhes || '');
  try {
    const result = db.prepare(
      'INSERT INTO orcamentos (nome, telefone, email, cidade, servico, detalhes, mensagem) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nome, telefone, email || null, cidade || null, servico, detalhesJSON, mensagem || null);

    // Notificação por e-mail (não bloqueia a resposta)
    const detItens = (detalhes && typeof detalhes === 'object')
      ? Object.entries(detalhes).filter(([, v]) => v).map(([k, v]) => `<li><b>${escapeHtml(k)}:</b> ${escapeHtml(v)}</li>`).join('')
      : '';
    const html = `
      <h2>Novo pedido de orçamento</h2>
      <ul>
        <li><b>Nome:</b> ${escapeHtml(nome)}</li>
        <li><b>Telefone/WhatsApp:</b> ${escapeHtml(telefone)}</li>
        <li><b>E-mail:</b> ${escapeHtml(email) || '—'}</li>
        <li><b>Cidade:</b> ${escapeHtml(cidade) || '—'}</li>
        <li><b>Serviço:</b> ${escapeHtml(servico)}</li>
      </ul>
      ${detItens ? `<p><b>Detalhes:</b></p><ul>${detItens}</ul>` : ''}
      ${mensagem ? `<p><b>Mensagem:</b><br>${escapeHtml(mensagem)}</p>` : ''}
      <hr><p style="color:#888;font-size:12px">Enviado pelo formulário do site srdseguranca.com.br</p>`;
    enviarEmail({ assunto: `Novo orçamento: ${servico} — ${nome}`, html, replyTo: email }).catch(() => {});

    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM orcamentos ORDER BY criado_em DESC').all();
  res.json(rows);
});

module.exports = router;
