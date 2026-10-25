// ==========================================
// APEX3D VAULT - Automated Drip Follow-up Email Templates
// High-Converting Copy for Day 1 (24h) and Day 2 (48h) Abandoned Leads
// 100% Free Automation via Resend API
// ==========================================

import { generateEmailVideoBlockHtml } from './vaultEmailShowcase';

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

/**
 * 📩 DAY 1 (24 Hours Later): Proof, High ROI & Client Case Study
 */
export function buildDay1FollowupEmailHtml(lead: FollowupLeadInfo): string {
  const checkoutUrl = `${SITE_URL}/#pricing?tier=${encodeURIComponent(lead.tierId)}&email=${encodeURIComponent(lead.email)}`;
  const videoBlockHtml = generateEmailVideoBlockHtml('latest', lead.orderNumber || 'APX-DAY1');

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
          <!-- Refraction Line -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #60a5fa; text-transform: uppercase;">
                VINE B DIGITAL // AGENCY VALUE DROP
              </span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.3;">
                How agencies are charging ₹45,000+ for 3D interactive websites
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${lead.name || 'there'}</strong>,<br><br>
              Yesterday noticed you checked out the <strong>${lead.tierName}</strong> (₹${lead.amountINR || 49}) on APEX3D Vault.<br><br>
              In case you were wondering whether 3D websites actually bring clients — here is a real metric from our studio:
              <br><br>
              A standard 2D flat landing page sells for <span style="text-decoration: line-through; color: #6b7280;">₹8,000 - ₹12,000</span>. But when you add a <strong>fluid WebGL shader hero or 3D interactive product turntable</strong>, clients readily pay <strong style="color: #34d399;">₹45,000 to ₹1.5 Lakh</strong> because it looks like an Awwwards-winning site.
            </td>
          </tr>

          <!-- Interactive Video Showcase from Vault -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              ${videoBlockHtml}
            </td>
          </tr>

          <!-- Why the prompt vault changes everything -->
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

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px;" align="center">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.45);">
                    <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.03em;">
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

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #6b7280;">
              Questions? Reply directly to this email, call <a href="tel:8287578025" style="color: #60a5fa; text-decoration: underline;">+91 8287578025</a> or WhatsApp us on <a href="https://wa.me/919717466626" style="color: #60a5fa; text-decoration: underline;">+91 9717466626</a>.<br><br>
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

/**
 * 📩 DAY 2 (48 Hours Later): Urgency, Scarcity & Final Expiration Warning
 */
export function buildDay2FollowupEmailHtml(lead: FollowupLeadInfo): string {
  const checkoutUrl = `${SITE_URL}/#pricing?tier=${encodeURIComponent(lead.tierId)}&email=${encodeURIComponent(lead.email)}`;

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
          <!-- Red Scarcity Line -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #f87171; text-transform: uppercase;">
                ⚠️ FINAL EXPIRATION NOTICE // RESERVATION CLOSING
              </span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.3;">
                Your ₹49 Sprint Pass reservation expires tonight at midnight
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${lead.name || 'there'}</strong>,<br><br>
              This is the final automated reminder regarding your pending access to <strong>APEX3D Vault</strong>.
              <br><br>
              We reserved the promotional <strong style="color: #ffffff;">₹49 introductory pricing</strong> for your email (<span style="font-family: monospace; color: #93c5fd;">${lead.email}</span>) for 48 hours. After tonight, this reservation will be released and standard subscription rates (₹299/mo) will apply.
            </td>
          </tr>

          <!-- Box: What You Lose If You Miss Out -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" style="background-color: #090913; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 14px; padding: 18px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-family: monospace; color: #fca5a5; font-weight: bold; margin-bottom: 8px;">
                      WHAT'S INCLUDED FOR JUST ₹49 TODAY:
                    </div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #d1d5db; line-height: 1.7;">
                      <li>500+ Calibrated WebGL, Three.js & GLSL Prompts</li>
                      <li>Curated for Claude 3.7 Sonnet & Cursor AI</li>
                      <li>Instant Next.js 15 Starter Repositories (.zip download)</li>
                      <li>Commercial License to charge clients $5k+</li>
                      <li>Automated Client Portal with one-click code copy</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Urgency Countdown Banner -->
          <tr>
            <td style="padding: 0 32px 28px 32px;" align="center">
              <div style="display: inline-block; padding: 8px 18px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 999px; font-size: 12px; font-family: monospace; color: #fca5a5; font-weight: bold; margin-bottom: 18px;">
                ⏳ EXPIRING IN: &lt; 8 HOURS
              </div>
              <br>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 12px; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.45);">
                    <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.03em;">
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

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #6b7280;">
              Need help? Call <a href="tel:8287578025" style="color: #60a5fa; text-decoration: underline;">+91 8287578025</a> or WhatsApp us at <a href="https://wa.me/919717466626" style="color: #60a5fa; text-decoration: underline;">+91 9717466626</a>.<br><br>
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
