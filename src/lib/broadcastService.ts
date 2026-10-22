// =========================================================================
// APEX3D // Email Broadcast & Campaign Automation Engine
// Full Admin Freedom: Custom HTML, Video Embeds, Themes, Segmentation & Batch Sending
// =========================================================================

import { getAllOrders, LeadOrder } from './leadTracker';
import { sendEmailViaResend, EmailDispatchResult } from './resendEmail';
import { getAdminSettings } from './adminSettings';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

export type BroadcastThemeId =
  | 'cyber_dark'
  | 'royal_indigo'
  | 'clean_light'
  | 'video_showcase'
  | 'raw_custom';

export type AudienceFilter = 'all' | 'paid_only' | 'leads_only' | 'custom';

export interface BroadcastContact {
  email: string;
  name: string;
  phone?: string;
  isPaid: boolean;
  tierName?: string;
  licenseKey?: string;
  source: string;
  orderNumber?: string;
}

export interface BroadcastCampaignRecord {
  id: string;
  subject: string;
  preheader: string;
  theme: BroadcastThemeId;
  contentHtml: string;
  fromName: string;
  targetAudience: AudienceFilter;
  customEmailList?: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  senderEmail: string;
  createdAt: string;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  errorMessage?: string;
}

const BROADCAST_STORAGE_KEY = 'apex3d_broadcast_campaigns_history';

/**
 * Fetch and deduplicate all reachable contacts across orders, leads & Firestore
 */
export function getBroadcastAudience(
  filter: AudienceFilter = 'all',
  customEmailsText: string = ''
): BroadcastContact[] {
  if (filter === 'custom') {
    const rawEmails = customEmailsText
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@') && e.includes('.'));
    const uniqueEmails = Array.from(new Set(rawEmails));
    return uniqueEmails.map((email) => ({
      email,
      name: email.split('@')[0],
      isPaid: false,
      source: 'custom_list',
    }));
  }

  const allOrders = getAllOrders();
  const contactMap = new Map<string, BroadcastContact>();

  // Helper to safely clean email
  const cleanEmail = (raw?: string) => raw?.trim().toLowerCase() || '';

  // Process all orders & leads
  allOrders.forEach((o) => {
    const email = cleanEmail(o.email);
    if (!email || !email.includes('@') || !email.includes('.')) return;

    const isPaid = o.status === 'approved';
    const existing = contactMap.get(email);

    // If already exists, prefer approved / paid record so we preserve license key & tier
    if (existing) {
      if (!existing.isPaid && isPaid) {
        contactMap.set(email, {
          email,
          name: o.name?.trim() || existing.name || 'Creator',
          phone: o.phone || existing.phone,
          isPaid: true,
          tierName: o.tierName || existing.tierName,
          licenseKey: o.licenseKey || existing.licenseKey,
          source: 'order_approved',
          orderNumber: o.orderNumber,
        });
      }
      return;
    }

    contactMap.set(email, {
      email,
      name: o.name?.trim() || 'Creator',
      phone: o.phone,
      isPaid,
      tierName: o.tierName,
      licenseKey: o.licenseKey,
      source: isPaid ? 'order_approved' : (o.status || 'lead_magnet'),
      orderNumber: o.orderNumber,
    });
  });

  const contacts = Array.from(contactMap.values());

  if (filter === 'paid_only') {
    return contacts.filter((c) => c.isPaid);
  }
  if (filter === 'leads_only') {
    return contacts.filter((c) => !c.isPaid);
  }

  return contacts;
}

/**
 * Merge tags replacement engine
 */
export function interpolateMergeTags(
  template: string,
  contact: BroadcastContact
): string {
  const firstName = contact.name ? contact.name.trim().split(' ')[0] : 'Creator';
  const fullName = contact.name?.trim() || 'Creator';
  const licenseKey = contact.licenseKey || 'N/A (Unlock at vinebdigital.store)';
  const portalUrl = 'https://vinebdigital.store/#portal';
  const orderNumber = contact.orderNumber || 'APX-MEMBER';
  const tierName = contact.tierName || '3D WebGL Access';

  return (template || '')
    .replace(/\{\{\s*name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*email\s*\}\}/gi, contact?.email || '')
    .replace(/\{\{\s*license_key\s*\}\}/gi, licenseKey)
    .replace(/\{\{\s*portal_url\s*\}\}/gi, portalUrl)
    .replace(/\{\{\s*order_number\s*\}\}/gi, orderNumber)
    .replace(/\{\{\s*tier_name\s*\}\}/gi, tierName);
}

/**
 * Theme Wrapper Engine: Builds full responsive HTML based on chosen aesthetic
 */
export function buildBroadcastHtml(options: {
  subject: string;
  preheader?: string;
  contentHtml: string;
  theme: BroadcastThemeId;
  contact?: BroadcastContact;
}): string {
  const { subject, preheader = '', contentHtml, theme, contact } = options;

  // In raw_custom mode, don't inject any heavy wrappers if the user provides full html
  if (theme === 'raw_custom') {
    let raw = contentHtml;
    if (contact) {
      raw = interpolateMergeTags(raw, contact);
    }
    if (raw.toLowerCase().includes('<html')) {
      return raw;
    }
    // Minimal standard wrapper to guarantee basic mobile responsiveness
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${raw}
</body>
</html>`;
  }

  // Interpolate merge tags if contact is provided
  const processedContent = contact ? interpolateMergeTags(contentHtml, contact) : contentHtml;
  const currentYear = new Date().getFullYear();

  // Theme-specific styles
  let bgOuter = '#080811';
  let bgInner = '#0f0f1c';
  let borderColor = 'rgba(255, 255, 255, 0.12)';
  let primaryColor = '#38bdf8';
  let headerGradient = 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)';
  let textColor = '#f1f5f9';
  let mutedColor = '#94a3b8';
  let badgeBg = 'rgba(56, 189, 248, 0.12)';
  let badgeColor = '#38bdf8';
  let badgeBorder = 'rgba(56, 189, 248, 0.3)';
  let footerBorder = 'rgba(255, 255, 255, 0.08)';

  if (theme === 'royal_indigo') {
    bgOuter = '#030712';
    bgInner = '#0a1024';
    borderColor = 'rgba(99, 102, 241, 0.25)';
    primaryColor = '#6366f1';
    headerGradient = 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)';
    textColor = '#ffffff';
    mutedColor = '#cbd5e1';
    badgeBg = 'rgba(99, 102, 241, 0.15)';
    badgeColor = '#a5b4fc';
    badgeBorder = 'rgba(99, 102, 241, 0.4)';
    footerBorder = 'rgba(99, 102, 241, 0.15)';
  } else if (theme === 'clean_light') {
    bgOuter = '#f1f5f9';
    bgInner = '#ffffff';
    borderColor = '#e2e8f0';
    primaryColor = '#2563eb';
    headerGradient = 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)';
    textColor = '#0f172a';
    mutedColor = '#475569';
    badgeBg = '#eff6ff';
    badgeColor = '#1d4ed8';
    badgeBorder = '#bfdbfe';
    footerBorder = '#e2e8f0';
  } else if (theme === 'video_showcase') {
    bgOuter = '#050508';
    bgInner = '#101016';
    borderColor = 'rgba(239, 68, 68, 0.3)';
    primaryColor = '#ef4444';
    headerGradient = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
    textColor = '#ffffff';
    mutedColor = '#a1a1aa';
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    badgeColor = '#f87171';
    badgeBorder = 'rgba(239, 68, 68, 0.4)';
    footerBorder = 'rgba(255, 255, 255, 0.08)';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${bgOuter}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${
    preheader
      ? `<div style="display: none; font-size: 1px; color: ${bgOuter}; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>`
      : ''
  }

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bgOuter}; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (600px Max) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: ${bgInner}; border: 1px solid ${borderColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Glow Bar -->
          <tr>
            <td height="4" style="background: ${headerGradient}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 24px 32px 18px 32px; border-bottom: 1px solid ${footerBorder};">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="display: inline-block; font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: ${textColor};">
                      APEX<span style="color: ${primaryColor};">3D</span>
                    </span>
                    <span style="font-size: 11px; font-family: monospace; color: ${mutedColor}; margin-left: 8px; text-transform: uppercase; letter-spacing: 1px;">
                      // Official Broadcast
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 999px; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-weight: 600;">
                      Verified Dispatch
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dynamic Body Content -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.65; color: ${textColor};">
              ${processedContent}
            </td>
          </tr>

          <!-- Footer Enclave -->
          <tr>
            <td style="background-color: ${bgOuter}; padding: 24px 32px; border-top: 1px solid ${footerBorder}; font-size: 12px; line-height: 1.6; color: ${mutedColor}; text-align: center;">
              <div style="font-weight: 600; color: ${textColor}; margin-bottom: 6px;">
                Vine B Digital Engineering &bull; 3D WebGL Vault
              </div>
              <div style="font-size: 11px; margin-bottom: 12px; color: ${mutedColor};">
                UDYAM-UP-29-0208780 &bull; Official Digital Creative Studio
              </div>
              <div style="margin-bottom: 16px;">
                <a href="https://vinebdigital.store/#portal" style="color: ${primaryColor}; text-decoration: none; font-weight: 600; margin: 0 8px;">
                  Access Portal
                </a>
                &bull;
                <a href="https://vinebdigital.store/#catalog" style="color: ${mutedColor}; text-decoration: none; margin: 0 8px;">
                  Vault Catalog
                </a>
                &bull;
                <a href="https://wa.me/918860090791" style="color: #22c55e; text-decoration: none; font-weight: 600; margin: 0 8px;">
                  WhatsApp Support
                </a>
              </div>
              <div style="font-size: 10px; color: ${mutedColor}; opacity: 0.7;">
                &copy; ${currentYear} Vine B Digital. You received this email as a registered creator or customer of APEX 3D.
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
 * Pre-built starter templates for 1-click loading
 */
export const BROADCAST_STARTER_TEMPLATES: {
  id: string;
  name: string;
  theme: BroadcastThemeId;
  subject: string;
  preheader: string;
  description: string;
  content: string;
}[] = [
  {
    id: 'vault_drop',
    name: '🚀 New 3D Prompt Drop & Shaders',
    theme: 'cyber_dark',
    subject: '⚡ 15 New Spatial & GLSL Prompts Added to Your Vault',
    preheader: 'Explore the newly released fluid liquid simulation and particle galaxy prompts.',
    description: 'Announce newly added prompts, Three.js shaders, or vault updates to all users.',
    content: `<h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.5px;">
  Hi {{first_name}}, 15 New Production 3D Prompts Just Dropped! 🚀
</h2>

<p style="color: #cbd5e1; margin-bottom: 20px;">
  We just pushed a massive release to the <strong>APEX 3D Vault</strong>. These prompts are engineered for high-ticket agency deliverables, featuring 60 FPS WebGL, GLSL fluid shaders, and interactive cursor physics.
</p>

<!-- Video / Visual Feature Card -->
<div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 20px; margin: 24px 0;">
  <div style="font-size: 11px; font-family: monospace; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
    ⚡ WHAT'S NEW IN THIS RELEASE:
  </div>
  <ul style="color: #e2e8f0; padding-left: 20px; margin: 0 0 16px 0; line-height: 1.8;">
    <li><strong>Kinetic Liquid Metal Core:</strong> Interactive mouse-repelling mercury physics.</li>
    <li><strong>Next.js 15 App Router:</strong> Clean React Three Fiber + Drei boilerplate.</li>
    <li><strong>Apple-Style 3D Hardware Showcase:</strong> Smooth scroll-triggered product explosion.</li>
    <li><strong>Client Commercial Rights:</strong> Bill $3,000 to $10,000 on your next client pitch.</li>
  </ul>
</div>

<!-- Prompt Terminal Preview -->
<div style="background: #000000; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 16px; margin: 24px 0; font-family: monospace; font-size: 12px; color: #38bdf8; overflow-x: auto;">
  <span style="color: #64748b;">// Sample Terminal Prompt Snippet:</span><br />
  &lt;Canvas camera={{ position: [0, 0, 5], fov: 45 }}&gt;<br />
  &nbsp;&nbsp;&lt;LiquidMetalMesh displacementScale={0.8} speed={1.2} /&gt;<br />
  &lt;/Canvas&gt;
</div>

<!-- CTA Button -->
<div style="text-align: center; margin: 32px 0 20px 0;">
  <a href="{{portal_url}}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 999px; box-shadow: 0 10px 25px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
    Open Your Vault & Copy Prompts &rarr;
  </a>
</div>

<p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
  Your License Key: <code style="color: #94a3b8;">{{license_key}}</code>
</p>`,
  },
  {
    id: 'video_walkthrough',
    name: '🎬 Video Tutorial & Architecture Breakdown',
    theme: 'video_showcase',
    subject: '🎬 Watch: How to Build $5k 3D Websites in 15 Minutes',
    preheader: 'Full step-by-step masterclass breakdown with Three.js & Cursor AI.',
    description: 'Promote a YouTube/Loom video tutorial with a high-converting clickable video thumbnail card.',
    content: `<h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 12px;">
  {{first_name}}, Watch the New 3D Architecture Masterclass 🎬
</h2>

<p style="color: #a1a1aa; margin-bottom: 24px;">
  In this exclusive 12-minute breakdown, we show you how to take raw APEX 3D prompts, paste them into Cursor AI / VS Code, and deploy an award-winning site in under 15 minutes.
</p>

<!-- Clickable Video Card with Play Button -->
<div style="margin: 24px 0; text-align: center;">
  <a href="https://vinebdigital.store/#theater" style="text-decoration: none; display: block; position: relative; border-radius: 14px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.4); background: #000000;">
    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80" alt="Watch Masterclass" style="width: 100%; max-height: 280px; object-fit: cover; display: block; opacity: 0.85;" />
    <div style="background: rgba(15, 15, 20, 0.85); padding: 14px 20px; text-align: left; border-top: 1px solid rgba(255,255,255,0.1);">
      <div style="font-size: 11px; font-family: monospace; color: #ef4444; font-weight: bold; text-transform: uppercase;">
        ▶ PLAY VIDEO &bull; 12:45 MINS
      </div>
      <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 4px;">
        Zero to Production: Building Award-Winning 3D Experiences
      </div>
    </div>
  </a>
</div>

<p style="color: #d4d4d8;">
  <strong>What you will learn in this session:</strong>
</p>
<ul style="color: #a1a1aa; padding-left: 20px; line-height: 1.8;">
  <li>Configuring React Three Fiber with zero camera lag</li>
  <li>Custom GLSL displacement shaders that run at 60 FPS on mobile</li>
  <li>How to present 3D concepts to freelance clients and charge $3,000+</li>
</ul>

<div style="text-align: center; margin: 32px 0 16px 0;">
  <a href="https://vinebdigital.store/#theater" style="display: inline-block; background: #ef4444; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(239,68,68,0.4);">
    Watch Full Masterclass Now &rarr;
  </a>
</div>`,
  },
  {
    id: 'special_offer',
    name: '🔥 Flash Promo / Lifetime VIP Discount',
    theme: 'royal_indigo',
    subject: '🔥 24-Hour VIP Upgrade Deal (Save 50% Today)',
    preheader: 'Unlock Lifetime VIP access to all 3D prompts, repos and priority updates.',
    description: 'Run limited-time flash sales, Black Friday deals, or sprint pass upgrade credits.',
    content: `<div style="text-align: center; margin-bottom: 24px;">
  <span style="display: inline-block; background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.4); font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; letter-spacing: 1px;">
    ⚡ 24-HOUR SPECIAL PROMOTION
  </span>
  <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 16px 0 8px 0; letter-spacing: -0.5px;">
    Hi {{first_name}}, Upgrade to Lifetime VIP at 50% Off!
  </h2>
  <p style="color: #cbd5e1; font-size: 14px; max-width: 480px; margin: 0 auto;">
    Stop worrying about daily copy limits. Get permanent all-access to all current and future 3D prompt architectures.
  </p>
</div>

<!-- Pricing Box -->
<div style="background: rgba(255, 255, 255, 0.03); border: 2px solid #6366f1; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
  <div style="font-size: 12px; font-family: monospace; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">
    LIFETIME VIP COMMERCIAL LICENSE
  </div>
  <div style="margin: 12px 0;">
    <span style="font-size: 18px; color: #64748b; text-decoration: line-through; margin-right: 8px;">₹5,999</span>
    <span style="font-size: 32px; font-weight: 800; color: #ffffff;">₹2,999</span>
    <span style="font-size: 12px; color: #34d399; font-weight: bold; margin-left: 6px;">[ONE-TIME]</span>
  </div>
  <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
    Zero recurring subscriptions. Unlimited prompt copies, full Three.js hardware starter repos, and direct WhatsApp engineer support.
  </p>
  <a href="{{portal_url}}" style="display: inline-block; width: 80%; background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%); color: #ffffff; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);">
    Claim Your Lifetime VIP Access &rarr;
  </a>
</div>

<p style="font-size: 12px; color: #64748b; text-align: center;">
  *Offer valid for the next 24 hours. Your past purchases are automatically credited at checkout.
</p>`,
  },
  {
    id: 'clean_newsletter',
    name: '📰 Clean Minimalist Studio Letter',
    theme: 'clean_light',
    subject: 'Creative Engineering Dispatch: 3 Rules for High-Converting 3D',
    preheader: 'Why most 3D sites lag, and the 3 mathematical optimization rules we follow.',
    description: 'Clean light newsletter theme with high deliverability and easy reading on mobile.',
    content: `<h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
  Hi {{first_name}},
</h2>

<p style="color: #475569; margin-bottom: 16px;">
  Most agencies build 3D websites that crash mobile browsers or drop below 20 FPS. If you are designing for high-paying clients, here are the 3 non-negotiable rules we bake into every APEX 3D prompt:
</p>

<div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0 0 10px 0; color: #0f172a; font-weight: 600;">1. Texture Instancing & Low Polygon Counts</p>
  <p style="margin: 0; font-size: 13px; color: #64748b;">Never load 20MB raw GLTF meshes. Use Draco compression and procedural shaders that calculate light in real-time on the GPU.</p>
</div>

<div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0 0 10px 0; color: #0f172a; font-weight: 600;">2. Mobile Fallback Rendering</p>
  <p style="margin: 0; font-size: 13px; color: #64748b;">Our prompts automatically detect low-power mobile GPUs and scale the pixel ratio down gracefully so touch interactions never stutter.</p>
</div>

<div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0 0 10px 0; color: #0f172a; font-weight: 600;">3. Conversion-Driven Camera Angles</p>
  <p style="margin: 0; font-size: 13px; color: #64748b;">3D shouldn't distract from the offer. The 3D element should physically guide the user's eye directly to your primary CTA button.</p>
</div>

<p style="color: #475569; margin-top: 24px;">
  All of these rules are already pre-programmed inside the prompts in your member portal. Simply copy the prompt and generate:
</p>

<div style="text-align: center; margin: 28px 0;">
  <a href="{{portal_url}}" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
    Open Workstation & View Prompts &rarr;
  </a>
</div>`,
  },
  {
    id: 'blank_canvas',
    name: '🎨 Blank Canvas (100% Raw Custom HTML)',
    theme: 'raw_custom',
    subject: 'Custom Announcement from APEX 3D Studio',
    preheader: 'A message from our executive engineering team.',
    description: 'Full unconstrained HTML freedom. Paste custom templates, embeds, CSS or layouts.',
    content: `<div style="max-width: 600px; margin: 0 auto; background: #0c0d14; color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1); font-family: sans-serif;">
  <h1 style="color: #38bdf8; font-size: 24px; margin-top: 0;">Hello {{name}},</h1>
  <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
    This is a fully customizable raw HTML broadcast template. You have 100% freedom to embed custom CSS, images, video cards, buttons, or custom layouts.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{portal_url}}" style="background: #38bdf8; color: #000000; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block;">
      Explore Portal &rarr;
    </a>
  </div>
</div>`,
  },
];

/**
 * Send a Test Email to Admin's own inbox
 */
export async function sendBroadcastTestEmail(params: {
  testRecipient: string;
  subject: string;
  preheader: string;
  contentHtml: string;
  theme: BroadcastThemeId;
  fromName?: string;
}): Promise<EmailDispatchResult> {
  const { testRecipient, subject, preheader, contentHtml, theme, fromName } = params;

  if (!testRecipient || !testRecipient.includes('@')) {
    return { success: false, message: 'Invalid test recipient email.' };
  }

  const sampleContact: BroadcastContact = {
    name: 'Admin Test User',
    email: testRecipient,
    isPaid: true,
    tierName: 'Lifetime VIP All-Access',
    licenseKey: 'LIC-TEST-XXXX-9999',
    orderNumber: 'APX-TEST-001',
    source: 'admin_test',
  };

  const finalHtml = buildBroadcastHtml({
    subject: `[TEST DRAFT] ${subject}`,
    preheader,
    contentHtml,
    theme,
    contact: sampleContact,
  });

  return sendEmailViaResend({
    to: testRecipient,
    subject: `[TEST PREVIEW] ${subject}`,
    html: finalHtml,
    text: `[TEST PREVIEW]\n\n${subject}\n\nOpen your portal at: https://vinebdigital.store/#portal`,
    from: fromName,
  });
}

/**
 * Dispatch batch broadcast with rate limiting to avoid Resend 429 drops
 */
export async function dispatchBatchBroadcast(params: {
  campaign: Omit<BroadcastCampaignRecord, 'id' | 'createdAt' | 'status' | 'successCount' | 'failureCount'>;
  onProgress?: (sentCount: number, totalCount: number, failedCount: number, currentEmail: string) => void;
}): Promise<BroadcastCampaignRecord> {
  const { campaign, onProgress } = params;
  const contacts = getBroadcastAudience(campaign.targetAudience, campaign.customEmailList);

  const campaignId = `BC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record: BroadcastCampaignRecord = {
    ...campaign,
    id: campaignId,
    createdAt: new Date().toISOString(),
    totalRecipients: contacts.length,
    successCount: 0,
    failureCount: 0,
    status: 'sending',
  };

  if (contacts.length === 0) {
    record.status = 'failed';
    record.errorMessage = 'No valid recipients found for chosen audience filter.';
    await saveBroadcastCampaign(record);
    return record;
  }

  let successCount = 0;
  let failureCount = 0;

  // Process in small batches of 3 to respect Resend API quotas
  const BATCH_SIZE = 3;
  const BATCH_DELAY_MS = 350;

  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const chunk = contacts.slice(i, i + BATCH_SIZE);

    await Promise.all(
      chunk.map(async (contact) => {
        try {
          const personalizedSubject = interpolateMergeTags(campaign.subject, contact);
          const personalizedPreheader = interpolateMergeTags(campaign.preheader || '', contact);
          const personalizedHtml = buildBroadcastHtml({
            subject: personalizedSubject,
            preheader: personalizedPreheader,
            contentHtml: campaign.contentHtml,
            theme: campaign.theme,
            contact,
          });

          const result = await sendEmailViaResend({
            to: contact.email,
            subject: personalizedSubject,
            html: personalizedHtml,
            text: `${personalizedSubject}\n\nVisit: https://vinebdigital.store/#portal`,
            from: campaign.fromName,
          });

          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            console.warn(`[Broadcast] Failed to send to ${contact.email}:`, result.message);
          }
        } catch (err: any) {
          failureCount++;
          console.error(`[Broadcast] Exception sending to ${contact.email}:`, err);
        }

        if (onProgress) {
          onProgress(successCount + failureCount, contacts.length, failureCount, contact.email);
        }
      })
    );

    // Rate-limit throttle delay between batches
    if (i + BATCH_SIZE < contacts.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  record.successCount = successCount;
  record.failureCount = failureCount;
  record.status = failureCount === contacts.length ? 'failed' : 'completed';

  // Save record to local storage & Firestore
  await saveBroadcastCampaign(record);

  return record;
}

/**
 * Save broadcast campaign record to local storage & Firestore
 */
export async function saveBroadcastCampaign(record: BroadcastCampaignRecord): Promise<void> {
  // 1. LocalStorage Cache
  try {
    const raw = localStorage.getItem(BROADCAST_STORAGE_KEY);
    const list: BroadcastCampaignRecord[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((c) => c.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('apex_broadcast_updated', { detail: record }));
  } catch (err) {
    console.error('Failed to cache broadcast to localStorage:', err);
  }

  // 2. Cloud Firestore Persistence
  try {
    const docRef = doc(db, 'email_broadcasts', record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    console.debug('Firestore saveBroadcast error (offline fallback applied):', err);
  }
}

/**
 * Get all past broadcast campaigns
 */
export function getAllBroadcastCampaigns(): BroadcastCampaignRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BROADCAST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Fetch broadcast campaigns from Firestore
 */
export async function fetchCloudBroadcastCampaigns(): Promise<BroadcastCampaignRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'email_broadcasts'));
    const list: BroadcastCampaignRecord[] = [];
    snap.forEach((d) => list.push(d.data() as BroadcastCampaignRecord));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.debug('Failed to fetch broadcast campaigns from Firestore:', err);
    return getAllBroadcastCampaigns();
  }
}

/**
 * Delete a campaign record
 */
export async function deleteBroadcastCampaign(campaignId: string): Promise<void> {
  try {
    const raw = localStorage.getItem(BROADCAST_STORAGE_KEY);
    if (raw) {
      const list: BroadcastCampaignRecord[] = JSON.parse(raw);
      const filtered = list.filter((c) => c.id !== campaignId);
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('apex_broadcast_updated'));
    }
  } catch (err) {
    console.error('Failed to delete broadcast from localStorage:', err);
  }

  try {
    await deleteDoc(doc(db, 'email_broadcasts', campaignId));
  } catch (err) {
    console.debug('Failed to delete broadcast from Firestore:', err);
  }
}
