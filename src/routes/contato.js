const express = require('express');
const router = express.Router();
const db = require('../database');
const { enviarEmail, escapeHtml } = require('../mailer');

router.post('/', (req, res) => {
  const { nome, telefone, email, mensagem } = req.body;
  if (!nome || !mensagem) {
    return res.status(400).json({ erro: 'Nome e mensagem são obrigatórios' });
  }
  try {
    db.prepare('INSERT INTO contatos (nome, telefone, email, mensagem) VALUES (?, ?, ?, ?)')
      .run(nome, telefone || null, email || null, mensagem);

    // Notificação por e-mail (não bloqueia a resposta)
    const html = `
      <h2>Nova mensagem de contato</h2>
      <ul>
        <li><b>Nome:</b> ${escapeHtml(nome)}</li>
        <li><b>Telefone:</b> ${escapeHtml(telefone) || '—'}</li>
        <li><b>E-mail:</b> ${escapeHtml(email) || '—'}</li>
      </ul>
      <p><b>Mensagem:</b><br>${escapeHtml(mensagem)}</p>
      <hr><p style="color:#888;font-size:12px">Enviado pelo formulário do site srdseguranca.com.br</p>`;
    enviarEmail({ assunto: `Novo contato: ${nome}`, html, replyTo: email }).catch(() => {});

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

module.exports = router;
