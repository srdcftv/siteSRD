const express = require('express');
const router = express.Router();
const db = require('../database');

router.post('/', (req, res) => {
  const { nome, telefone, email, mensagem } = req.body;
  if (!nome || !mensagem) {
    return res.status(400).json({ erro: 'Nome e mensagem são obrigatórios' });
  }
  try {
    db.prepare('INSERT INTO contatos (nome, telefone, email, mensagem) VALUES (?, ?, ?, ?)')
      .run(nome, telefone || null, email || null, mensagem);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

module.exports = router;
