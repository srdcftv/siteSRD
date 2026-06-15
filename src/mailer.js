const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO || EMAIL_USER;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  console.log('[mailer] Envio de e-mail ativo (' + EMAIL_USER + ' -> ' + EMAIL_TO + ')');
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
