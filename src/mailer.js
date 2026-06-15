// Envio de e-mail via API HTTP do Resend (porta 443).
// SMTP é bloqueado em várias plataformas de nuvem (Railway), por isso usamos HTTP.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Remetente: enquanto o domínio não estiver verificado no Resend, usa o domínio
// de teste deles (onboarding@resend.dev). Depois, troque EMAIL_FROM para
// "SRD Segurança <contato@srdseguranca.com.br>".
const EMAIL_FROM = process.env.EMAIL_FROM || 'SRD Segurança <onboarding@resend.dev>';
const EMAIL_TO = process.env.EMAIL_TO || 'srdseguranca@gmail.com';

if (RESEND_API_KEY) {
  console.log('[mailer] Envio de e-mail ativo via Resend (' + EMAIL_FROM + ' -> ' + EMAIL_TO + ')');
} else {
  console.warn('[mailer] RESEND_API_KEY não configurada — envio desativado (os dados continuam salvos no banco).');
}

function escapeHtml(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Nunca lança erro — retorna true/false.
async function enviarEmail({ assunto, html, replyTo }) {
  if (!RESEND_API_KEY) return false;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [EMAIL_TO],
        reply_to: replyTo || undefined,
        subject: assunto,
        html,
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      console.error('[mailer] Resend respondeu erro', resp.status, txt);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[mailer] Falha ao enviar e-mail:', e.message);
    return false;
  }
}

module.exports = { enviarEmail, escapeHtml };
