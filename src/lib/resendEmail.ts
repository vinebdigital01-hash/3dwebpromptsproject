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

// 🔒 STRICT PRODUCTION RATE LIMITS (Prevents Resend daily quota exhaustion)
export const MAX_DAILY_EMAILS_PER_RECIPIENT = 4; // Max 4 emails per day per user
export const MAX_PW_RESET_PER_DAY = 2;          // Max 2 password resets per day separately

/**
 * Check if a recipient has exceeded their daily email limit (max 3-4/day)
 */
export function checkRecipientRateLimit(
  recipientEmail: string,
  limit = MAX_DAILY_EMAILS_PER_RECIPIENT
): { allowed: boolean; remaining: number; resetHours: number } {
  if (typeof window === 'undefined') return { allowed: true, remaining: limit, resetHours: 0 };
  const clean = recipientEmail.trim().toLowerCase();
  const logKey = `apex_email_rate_${clean}`;
  try {
    const raw = localStorage.getItem(logKey);
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    let timestamps: number[] = raw ? JSON.parse(raw) : [];
    timestamps = timestamps.filter((t) => typeof t === 'number' && now - t < windowMs);
    localStorage.setItem(logKey, JSON.stringify(timestamps));

    const remaining = Math.max(0, limit - timestamps.length);
    const oldest = timestamps[0];
    const resetHours = oldest ? Math.ceil((oldest + windowMs - now) / (1000 * 60 * 60)) : 0;

    return {
      allowed: timestamps.length < limit,
      remaining,
      resetHours,
    };
  } catch {
    return { allowed: true, remaining: limit, resetHours: 0 };
  }
}

export function recordRecipientEmailSent(recipientEmail: string): void {
  if (typeof window === 'undefined') return;
  const clean = recipientEmail.trim().toLowerCase();
  const logKey = `apex_email_rate_${clean}`;
  try {
    const raw = localStorage.getItem(logKey);
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    let timestamps: number[] = raw ? JSON.parse(raw) : [];
    timestamps = timestamps.filter((t) => typeof t === 'number' && now - t < windowMs);
    timestamps.push(now);
    localStorage.setItem(logKey, JSON.stringify(timestamps));
  } catch {}
}

/**
 * Check separate Password Reset limit (max 2 per day)
 */
export function checkPasswordResetRateLimit(email: string): { allowed: boolean; remaining: number; resetHours: number } {
  if (typeof window === 'undefined') return { allowed: true, remaining: MAX_PW_RESET_PER_DAY, resetHours: 0 };
  const clean = email.trim().toLowerCase();
  const logKey = `apex_pw_reset_rate_${clean}`;
  try {
    const raw = localStorage.getItem(logKey);
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    let timestamps: number[] = raw ? JSON.parse(raw) : [];
    timestamps = timestamps.filter((t) => typeof t === 'number' && now - t < windowMs);
    localStorage.setItem(logKey, JSON.stringify(timestamps));

    const remaining = Math.max(0, MAX_PW_RESET_PER_DAY - timestamps.length);
    const oldest = timestamps[0];
    const resetHours = oldest ? Math.ceil((oldest + windowMs - now) / (1000 * 60 * 60)) : 0;

    return {
      allowed: timestamps.length < MAX_PW_RESET_PER_DAY,
      remaining,
      resetHours,
    };
  } catch {
    return { allowed: true, remaining: MAX_PW_RESET_PER_DAY, resetHours: 0 };
  }
}

export function recordPasswordResetSent(email: string): void {
  if (typeof window === 'undefined') return;
  const clean = email.trim().toLowerCase();
  const logKey = `apex_pw_reset_rate_${clean}`;
  try {
    const raw = localStorage.getItem(logKey);
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    let timestamps: number[] = raw ? JSON.parse(raw) : [];
    timestamps = timestamps.filter((t) => typeof t === 'number' && now - t < windowMs);
    timestamps.push(now);
    localStorage.setItem(logKey, JSON.stringify(timestamps));
  } catch {}
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
  const customApiKey = settings.resendApiKey?.trim() || '';
  const fromAddress = options.from || settings.resendFromEmail || 'Vine B Digital // 3D Vault <vault@vinebdigital.store>';

  if (!options.to || !options.to.includes('@')) {
    return { success: false, message: 'Invalid recipient email address.' };
  }

  const cleanRecipient = options.to.trim().toLowerCase();

  // Enforce daily rate limit per recipient (max 4 per day)
  const rate = checkRecipientRateLimit(cleanRecipient, MAX_DAILY_EMAILS_PER_RECIPIENT);
  if (!rate.allowed) {
    console.warn(`[Resend Rate Limiter] Suppressed email to ${cleanRecipient}: daily limit of ${MAX_DAILY_EMAILS_PER_RECIPIENT} reached. Resets in ~${rate.resetHours}h.`);
    return {
      success: false,
      message: `Daily email limit of ${MAX_DAILY_EMAILS_PER_RECIPIENT} reached for this recipient. Resets in ~${rate.resetHours}h.`,
    };
  }

  const payload: any = {
    from: fromAddress,
    to: [cleanRecipient],
    subject: options.subject,
    html: options.html,
    text: options.text || options.subject,
  };

  if (customApiKey) {
    payload.apiKey = customApiKey;
  }

  // Dispatch strictly via serverless API endpoint
  try {
    const proxyRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await proxyRes.json().catch(() => ({}));

    if (proxyRes.ok) {
      recordRecipientEmailSent(cleanRecipient);
      return {
        success: true,
        message: `Email dispatched successfully! (ID: ${data.id || 'OK'})`,
        id: data.id,
      };
    } else {
      const errMsg = data.message || `Email dispatch error (${proxyRes.status})`;
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
      message: err.message || 'Network error calling email service.',
    };
  }
}

/**
 * Generate Branded Approval HTML Email (Paid & Verified + Luxury B&W Commercial Invoice)
 */
export function buildApprovalEmailHtml(order: LeadOrder, videoShowcaseMode: ShowcaseMode = 'most_copies'): string {
  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#portal?orderId=${encodeURIComponent(order.id)}`
    : `${BASE_PORTAL_URL}/#portal?orderId=${encodeURIComponent(order.id)}`;

  const invoiceNo = order.invoiceNumber || `INV-2026-${((order.orderNumber || '1001') as string).replace(/\D/g, '').slice(-4) || '8941'}`;
  const licenseKey = order.licenseKey || 'LIC-VIP-ACCESS-ACTIVE';

  const d = order.approvedAt ? new Date(order.approvedAt) : new Date(order.createdAt || Date.now());
  const issueDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const issueTime = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';
  const issueFull = `${issueDate}, ${issueTime}`;

  const numberToWords = (amt: number): string => {
    const map: Record<number, string> = {
      49: 'Forty-Nine Indian Rupees Only',
      250: 'Two Hundred Fifty Indian Rupees Only',
      299: 'Two Hundred Ninety-Nine Indian Rupees Only',
      650: 'Six Hundred Fifty Indian Rupees Only',
      699: 'Six Hundred Ninety-Nine Indian Rupees Only',
      2950: 'Two Thousand Nine Hundred Fifty Indian Rupees Only',
      2999: 'Two Thousand Nine Hundred Ninety-Nine Indian Rupees Only',
    };
    return map[amt] || `${amt.toFixed(2)} Indian Rupees Only`;
  };

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
  <title>Your 3D Vault Pass &amp; Commercial Invoice [${order.orderNumber}]</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text -->
  <div style="display: none; font-size: 1px; color: #06060c; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your payment of ₹${order.amountINR} is verified. Official Commercial Invoice ${invoiceNo} and License Key inside.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #0c0c16; border: 1px solid #242436; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.75);">
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
                Access Granted. Your Pass &amp; Commercial Invoice are Active.
              </h1>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; font-size: 14px; line-height: 1.65; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${order.name}</strong>,<br><br>
              Your payment of <strong style="color: #ffffff;">₹${order.amountINR}</strong> via Slice Merchant UPI (Bank UTR: <span style="font-family: 'SF Mono', monospace; color: #34d399; font-weight: bold;">${order.utrNumber || 'VERIFIED'}</span>) has been reconciled. Your developer pass and official Commercial Invoice have been generated below.
            </td>
          </tr>

          <!-- License Key & Access Box -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" style="background-color: #080812; border: 1px solid rgba(59, 130, 246, 0.35); border-left: 3px solid #10b981; border-radius: 12px; padding: 18px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-family: 'SF Mono', monospace; color: #60a5fa; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px;">
                      OFFICIAL COMMERCIAL LICENSE CERTIFICATE
                    </div>
                    <div style="font-size: 20px; font-family: 'SF Mono', Consolas, monospace; font-weight: 800; color: #ffffff; letter-spacing: 0.08em; -webkit-user-select: all; user-select: all;">
                      ${licenseKey}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
                      Plan: <strong style="color: #e2e8f0;">${order.tierName}</strong> &bull; Valid Until: <strong style="color: #e2e8f0;">${order.expiresAt ? new Date(order.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime VIP (Perpetual / No Expiry)'}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button (One-Click Login Pass) -->
          <tr>
            <td style="padding: 0 32px 28px 32px;" align="center">
              ${buttonHtml}
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: 'SF Mono', monospace;">
                One-click instant login &bull; Session auto-authenticated &bull; No password required
              </div>
            </td>
          </tr>

          <!-- FULL LUXURY BLACK & WHITE COMMERCIAL INVOICE SHEET (EMBEDDED) -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 10px; font-weight: 700; color: #34d399; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px;">
                &#9889; OFFICIAL COMMERCIAL INVOICE RECORD:
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff" style="background-color: #ffffff; color: #18181b; border: 1px solid #d4d4d8; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <!-- Invoice Header Bar -->
                <tr>
                  <td style="padding: 20px 20px 16px 20px; border-bottom: 2px solid #000000;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Logo & Brand Details -->
                        <td align="left" valign="top">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td valign="top" style="padding-right: 12px;">
                                <img src="https://3dwebprompts-vineb.vercel.app/vineb-logo.png" width="48" height="48" alt="Vine B Digital" style="display: block; border: 1px solid #e4e4e7; border-radius: 6px; padding: 2px;" />
                              </td>
                              <td valign="top">
                                <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 14px; font-weight: 900; color: #000000; letter-spacing: -0.01em; text-transform: uppercase;">
                                  VINE B DIGITAL
                                </div>
                                <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 9px; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px;">
                                  MARKETING AGENCY &bull; 3D SYSTEMS
                                </div>
                                <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 9px; color: #71717a; margin-top: 4px; line-height: 1.4;">
                                  MSME Reg: <strong style="color: #000000;">UDYAM-UP-29-0208780</strong><br>
                                  UPI VPA: <strong style="color: #000000;">s5305704393562990@slc</strong><br>
                                  Support: support@vinebdigital.store
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Invoice Badge, No, Date & Exact Time -->
                        <td align="right" valign="top">
                          <span style="display: inline-block; padding: 3px 8px; background-color: #000000; color: #ffffff; font-family: 'SF Mono', monospace; font-size: 9px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px;">
                            COMMERCIAL INVOICE
                          </span>
                          <div style="font-family: 'SF Mono', monospace; font-size: 12px; font-weight: bold; color: #000000;">
                            ${invoiceNo}
                          </div>
                          <div style="font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b; margin-top: 2px;">
                            Ref: <strong>${order.orderNumber}</strong>
                          </div>
                          <div style="font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b; margin-top: 2px;">
                            Date: <strong style="color: #000000;">${issueDate}</strong>
                          </div>
                          <div style="font-family: 'SF Mono', monospace; font-size: 10px; color: #000000; font-weight: bold; margin-top: 2px; background: #f4f4f5; display: inline-block; padding: 1px 4px; border-radius: 3px;">
                            Time: ${issueTime}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 3-Box Meta Details (Billed To, Payment Mode & References, Audit) -->
                <tr>
                  <td style="padding: 14px 20px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Box 1: Billed To -->
                        <td width="33%" valign="top" style="padding-right: 10px;">
                          <div style="font-family: 'SF Mono', monospace; font-size: 9px; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                            BILLED TO
                          </div>
                          <div style="font-size: 12px; font-weight: bold; color: #000000;">
                            ${order.name}
                          </div>
                          <div style="font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b; word-break: break-all; margin-top: 2px;">
                            ${order.email}
                          </div>
                          <div style="font-family: 'SF Mono', monospace; font-size: 10px; color: #71717a; margin-top: 2px;">
                            ${order.phone || 'Phone: N/A'}
                          </div>
                        </td>

                        <!-- Box 2: Payment Mode & Bank Ref UTR -->
                        <td width="34%" valign="top" style="padding: 0 10px; border-left: 1px solid #e4e4e7; border-right: 1px solid #e4e4e7;">
                          <div style="font-family: 'SF Mono', monospace; font-size: 9px; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                            PAYMENT MODE &amp; REF
                          </div>
                          <div style="font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b; line-height: 1.5;">
                            Mode: <strong style="color: #000000;">Slice Merchant UPI</strong><br>
                            Channel: Direct App / QR<br>
                            Bank UTR: <span style="background: #000000; color: #ffffff; padding: 1px 4px; border-radius: 2px; font-weight: bold;">${order.utrNumber || 'VERIFIED'}</span><br>
                            Txn ID: TXN-${(order.id || 'ORDER').slice(-8).toUpperCase()}
                          </div>
                        </td>

                        <!-- Box 3: Audit & Status -->
                        <td width="33%" valign="top" style="padding-left: 10px;">
                          <div style="font-family: 'SF Mono', monospace; font-size: 9px; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                            AUDIT &amp; STATUS
                          </div>
                          <div style="font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b; line-height: 1.5;">
                            Reconciled: <strong style="color: #000000;">${issueTime}</strong><br>
                            Terms: Immediate Settled<br>
                            <span style="display: inline-block; margin-top: 4px; padding: 2px 6px; background-color: #18181b; color: #34d399; font-weight: bold; font-size: 9px; border-radius: 3px;">
                              &#10003; PAID &amp; RECONCILED
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Line Items Table -->
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e4e4e7; border-collapse: collapse;">
                      <thead>
                        <tr bgcolor="#f4f4f5" style="border-bottom: 1px solid #d4d4d8;">
                          <th align="left" style="padding: 8px 10px; font-family: 'SF Mono', monospace; font-size: 9px; color: #3f3f46; text-transform: uppercase;">Item Description</th>
                          <th align="center" style="padding: 8px 6px; font-family: 'SF Mono', monospace; font-size: 9px; color: #3f3f46; text-transform: uppercase;">Category</th>
                          <th align="center" style="padding: 8px 6px; font-family: 'SF Mono', monospace; font-size: 9px; color: #3f3f46; text-transform: uppercase;">Qty</th>
                          <th align="right" style="padding: 8px 10px; font-family: 'SF Mono', monospace; font-size: 9px; color: #3f3f46; text-transform: uppercase;">Unit Price</th>
                          <th align="right" style="padding: 8px 10px; font-family: 'SF Mono', monospace; font-size: 9px; color: #3f3f46; text-transform: uppercase;">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style="border-bottom: 1px solid #e4e4e7;">
                          <td style="padding: 10px; font-size: 11px;">
                            <strong style="color: #000000; font-size: 12px;">${order.tierName}</strong><br>
                            <span style="color: #52525b; font-size: 10px;">500+ Calibrated WebGL Architecture Prompts, Three.js Kits, Claude 3.7 &amp; Cursor AI Blueprints</span><br>
                            <span style="font-family: 'SF Mono', monospace; font-size: 9px; color: #71717a;">License Key: ${licenseKey}</span>
                          </td>
                          <td align="center" style="padding: 10px 6px; font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b;">Digital License</td>
                          <td align="center" style="padding: 10px 6px; font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b;">1</td>
                          <td align="right" style="padding: 10px; font-family: 'SF Mono', monospace; font-size: 10px; color: #52525b;">₹${order.amountINR.toFixed(2)}</td>
                          <td align="right" style="padding: 10px; font-family: 'SF Mono', monospace; font-size: 11px; font-weight: bold; color: #000000;">₹${order.amountINR.toFixed(2)}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e4e4e7; background-color: #fafafa;">
                          <td colspan="4" align="right" style="padding: 6px 10px; font-family: 'SF Mono', monospace; font-size: 10px; color: #71717a;">
                            Subtotal:
                          </td>
                          <td align="right" style="padding: 6px 10px; font-family: 'SF Mono', monospace; font-size: 10px; color: #000000;">
                            ₹${order.amountINR.toFixed(2)}
                          </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e4e4e7; background-color: #fafafa;">
                          <td colspan="4" align="right" style="padding: 6px 10px; font-family: 'SF Mono', monospace; font-size: 10px; color: #71717a;">
                            Applicable Tax / GST (0% &bull; Exempt under MSME):
                          </td>
                          <td align="right" style="padding: 6px 10px; font-family: 'SF Mono', monospace; font-size: 10px; color: #000000;">
                            ₹0.00
                          </td>
                        </tr>
                        <tr bgcolor="#f4f4f5" style="border-top: 2px solid #000000;">
                          <td colspan="4" align="right" style="padding: 8px 10px; font-family: 'SF Mono', monospace; font-size: 11px; font-weight: bold; color: #000000; text-transform: uppercase;">
                            Total Amount Paid:
                          </td>
                          <td align="right" style="padding: 8px 10px; font-family: 'SF Mono', monospace; font-size: 13px; font-weight: 900; color: #000000;">
                            ₹${order.amountINR.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Amount in Words & Portal Print Link -->
                <tr>
                  <td style="padding: 0 20px 14px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 8px 12px;">
                      <tr>
                        <td align="left">
                          <span style="font-family: 'SF Mono', monospace; font-size: 9px; color: #71717a; text-transform: uppercase;">Total in Words:</span>
                          <strong style="font-size: 11px; color: #000000; font-family: sans-serif;">${numberToWords(order.amountINR)}</strong>
                        </td>
                        <td align="right">
                          <a href="${portalUrl}" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 10px; font-weight: bold; color: #2563eb; text-decoration: underline;">
                            &#128424; View &amp; Print High-Res PDF on Portal &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Verification Stamp & Legal Declaration -->
                <tr>
                  <td style="padding: 12px 20px; border-top: 1px solid #e4e4e7; background-color: #fafafa;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left" style="font-family: 'SF Mono', monospace; font-size: 9px; color: #71717a; line-height: 1.4;">
                          <strong>DECLARATION:</strong> Computer-generated commercial invoice &amp; payment receipt.<br>
                          Registered MSME Enterprise: <strong>UDYAM-UP-29-0208780</strong> &bull; Exempt under MSME turnover threshold (CGST Act Sec 22/23). Reconciled with Slice Merchant UPI.
                        </td>
                        <td align="right" style="padding-left: 12px;">
                          <div style="border: 1px solid #000000; padding: 4px 8px; border-radius: 4px; text-align: center; display: inline-block;">
                            <div style="font-family: 'SF Mono', monospace; font-size: 8px; font-weight: bold; color: #000000; letter-spacing: 0.1em; text-transform: uppercase;">
                              &#10003; VINE B DIGITAL
                            </div>
                            <div style="font-family: 'SF Mono', monospace; font-size: 7px; color: #52525b; text-transform: uppercase;">
                              VERIFIED INVOICE
                            </div>
                            <div style="font-family: 'SF Mono', monospace; font-size: 6px; color: #71717a;">
                              MSME: UDYAM-UP-29-0208780
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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

// Memory lock to prevent rapid concurrent duplicate dispatches
const inFlightInstantLeadEmails = new Set<string>();

/**
 * ⚡ Instant Lead Welcome & Starter Pack Email (Lead Magnet / Popup Capture)
 * Dispatched strictly ONCE upon confirmed form submission.
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
  const cleanEmail = lead.email?.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Invalid recipient email' };
  }

  const dedupeKey = `apex_instant_lead_email_${cleanEmail}`;

  // 1. In-flight race-condition protection (blocks parallel requests within same second)
  if (!force && inFlightInstantLeadEmails.has(cleanEmail)) {
    console.warn(`[Resend] Suppressed concurrent duplicate email to ${cleanEmail}`);
    return { success: true, message: 'Email dispatch already in-flight.' };
  }

  // 2. Persistent 24-hour deduplication check in localStorage (survives reloads & autofill)
  if (!force && typeof window !== 'undefined') {
    const lastSent = localStorage.getItem(dedupeKey);
    if (lastSent) {
      const elapsed = Date.now() - parseInt(lastSent, 10);
      if (!isNaN(elapsed) && elapsed < 24 * 60 * 60 * 1000) {
        console.warn(`[Resend] Suppressed duplicate email to ${cleanEmail} (dispatched ${Math.round(elapsed / 1000)}s ago).`);
        return { success: true, message: 'Email already dispatched recently.' };
      }
    }
  }

  // 3. SYNCHRONOUSLY claim lock immediately BEFORE any await or network request!
  inFlightInstantLeadEmails.add(cleanEmail);
  if (typeof window !== 'undefined') {
    localStorage.setItem(dedupeKey, Date.now().toString());
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

  try {
    const subject = `⚡ Your 3D WebGL Starter Pack is Ready [30+ Free Prompts Unlocked]`;
    const result = await sendEmailViaResend({
      to: cleanEmail,
      subject,
      html,
      text: `Hey ${name}, your 3D WebGL Starter Pack is ready! Open your enclave workspace at ${BASE_PORTAL_URL}/#portal`,
    });
    return result;
  } catch (err: any) {
    console.error('Error dispatching starter pack email:', err);
    return { success: false, message: err?.message || 'Failed to dispatch email' };
  } finally {
    // Release in-flight lock after 15 seconds to prevent race conditions from queued microtasks
    setTimeout(() => {
      inFlightInstantLeadEmails.delete(cleanEmail);
    }, 15000);
  }
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
              Need UPI assistance or official invoice copy? Chat directly on WhatsApp:
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
