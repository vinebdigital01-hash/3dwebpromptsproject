// =========================================================================
// APEX3D VAULT - Resend Transactional & Lifecycle Email Engine
// Ultra-Premium Dark Obsidian Design System (Linear / Raycast / Stripe aesthetic)
// 100% Deliverable in Gmail & Outlook (No raw <video> tags, No unverified domains)
// =========================================================================

import { LeadOrder } from './leadTracker';
import { getAdminSettings } from './adminSettings';
import {
  generateEmailAccentBarHtml,
  generateEmailVideoBlockHtml,
  generateEmailPromptTerminalHtml,
  generateEmailAgencyMathHtml,
  generateEmailObjectionHandlerHtml,
  generateEmailButtonHtml,
  generateEmailFooterHtml,
  BASE_PORTAL_URL,
  WHATSAPP_LINK,
  WHATSAPP_DISPLAY,
  ShowcaseMode,
} from './vaultEmailShowcase';

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
  const defaultKey = typeof atob !== 'undefined' ? atob('cmVfYWhqanZ0QjdfQzd6RHJyNGRDSHByZ3daY3pSN05QQ2J4') : '';
  const apiKey = settings.resendApiKey?.trim() || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) || defaultKey;
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
 * Generate Branded Approval HTML Email (Paid & Verified)
 */
export function buildApprovalEmailHtml(order: LeadOrder, videoShowcaseMode: ShowcaseMode = 'most_copies'): string {
  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#portal?orderId=${encodeURIComponent(order.id)}`
    : `${BASE_PORTAL_URL}/#portal?orderId=${encodeURIComponent(order.id)}`;

  const accentBar = generateEmailAccentBarHtml();
  const videoBlockHtml = generateEmailVideoBlockHtml(videoShowcaseMode, order.orderNumber);
  const promptTerminal = generateEmailPromptTerminalHtml();
  const buttonHtml = generateEmailButtonHtml('⚡ Launch 3D Vault Member Portal →', portalUrl, 'linear-gradient(135deg, #10b981 0%, #059669 100%)');
  const footerHtml = generateEmailFooterHtml('transactional');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your 3D Vault Pass is Active</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid #242436; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.75);">
          <!-- Top Accent Line -->
          <tr>
            <td>${accentBar}</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-family: 'SF Mono', Consolas, monospace; font-size: 11px; letter-spacing: 0.15em; color: #60a5fa; text-transform: uppercase;">
                      VINE B DIGITAL // 3D VAULT
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 999px; font-size: 10px; font-family: 'SF Mono', monospace; color: #34d399; font-weight: bold;">
                      [PAID &amp; VERIFIED]
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.25;">
                Access Granted. Your Pass is Active.
              </h1>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; font-size: 14px; line-height: 1.65; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${order.name}</strong>,<br><br>
              Your payment of <strong style="color: #ffffff;">₹${order.amountINR}</strong> via UPI (UTR: <span style="font-family: 'SF Mono', monospace; color: #93c5fd;">${order.utrNumber || 'VERIFIED'}</span>) has been reconciled. Your developer pass to the <strong>500+ Calibrated WebGL &amp; Three.js 3D Prompts Vault</strong> has been unlocked.
            </td>
          </tr>

          <!-- License Key Box -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" style="background-color: #080812; border: 1px solid rgba(59, 130, 246, 0.35); border-left: 3px solid #10b981; border-radius: 12px; padding: 18px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-family: 'SF Mono', monospace; color: #60a5fa; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px;">
                      OFFICIAL LICENSE CERTIFICATE
                    </div>
                    <div style="font-size: 20px; font-family: 'SF Mono', Consolas, monospace; font-weight: 800; color: #ffffff; letter-spacing: 0.08em; -webkit-user-select: all; user-select: all;">
                      ${order.licenseKey || 'LIC-PRO-ACCESS-ACTIVE'}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
                      Plan: <strong style="color: #e2e8f0;">${order.tierName}</strong> &bull; Valid Until: <strong style="color: #e2e8f0;">${order.expiresAt ? new Date(order.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime VIP (No Expiry)'}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 0 32px 28px 32px;" align="center">
              ${buttonHtml}
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: 'SF Mono', monospace;">
                One-click instant login &bull; No password required
              </div>
            </td>
          </tr>

          <!-- Prompt Architecture Blueprint -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px;">
                &#9889; READY TO USE IN MEMBER PORTAL:
              </div>
              ${promptTerminal}
            </td>
          </tr>

          <!-- Real Project Prompt Video Showcase -->
          <tr>
            <td style="padding: 0 32px;">
              ${videoBlockHtml}
            </td>
          </tr>

          <!-- Order Summary Details -->
          <tr>
            <td style="padding: 20px 32px; background-color: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #9ca3af;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="padding-bottom: 6px;">Order Number:</td>
                  <td align="right" style="color: #ffffff; font-family: 'SF Mono', monospace;">${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 6px;">Tax Invoice:</td>
                  <td align="right" style="color: #ffffff; font-family: 'SF Mono', monospace;">${order.invoiceNumber || 'INV-2026-TAX'}</td>
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
          ${footerHtml}
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
  const accentBar = generateEmailAccentBarHtml();
  const footerHtml = generateEmailFooterHtml('transactional');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Required: Payment Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0c0c16; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.7);">
          <tr>
            <td>${accentBar}</td>
          </tr>
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', monospace; font-size: 11px; letter-spacing: 0.15em; color: #ef4444; text-transform: uppercase;">
                      VINE B DIGITAL // PAYMENT RECONCILIATION
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 999px; font-size: 10px; font-family: 'SF Mono', monospace; color: #f87171; font-weight: bold;">
                      [ACTION REQUIRED]
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 12px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                Verification Issue: Order #${order.orderNumber}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${order.name}</strong>,<br><br>
              Our billing team reviewed your submitted UPI reference (<strong>${order.utrNumber || 'N/A'}</strong>) for the <strong>${order.tierName}</strong> (₹${order.amountINR}), but was unable to match the credit in our bank statement:
              <br><br>
              <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 14px; color: #fca5a5; font-size: 12px; font-family: 'SF Mono', monospace;">
                Reason: ${reason || 'Payment reference could not be located in bank statement.'}
              </div>
              <br>
              If you already completed the payment, please reply to this email with your UPI receipt or WhatsApp our founder at <a href="${WHATSAPP_LINK}" style="color: #34d399; font-weight: bold; text-decoration: underline;">${WHATSAPP_DISPLAY}</a> with your 12-digit UTR number. We will manually approve your access immediately.
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 28px 32px;" align="center">
              <a href="${BASE_PORTAL_URL}" style="display: inline-block; padding: 13px 30px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: bold;">
                Re-submit Correct UTR &rarr;
              </a>
            </td>
          </tr>
          ${footerHtml}
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
    text: `Hey ${order.name}, your payment for ${order.tierName} (₹${order.amountINR}) has been approved! License: ${order.licenseKey || 'ACTIVE'}. Log in at ${BASE_PORTAL_URL}/#portal?orderId=${order.id}`,
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
  const accentBar = generateEmailAccentBarHtml();
  const promptTerminal = generateEmailPromptTerminalHtml();
  const videoBlockHtml = generateEmailVideoBlockHtml('most_views', 'TEST-001');
  const footerHtml = generateEmailFooterHtml('marketing');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resend Pipeline Test</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid #242436; border-radius: 16px; overflow: hidden;">
          <tr><td>${accentBar}</td></tr>
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="color: #60a5fa; margin: 0 0 10px 0;">🚀 Vine B Digital // 3D Vault - Resend Pipeline Active</h2>
              <p style="color: #9ca3af; font-size: 14px;">Your transactional email delivery pipeline is verified and fully operational.</p>
            </td>
          </tr>
          <tr><td style="padding: 0 32px;">${promptTerminal}</td></tr>
          <tr><td style="padding: 0 32px;">${videoBlockHtml}</td></tr>
          ${footerHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmailViaResend({
    to: targetEmail,
    subject: '🚀 Resend Pipeline Test — Vine B Digital // 3D Vault',
    html,
    text: 'Test email from Vine B Digital // 3D Vault Resend API pipeline.',
  });
}

/**
 * ⚡ Instant Lead Welcome & Starter Pack Email (Lead Magnet / Popup Capture)
 * Dispatched automatically as soon as user types email into popup or checkout
 */
export async function sendInstantLeadMagnetOrAbandonedEmail(
  lead: {
    name?: string;
    email: string;
    phone?: string;
    tierId?: string;
    tierName?: string;
  },
  force = false
): Promise<EmailDispatchResult> {
  if (!lead.email || !lead.email.includes('@')) {
    return { success: false, message: 'Invalid email' };
  }

  const dedupeKey = `apex_instant_lead_email_${lead.email.trim().toLowerCase()}`;
  if (!force && typeof window !== 'undefined' && sessionStorage.getItem(dedupeKey)) {
    return { success: true, message: 'Email already dispatched recently.' };
  }

  const name = lead.name?.trim() || 'Creator';
  const portalUrl = `${BASE_PORTAL_URL}/#portal`;
  const pricingUrl = `${BASE_PORTAL_URL}/#pricing`;

  const accentBar = generateEmailAccentBarHtml();
  const promptTerminal = generateEmailPromptTerminalHtml();
  const videoBlockHtml = generateEmailVideoBlockHtml('latest', 'STARTER-VAULT');
  const agencyMath = generateEmailAgencyMathHtml('₹49');
  const objections = generateEmailObjectionHandlerHtml();
  const buttonHtml = generateEmailButtonHtml('⚡ Open Developer Enclave &amp; Copy Prompts &rarr;', portalUrl, 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)');
  const footerHtml = generateEmailFooterHtml('marketing');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your 3D WebGL Starter Pack is Ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <div style="display: none; font-size: 1px; color: #06060c; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your 30+ Calibrated WebGL prompts for Claude 3.7 & Cursor AI are provisioned. Open your free enclave.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid #242436; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.75);">
          <tr><td>${accentBar}</td></tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; letter-spacing: 0.15em; color: #60a5fa; text-transform: uppercase;">
                      VINE B DIGITAL // 3D VAULT
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 999px; font-size: 10px; font-family: 'SF Mono', monospace; color: #93c5fd; font-weight: bold;">
                      [STARTER PACK UNLOCKED]
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.25;">
                Your 3D WebGL Starter Pack is Ready ⚡
              </h1>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; font-size: 14px; line-height: 1.65; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${name}</strong>,<br><br>
              We noticed you explored the <strong>APEX3D WebGL Prompt Vault</strong>! We've prepared your starter developer package containing <strong>30+ production Three.js, React Three Fiber, and custom GLSL shader blueprints</strong>.
              <br><br>
              Your member enclave workspace has been provisioned with <strong>1 free daily prompt copy</strong>. Inspect the live architecture below:
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 0 32px 24px 32px;" align="center">
              ${buttonHtml}
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: 'SF Mono', monospace;">
                Or unlock full 500+ Vault Pass from ₹49: <a href="${pricingUrl}" style="color: #60a5fa; text-decoration: underline;">View Pricing</a>
              </div>
            </td>
          </tr>

          <!-- Signature Prompt Blueprint Terminal Window -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px;">
                &#9889; FEATURED PROMPT ARCHITECTURE PREVIEW:
              </div>
              ${promptTerminal}
            </td>
          </tr>

          <!-- Real Project Prompt Video Showcase Poster -->
          <tr>
            <td style="padding: 0 32px;">
              ${videoBlockHtml}
            </td>
          </tr>

          <!-- Agency Economics Comparison -->
          <tr>
            <td style="padding: 0 32px;">
              ${agencyMath}
            </td>
          </tr>

          <!-- Objection Handlers -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              ${objections}
            </td>
          </tr>

          <!-- Footer -->
          ${footerHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const subject = `⚡ Your 3D WebGL Starter Pack is Ready [30+ Free Prompts Unlocked]`;
  const result = await sendEmailViaResend({
    to: lead.email,
    subject,
    html,
    text: `Hey ${name}, your 3D WebGL Starter Pack is ready! Open your enclave workspace at ${BASE_PORTAL_URL}/#portal`,
  });

  if (result.success && typeof window !== 'undefined') {
    sessionStorage.setItem(dedupeKey, 'true');
  }

  return result;
}

/**
 * ⚡ Send Cart Recovery / Dropout Follow-up Email (Email 4 in Lifecycle)
 * Dispatched automatically or manually from Admin Console
 */
export async function sendCartRecoveryEmail(lead: {
  name?: string;
  email: string;
  phone?: string;
  tierName?: string;
  amountINR?: number;
  orderNumber?: string;
}): Promise<EmailDispatchResult> {
  if (!lead.email || !lead.email.includes('@')) {
    return { success: false, message: 'Invalid recipient email.' };
  }

  const name = lead.name?.trim() || 'Developer';
  const tierName = lead.tierName || '1-Day Sprint Pass';
  const amount = lead.amountINR ? `₹${lead.amountINR}` : '₹49';
  const orderNumber = lead.orderNumber || 'REC-7492';
  const checkoutUrl = `${BASE_PORTAL_URL}/#pricing?tier=day_pass&email=${encodeURIComponent(lead.email)}`;

  const accentBar = generateEmailAccentBarHtml();
  const promptTerminal = generateEmailPromptTerminalHtml();
  const videoBlockHtml = generateEmailVideoBlockHtml('most_views', orderNumber);
  const agencyMath = generateEmailAgencyMathHtml(amount);
  const objections = generateEmailObjectionHandlerHtml();
  const buttonHtml = generateEmailButtonHtml(`⚡ Unlock 3D Vault Pass for ${amount} &rarr;`, checkoutUrl, 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)');
  const footerHtml = generateEmailFooterHtml('marketing');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick question about your 3D Vault pass</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text -->
  <div style="display: none; font-size: 1px; color: #06060c; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your selection is saved. 500+ Calibrated WebGL prompts for Claude 3.7 & Cursor AI.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid #242436; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.75);">
          <!-- Top Accent Line -->
          <tr><td>${accentBar}</td></tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; letter-spacing: 0.15em; color: #60a5fa; text-transform: uppercase;">
                      VINE B DIGITAL // 3D VAULT
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 999px; font-size: 10px; font-family: 'SF Mono', monospace; color: #93c5fd; font-weight: bold;">
                      [CHECKOUT SAVED]
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.25;">
                Quick question about your 3D Vault pass, ${name}
              </h1>
            </td>
          </tr>

          <!-- Body Copy -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; font-size: 14px; line-height: 1.65; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${name}</strong>,<br><br>
              Looks like your checkout for the <strong style="color: #60a5fa;">${tierName}</strong> (${amount}) was interrupted. We saved your checkout configuration and held your spot so you don't lose the introductory pricing.<br><br>
              Every prompt in the vault is built for high-ticket client deliverables in the <strong>$15k to $40k range</strong>. You don't write shader matrix math by hand &mdash; you copy the blueprint straight into <strong>Claude 3.7 Sonnet or Cursor AI</strong> to generate production Three.js code in 60 seconds.
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 4px 32px 24px 32px;" align="center">
              ${buttonHtml}
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: 'SF Mono', monospace;">
                Instant UPI verification via Slice Merchant &bull; Access unlocks immediately
              </div>
            </td>
          </tr>

          <!-- Visual Prompt Video Showcase Poster -->
          <tr>
            <td style="padding: 0 32px;">
              ${videoBlockHtml}
            </td>
          </tr>

          <!-- Signature Prompt Architecture Blueprint Terminal Window -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px;">
                &#9889; LIVE VAULT PROMPT ARCHITECTURE PREVIEW:
              </div>
              ${promptTerminal}
            </td>
          </tr>

          <!-- Agency Economics Comparison Table -->
          <tr>
            <td style="padding: 0 32px;">
              ${agencyMath}
            </td>
          </tr>

          <!-- Objection Handlers -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              ${objections}
            </td>
          </tr>

          <!-- Secondary WhatsApp Assistance -->
          <tr>
            <td style="padding: 0 32px 24px 32px; text-align: center; font-size: 12px; color: #64748b;">
              Need UPI assistance or custom corporate GST invoice? Chat directly on WhatsApp:
              <a href="${WHATSAPP_LINK}" style="color: #34d399; font-weight: bold; text-decoration: underline;">${WHATSAPP_DISPLAY}</a>
            </td>
          </tr>

          <!-- Footer -->
          ${footerHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const subject = `Quick question about your 3D Vault pass, ${name}`;
  return sendEmailViaResend({
    to: lead.email,
    subject,
    html,
    text: `Hey ${name}, looks like your checkout for ${tierName} was interrupted. Your selection is saved. Complete your access at ${BASE_PORTAL_URL}/#pricing or WhatsApp us at ${WHATSAPP_DISPLAY}.`,
  });
}
