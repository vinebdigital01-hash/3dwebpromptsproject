// Vercel Serverless Function: Proxy requests to Resend API securely
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { from, to, subject, html, text, apiKey } = req.body || {};
  const token = apiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';

  if (!token) {
    return res.status(400).json({ message: 'Missing Resend API Key' });
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
        to: Array.isArray(to) ? to : [to],
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
