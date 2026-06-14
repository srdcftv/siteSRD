const express = require('express');
const router = express.Router();
const db = require('../database');

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
