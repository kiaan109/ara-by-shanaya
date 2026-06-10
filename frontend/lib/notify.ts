// Shared notification helpers — email (Resend) + SMS (optional provider)

const FROM = 'ARA by Shanaya <onboarding@resend.dev>';

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html }),
    });
    return { ok: res.ok };
  } catch (e) {
    console.error('[sendEmail]', e);
    return { ok: false };
  }
}

// SMS via Twilio — only fires if TWILIO_* env vars are configured.
// Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER to enable.
export async function sendSMS(to: string, body: string) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { skipped: true };

  let phone = to.replace(/[^\d+]/g, '');
  if (!phone.startsWith('+')) phone = `+91${phone.replace(/^0+/, '')}`;

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, From: from, Body: body }).toString(),
    });
    return { ok: res.ok };
  } catch (e) {
    console.error('[sendSMS]', e);
    return { ok: false };
  }
}

export function brandEmailWrap(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#fafafa;margin:0;padding:0">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8e8e8">
    <div style="background:#1a1c1c;padding:28px 32px;text-align:center">
      <p style="font-size:22px;letter-spacing:.2em;color:#fff;font-weight:300;margin:0">ARA <span style="color:#C5A059">by</span> SHANAYA</p>
      <p style="font-size:10px;letter-spacing:.45em;color:#888;text-transform:uppercase;margin:8px 0 0">${title}</p>
    </div>
    <div style="padding:28px 32px">${bodyHtml}</div>
  </div></body></html>`;
}
