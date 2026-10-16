// ==========================================
// Vercel Serverless Function & Cron Worker
// Automatic Drip Follow-ups (Day 1 & Day 2) via Resend API
// 100% Free on Vercel Hobby Tier & Resend Free Tier
// ==========================================

import { buildDay1FollowupEmailHtml, buildDay2FollowupEmailHtml, FollowupLeadInfo } from '../src/lib/dripFollowupTemplates';

export default async function handler(req: any, res: any) {
  // Allow GET (Vercel Cron) and POST (Heartbeat / Manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey =
    req.body?.apiKey ||
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    '';

  const fromEmail =
    process.env.VITE_RESEND_FROM ||
    'Vine B Digital // 3D Vault <vault@vinebdigital.store>';

  if (!apiKey) {
    return res.status(500).json({ message: 'Missing Resend API Key' });
  }

  // Leads can be provided via payload or default query
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
    // Don't follow up with users who already paid / got approved
    if (lead.status === 'approved') continue;

    const createdAtMs = new Date(lead.createdAt || now).getTime();
    const ageHours = (now - createdAtMs) / (1000 * 60 * 60);
    const stage = lead.followupStage ?? 0;

    // -----------------------------------------------------------------------
    // CONDITION 1: DAY 1 (24+ Hours elapsed and Stage 0)
    // -----------------------------------------------------------------------
    if (ageHours >= 24 && ageHours < 48 && stage === 0) {
      try {
        const html = buildDay1FollowupEmailHtml(lead);
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
    }

    // -----------------------------------------------------------------------
    // CONDITION 2: DAY 2 (48+ Hours elapsed and Stage 1)
    // -----------------------------------------------------------------------
    else if (ageHours >= 48 && stage <= 1) {
      try {
        const html = buildDay2FollowupEmailHtml(lead);
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
