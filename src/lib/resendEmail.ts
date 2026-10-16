// ==========================================
// APEX3D VAULT - Resend Transactional Email Engine
// Automated fulfillment, license dispatch, and delivery via Resend API
// ==========================================

import { LeadOrder } from './leadTracker';
import { getAdminSettings } from './adminSettings';

export interface EmailDispatchResult {
  success: boolean;
  message: string;
  id?: string;
}

/**
 * Send an email using Resend API (via serverless endpoint / dev proxy or direct fallback)
 */
export async function sendEmailViaResend(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<EmailDispatchResult> {
  const settings = getAdminSettings();
  const apiKey = settings.resendApiKey?.trim() || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) || '';
  const fromAddress = options.from || settings.resendFromEmail || 'Vine B Digital // 3D Vault <vault@vinebdigital.store>';

  if (!options.to || !options.to.includes('@')) {
    return { success: false, message: 'Invalid recipient email address.' };
  }

  const payload = {
    from: fromAddress,
    to: [options.to.trim()],
    subject: options.subject,
    html: options.html,
    text: options.text || options.subject,
  };

  // 1. Try local dev proxy / Vercel Serverless Function `/api/send-email`
  try {
    const proxyRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        apiKey,
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return {
        success: true,
        message: `Email dispatched successfully! (ID: ${data.id || 'OK'})`,
        id: data.id,
      };
    }
  } catch {
    // Proxy not available or network error, fallback to direct API
  }

  // 2. Direct Resend API Fallback
  try {
    const directRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await directRes.json();

    if (directRes.ok) {
      return {
        success: true,
        message: `Email dispatched directly via Resend! (ID: ${data.id || 'OK'})`,
        id: data.id,
      };
    } else {
      const errMsg = data.message || `Resend Error (${directRes.status})`;
      // Check if domain is not yet verified in Resend
      if (errMsg.includes('domain is not verified') || errMsg.includes('onboarding@resend.dev')) {
        return {
          success: false,
          message: `Resend Notice: Domain "vinebdigital.store" requires DNS verification in Resend dashboard. For testing without custom domain, send from "onboarding@resend.dev" to your Resend account email.`,
        };
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error calling Resend API.',
    };
  }
}

/**
 * Generate Branded Approval HTML Email
 */
export function buildApprovalEmailHtml(order: LeadOrder): string {
  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#portal`
    : 'https://vinebdigital.store/#portal';
  const loginUrl = `${portalUrl}?orderId=${encodeURIComponent(order.id)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your 3D Vault Pass is Active</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <!-- Top Cyber Refraction Line -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #3b82f6; text-transform: uppercase; margin-bottom: 6px;">
                      VINE B DIGITAL // 3D VAULT
                    </span>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">
                      Access Granted. Your Pass is Active.
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 999px; font-size: 10px; font-family: monospace; color: #34d399; font-weight: bold;">
                      PAID & VERIFIED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Hey <strong>${order.name}</strong>,<br><br>
              Your payment of <strong style="color: #ffffff;">₹${order.amountINR}</strong> via UPI (UTR: <span style="font-family: monospace; color: #93c5fd;">${order.utrNumber || 'VERIFIED'}</span>) has been reconciled. Your personal access license to the <strong>500+ Calibrated WebGL & Three.js 3D Prompts Vault</strong> has been unlocked.
            </td>
          </tr>

          <!-- License Key Box -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" style="background-color: #080811; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 14px; padding: 18px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-family: monospace; color: #60a5fa; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">
                      OFFICIAL LICENSE CERTIFICATE
                    </div>
                    <div style="font-size: 20px; font-family: monospace; font-weight: 800; color: #ffffff; letter-spacing: 0.08em;">
                      ${order.licenseKey || 'LIC-PRO-ACCESS-ACTIVE'}
                    </div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
                      Plan: <strong style="color: #d1d5db;">${order.tierName}</strong> · Valid Until: <strong style="color: #d1d5db;">${order.expiresAt ? new Date(order.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime (No Expiry)'}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px;" align="center">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.4);">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.02em;">
                      ⚡ Open Client Portal Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: monospace;">
                One-click instant login (No password required)
              </div>
            </td>
          </tr>

          <!-- Order Summary Details -->
          <tr>
            <td style="padding: 24px 32px; background-color: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #9ca3af;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="padding-bottom: 6px;">Order Number:</td>
                  <td align="right" style="color: #ffffff; font-family: monospace;">${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 6px;">Tax Invoice:</td>
                  <td align="right" style="color: #ffffff; font-family: monospace;">${order.invoiceNumber || 'INV-2026-TAX'}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 6px;">Payment Method:</td>
                  <td align="right" style="color: #ffffff;">Slice Merchant UPI Transfer</td>
                </tr>
                <tr>
                  <td>Issuing Entity:</td>
                  <td align="right" style="color: #ffffff;">Vine B Digital Marketing Agency</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #6b7280;">
              Need support or want custom shader engineering? Reply directly to this email or write to <a href="mailto:support@vinebdigital.store" style="color: #60a5fa; text-decoration: underline;">support@vinebdigital.store</a>.<br><br>
              &copy; 2026 Vine B Digital Marketing Agency · <a href="https://vinebdigital.store" style="color: #6b7280; text-decoration: underline;">vinebdigital.store</a>
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
 * Generate Branded Rejection Notice HTML Email
 */
export function buildRejectionEmailHtml(order: LeadOrder, reason: string): string {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vinebdigital.store';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Action Required: Payment Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0c0c16; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px; overflow: hidden;">
          <tr>
            <td style="height: 3px; background: #ef4444;"></td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #ef4444; text-transform: uppercase;">
                VINE B DIGITAL // PAYMENT RECONCILIATION
              </span>
              <h1 style="margin: 8px 0 16px 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                Verification Required for Order #${order.orderNumber}
              </h1>
              <p style="font-size: 13px; line-height: 1.6; color: #9ca3af;">
                Hey <strong>${order.name}</strong>,<br><br>
                Our billing team reviewed your submitted UPI reference (<strong>${order.utrNumber || 'N/A'}</strong>) for the <strong>${order.tierName}</strong> (₹${order.amountINR}), but was unable to confirm the bank credit due to the following reason:
              </p>

              <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 14px; margin: 18px 0; color: #fca5a5; font-size: 12px; font-family: monospace;">
                Reason: ${reason || 'Payment reference could not be located in bank statement.'}
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #9ca3af;">
                If you already completed the payment, please check your UPI app (Google Pay, PhonePe, Paytm, Slice) payment receipt and reply to this email with your screenshot or correct 12-digit UTR number. We will manually approve your access immediately.
              </p>

              <div style="margin-top: 24px; text-align: center;">
                <a href="${siteUrl}" style="display: inline-block; padding: 12px 26px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 12px; font-weight: bold;">
                  Re-submit UTR Reference &rarr;
                </a>
              </div>
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
 * Dispatch Approval Email
 */
export async function sendOrderApprovalEmail(order: LeadOrder): Promise<EmailDispatchResult> {
  const html = buildApprovalEmailHtml(order);
  const subject = `⚡ Your 3D Vault Pass is Active [License: ${order.licenseKey || 'VERIFIED'}]`;

  return sendEmailViaResend({
    to: order.email,
    subject,
    html,
    text: `Hey ${order.name}, your payment for ${order.tierName} (₹${order.amountINR}) has been approved! License: ${order.licenseKey || 'ACTIVE'}. Log in at https://vinebdigital.store/#portal?orderId=${order.id}`,
  });
}

/**
 * Dispatch Rejection Email
 */
export async function sendOrderRejectionEmail(order: LeadOrder, reason: string): Promise<EmailDispatchResult> {
  const html = buildRejectionEmailHtml(order, reason);
  const subject = `⚠️ Action Required: Payment Reference Issue (Order #${order.orderNumber})`;

  return sendEmailViaResend({
    to: order.email,
    subject,
    html,
    text: `Hey ${order.name}, we could not verify your payment reference (${order.utrNumber}) for Order #${order.orderNumber}. Reason: ${reason}. Please reply to this email with your UPI receipt.`,
  });
}

/**
 * Dispatch Quick Test Email from Admin Console
 */
export async function sendTestEmail(targetEmail: string): Promise<EmailDispatchResult> {
  const html = `<!DOCTYPE html>
<html>
<body style="background:#090914;color:#ffffff;font-family:sans-serif;padding:30px;">
  <h2 style="color:#3b82f6;">🚀 Vine B Digital // 3D Vault - Resend Test</h2>
  <p>Congratulations! Your transactional email pipeline is operating seamlessly.</p>
  <p><strong>Sender:</strong> Vine B Digital // 3D Vault &lt;vault@vinebdigital.store&gt;</p>
  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  <hr style="border-color:rgba(255,255,255,0.1);" />
  <p style="font-size:12px;color:#888;">Vine B Digital Marketing Agency · vinebdigital.store</p>
</body>
</html>`;

  return sendEmailViaResend({
    to: targetEmail,
    subject: '🚀 Resend Pipeline Test — Vine B Digital // 3D Vault',
    html,
    text: 'Test email from Vine B Digital // 3D Vault Resend API pipeline.',
  });
}
