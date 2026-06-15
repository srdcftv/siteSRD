const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO || EMAIL_USER;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465, // 465 = SSL direto; 587 = STARTTLS
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  console.log('[mailer] Envio de e-mail ativo (' + EMAIL_USER + ' -> ' + EMAIL_TO + ') porta ' + port);
} else {
  console.warn('[mailer] EMAIL_USER/EMAIL_PASS não configurados — envio de e-mail desativado (os dados continuam salvos no banco).');
}

function escapeHtml(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Envia uma notificação. Nunca lança erro — retorna true/false.
async function enviarEmail({ assunto, html, replyTo }) {
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: `"SRD Segurança — Site" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      replyTo: replyTo || undefined,
      subject: assunto,
      html,
    });
    return true;
  } catch (e) {
    console.error('[mailer] Falha ao enviar e-mail:', e.message);
    return false;
  }
}

module.exports = { enviarEmail, escapeHtml };
