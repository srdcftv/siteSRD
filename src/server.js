require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/orcamentos', require('./routes/orcamentos'));
app.use('/api/contato', require('./routes/contato'));

app.get('/api/whatsapp', (req, res) => {
  res.json({ numero: process.env.WHATSAPP_NUMERO || '5511996957903' });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ erro: 'Rota não encontrada' });
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error('[ERRO]', err);
  if (req.path && req.path.startsWith('/api')) {
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
  res.status(500).send('Erro interno');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🛡️  SRD Segurança Eletrônica`);
  console.log(`✅ Servidor: http://localhost:${PORT}\n`);
});
