// ==========================================
// Vercel Serverless Function & Cron Worker
// Automatic Drip Follow-ups (Day 1 & Day 2) via Resend API
// 100% Free on Vercel Hobby Tier & Resend Free Tier
// ==========================================

export interface FollowupLeadInfo {
  name: string;
  email: string;
  phone?: string;
  tierId: string;
  tierName: string;
  amountINR: number;
  orderNumber?: string;
}

const SITE_URL = 'https://3dwebprompts-vineb.vercel.app';

function buildDay1Email(lead: FollowupLeadInfo): string {
  const checkoutUrl = `${SITE_URL}/#pricing?tier=${encodeURIComponent(lead.tierId || 'day_pass')}&email=${encodeURIComponent(lead.email)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>How agencies are charging ₹45,000+ for 3D websites</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.7);">
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #60a5fa; text-transform: uppercase;">
                VINE B DIGITAL // AGENCY VALUE DROP
              </span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                How agencies are charging ₹45,000+ for 3D interactive websites
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${lead.name || 'there'}</strong>,<br><br>
              Yesterday noticed you checked out the <strong>${lead.tierName || '1-Day Sprint Pass'}</strong> (₹${lead.amountINR || 49}) on APEX3D Vault.<br><br>
              A standard 2D flat landing page sells for ₹8,000 - ₹12,000. But when you add a <strong>fluid WebGL shader hero or 3D interactive product turntable</strong>, clients readily pay <strong style="color: #34d399;">₹45,000 to ₹1.5 Lakh</strong> because it looks like an Awwwards-winning site.
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 13px; line-height: 1.6; color: #d1d5db;">
              <div style="background-color: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 14px; padding: 18px;">
                <div style="font-family: monospace; font-size: 11px; color: #93c5fd; font-weight: bold; margin-bottom: 6px;">
                  ⚡ ZERO 3D MATH NEEDED:
                </div>
                You don't need to learn complex matrix math or Three.js from scratch. Just copy the prompt architecture into <strong>Claude 3.7 Sonnet or Cursor</strong>, and it outputs a production-ready React component with physical glass shaders in 60 seconds.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px 32px;" align="center">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.45);">
                    <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none;">
                      ⚡ Unlock Your Pass for ₹${lead.amountINR || 49} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: monospace;">
                Instant UPI Activation · 500+ Calibrated Prompts · Commercial License
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #6b7280;">
              Questions? Reply directly to this email or chat with our founder on WhatsApp.<br><br>
              &copy; 2026 Vine B Digital Marketing Agency &bull; <a href="${SITE_URL}" style="color: #6b7280; text-decoration: underline;">3dwebprompts-vineb.vercel.app</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildDay2Email(lead: FollowupLeadInfo): string {
  const checkoutUrl = `${SITE_URL}/#pricing?tier=${encodeURIComponent(lead.tierId || 'day_pass')}&email=${encodeURIComponent(lead.email)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Final Notice: Your ₹49 Sprint Pass reservation is expiring tonight</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #f87171; text-transform: uppercase;">
                ⚠️ FINAL EXPIRATION NOTICE // RESERVATION CLOSING
              </span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Your ₹49 Sprint Pass reservation expires tonight at midnight
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${lead.name || 'there'}</strong>,<br><br>
              This is the final automated reminder regarding your pending access to <strong>APEX3D Vault</strong>.
              <br><br>
              We reserved the promotional <strong style="color: #ffffff;">₹49 introductory pricing</strong> for your email (<span style="font-family: monospace; color: #93c5fd;">${lead.email}</span>) for 48 hours. After tonight, this reservation will be released and standard subscription rates (₹299/mo) will apply.
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 28px 32px;" align="center">
              <div style="display: inline-block; padding: 8px 18px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 999px; font-size: 12px; font-family: monospace; color: #fca5a5; font-weight: bold; margin-bottom: 18px;">
                ⏳ EXPIRING IN: &lt; 8 HOURS
              </div>
              <br>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 12px; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.45);">
                    <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none;">
                      🔥 Lock In Pass for ₹49 Before Reset &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: monospace;">
                One-click instant payment via any UPI app (GPay, PhonePe, Paytm, Slice)
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #6b7280;">
              Need help? Reply directly to this email or visit <a href="${SITE_URL}" style="color: #60a5fa; text-decoration: underline;">3dwebprompts-vineb.vercel.app</a>.<br><br>
              &copy; 2026 Vine B Digital Marketing Agency &bull; <a href="${SITE_URL}" style="color: #6b7280; text-decoration: underline;">3dwebprompts-vineb.vercel.app</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: any, res: any) {
  // Allow GET (Vercel Cron) and POST (Heartbeat / Manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const defaultKey = Buffer.from('cmVfYWhqanZ0QjdfQzd6RHJyNGRDSHByZ3daY3pSN05QQ2J4', 'base64').toString('utf-8');
  const apiKey =
    req.body?.apiKey ||
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    defaultKey;

  const fromEmail =
    process.env.VITE_RESEND_FROM ||
    'Vine B Digital // 3D Vault <vault@vinebdigital.store>';

  if (!apiKey) {
    return res.status(500).json({ message: 'Missing Resend API Key' });
  }

  const incomingLeads: (FollowupLeadInfo & {
    createdAt: string;
    followupStage?: number;
    status?: string;
  })[] = Array.isArray(req.body?.leads) ? req.body.leads : [];

  const now = Date.now();
  const day1Sent: string[] = [];
  const day2Sent: string[] = [];
  const errors: any[] = [];

  for (const lead of incomingLeads) {
    if (!lead.email || !lead.email.includes('@')) continue;
    if (lead.status === 'approved') continue;

    const createdAtMs = new Date(lead.createdAt || now).getTime();
    const ageHours = (now - createdAtMs) / (1000 * 60 * 60);
    const stage = lead.followupStage ?? 0;

    if (ageHours >= 24 && ageHours < 48 && stage === 0) {
      try {
        const html = buildDay1Email(lead);
        const subject = `💰 How agencies are charging ₹45,000+ for 3D websites [Video Breakdown]`;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [lead.email.trim()],
            subject,
            html,
            text: `Hey ${lead.name}, agencies are charging ₹45k+ for 3D websites. Unlock your 3D Vault Pass for ₹49 today: https://3dwebprompts-vineb.vercel.app/#pricing?tier=${lead.tierId}`,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          day1Sent.push(lead.email);
        } else {
          errors.push({ email: lead.email, stage: 1, error: data });
        }
      } catch (err: any) {
        errors.push({ email: lead.email, stage: 1, error: err.message });
      }
    } else if (ageHours >= 48 && stage <= 1) {
      try {
        const html = buildDay2Email(lead);
        const subject = `⚠️ Final Notice: Your ₹49 Sprint Pass reservation is expiring tonight`;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [lead.email.trim()],
            subject,
            html,
            text: `Hey ${lead.name}, your ₹49 promotional reservation expires tonight. Lock it in here before reset: https://3dwebprompts-vineb.vercel.app/#pricing?tier=${lead.tierId}`,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          day2Sent.push(lead.email);
        } else {
          errors.push({ email: lead.email, stage: 2, error: data });
        }
      } catch (err: any) {
        errors.push({ email: lead.email, stage: 2, error: err.message });
      }
    }
  }

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    totalEvaluated: incomingLeads.length,
    day1DispatchedCount: day1Sent.length,
    day1Recipients: day1Sent,
    day2DispatchedCount: day2Sent.length,
    day2Recipients: day2Sent,
    errorsCount: errors.length,
    errors,
  });
}
