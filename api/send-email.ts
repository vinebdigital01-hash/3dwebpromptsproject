// Vercel Serverless Function: Proxy requests to Resend API securely with rate-limiting
const recipientLogs = new Map<string, number[]>();
const MAX_SERVER_DAILY = 4; // Max 4 emails per recipient per 24 hours

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { from, to, subject, html, text, apiKey } = req.body || {};
  const token = process.env.RESEND_API_KEY || apiKey || process.env.VITE_RESEND_API_KEY;

  if (!token) {
    return res.status(500).json({ message: 'Server configuration error: Missing Resend API Key' });
  }

  const recipients = Array.isArray(to) ? to : [to];
  const primaryRecipient = (recipients[0] || '').trim().toLowerCase();

  // Enforce server-side rate limit (max 4 per day per recipient)
  if (primaryRecipient) {
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    const existing = recipientLogs.get(primaryRecipient) || [];
    const recent = existing.filter((t) => now - t < windowMs);

    if (recent.length >= MAX_SERVER_DAILY) {
      return res.status(429).json({
        message: `Daily rate limit of ${MAX_SERVER_DAILY} emails reached for ${primaryRecipient}.`,
      });
    }

    recent.push(now);
    recipientLogs.set(primaryRecipient, recent);
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || 'Vine B Digital // 3D Vault <vault@vinebdigital.store>',
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
