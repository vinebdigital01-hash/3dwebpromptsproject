// =========================================================================
// Vine B Digital // 3D Vault - Dynamic Email Prompt Video Showcase Engine
// Ultra-Premium Dark Obsidian Design System (Linear / Raycast / Stripe aesthetic)
// 100% Deliverable in Gmail & Outlook (No raw <video> tags, No unverified domains)
// Features Real 3D Prompt Architectures & Verified Unsplash Showcase Posters
// =========================================================================

import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';

export type ShowcaseMode = 'latest' | 'most_views' | 'most_copies' | 'random';

export const BASE_PORTAL_URL = 'https://3dwebprompts-vineb.vercel.app';
export const WHATSAPP_LINK = 'https://wa.me/919717466626';
export const WHATSAPP_DISPLAY = '+91 9717466626';
export const CALL_PHONE_DISPLAY = '+91 8287578025';

export interface PromptShowcaseData {
  item: VaultItem;
  badgeLabel: string;
  categoryLabel: string;
  headline: string;
  posterUrl: string;
  clientValue: string;
  tagline: string;
  portalDeepLink: string;
}

/**
 * Retrieve a real prompt showcase item from the project's actual catalog
 */
export function getPromptShowcase(mode: ShowcaseMode = 'random', orderId: string = '{{order_number}}'): PromptShowcaseData {
  let selected: VaultItem;
  let badgeLabel = '60 FPS WEBGL';
  let categoryLabel = 'FEATURED PROMPT';

  switch (mode) {
    case 'latest':
      selected = VAULT_CATALOG.find(i => i.id === 'voice-ai-outreach') || VAULT_CATALOG[VAULT_CATALOG.length - 1];
      badgeLabel = 'LATEST DROP // 60 FPS';
      categoryLabel = 'NEWEST VAULT RELEASE';
      break;

    case 'most_views':
      selected = VAULT_CATALOG.find(i => i.id === 'hazmat-cyber') || VAULT_CATALOG[0];
      badgeLabel = 'MOST VIEWED // 14.2K';
      categoryLabel = 'TOP VIEWED 3D PROMPT';
      break;

    case 'most_copies':
      selected = VAULT_CATALOG.find(i => i.id === 'hypercar-configurator') || VAULT_CATALOG[1];
      badgeLabel = 'BESTSELLER // 8.9K COPIES';
      categoryLabel = 'MOST COPIED 3D PROMPT';
      break;

    case 'random':
    default: {
      const candidates = ['hazmat-cyber', 'luxury-watchmaker', 'hypercar-configurator', 'apple-espana', 'fintech-liquidity-pool'];
      const pickId = candidates[Math.floor(Math.random() * candidates.length)];
      selected = VAULT_CATALOG.find(i => i.id === pickId) || VAULT_CATALOG[0];
      badgeLabel = selected.fpsBadge || '60 FPS WEBGL';
      categoryLabel = `${selected.category.toUpperCase()} 3D SHOWCASE`;
      break;
    }
  }

  // Ensure safe poster image from Unsplash (100% deliverable across all email clients)
  const posterUrl = selected.poster && selected.poster.startsWith('https://images.unsplash.com')
    ? selected.poster
    : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80';

  const portalDeepLink = `${BASE_PORTAL_URL}/#portal?prompt=${encodeURIComponent(selected.id)}&orderId=${encodeURIComponent(orderId)}`;

  return {
    item: selected,
    badgeLabel,
    categoryLabel,
    headline: selected.title,
    posterUrl,
    clientValue: selected.clientValue,
    tagline: selected.subtitle || selected.description.slice(0, 95) + '...',
    portalDeepLink
  };
}

/**
 * 1. Top Cyber Refraction Accent Bar (3px Tricolor: Blue -> Violet -> Pink)
 */
export function generateEmailAccentBarHtml(): string {
  return `
  <!-- Accent Line (Blue -> Violet -> Pink) -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height: 3px; line-height: 3px; font-size: 0;">
    <tr>
      <td width="33.33%" bgcolor="#3b82f6" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
      <td width="33.33%" bgcolor="#8b5cf6" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
      <td width="33.34%" bgcolor="#ec4899" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
    </tr>
  </table>`;
}

/**
 * 2. Visual Media Poster Card with 60 FPS Badge & Video Link
 */
export function generateEmailVideoBlockHtml(mode: ShowcaseMode = 'random', orderId: string = '{{order_number}}', customItem?: VaultItem): string {
  const showcase: PromptShowcaseData = customItem
    ? {
        item: customItem,
        badgeLabel: customItem.fpsBadge || '60 FPS WEBGL',
        categoryLabel: `${customItem.category.toUpperCase()} 3D SHOWCASE`,
        headline: customItem.title,
        posterUrl: customItem.poster && customItem.poster.startsWith('https://images.unsplash.com')
          ? customItem.poster
          : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        clientValue: customItem.clientValue,
        tagline: customItem.subtitle || customItem.description.slice(0, 95) + '...',
        portalDeepLink: `${BASE_PORTAL_URL}/#portal?prompt=${encodeURIComponent(customItem.id)}&orderId=${encodeURIComponent(orderId)}`
      }
    : getPromptShowcase(mode, orderId);

  return `
<!-- VISUAL PROMPT VIDEO SHOWCASE POSTER (100% GMAIL / OUTLOOK DELIVERABLE) -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#080813" style="background-color: #080813; border: 1px solid #1f1f33; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
  <!-- Header Bar -->
  <tr>
    <td style="padding: 12px 18px; border-bottom: 1px solid #1a1a2e; background-color: #0d0d1c;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.12em;">
              &#9679; 3D VAULT // ${showcase.categoryLabel}
            </span>
          </td>
          <td align="right">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; font-weight: 700; color: #10b981; background-color: rgba(16, 185, 129, 0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
              ${showcase.badgeLabel}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Poster Frame with Play Badge Link -->
  <tr>
    <td style="padding: 0; background-color: #05050a; text-align: center;">
      <a href="${showcase.portalDeepLink}" target="_blank" style="display: block; text-decoration: none; position: relative;">
        <img src="${showcase.posterUrl}" alt="${showcase.headline} 3D WebGL Preview" width="536" border="0" style="display: block; width: 100%; max-width: 536px; height: auto; border: 0; opacity: 0.92;" />
      </a>
    </td>
  </tr>

  <!-- Details & Play Action -->
  <tr>
    <td style="padding: 20px 20px 18px 20px; background-color: #090914;">
      <div style="font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 6px; letter-spacing: -0.01em;">
        ${showcase.headline}
      </div>
      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${showcase.tagline}
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left" valign="middle">
            <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #64748b;">
              SOW Value: <strong style="color: #34d399; font-weight: 700;">${showcase.clientValue}</strong>
            </span>
          </td>
          <td align="right" valign="middle">
            <a href="${showcase.portalDeepLink}" target="_blank" style="display: inline-block; padding: 8px 18px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; font-weight: 700; color: #ffffff; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 6px; text-decoration: none; letter-spacing: 0.02em;">
              &#9658; View 60 FPS Reel &amp; Copy Code &rarr;
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}

/**
 * 3. Terminal Prompt Architecture Blueprint (Syntax-Highlighted Dark Code Window)
 * Showcases the actual prompt instructions calibrated for Claude 3.7 & Cursor AI
 */
export function generateEmailPromptTerminalHtml(customItem?: VaultItem): string {
  const item: VaultItem = customItem || VAULT_CATALOG.find(i => i.id === 'hazmat-cyber') || VAULT_CATALOG[0];

  const promptPreview = `// TARGET ARCHITECTURE: ${item.title}
// STACK: React 19 + Three.js + Custom GLSL Vertex Shader + Tailwind CSS
// CALIBRATION: Claude 3.7 Sonnet & Cursor Agent (Zero Hallucination)
// SOW VALUATION: ${item.clientValue} Client Deliverable

Act as a Principal 3D Creative Technologist (Awwwards Craft).
Build a production-ready WebGL Hero Experience:

1. THREE.JS VIEWPORT & CORE GEOMETRY:
   - Instanced particle dodecahedron with counter-rotating ring lattices
   - Simplex noise vertex displacement: (position + time * 0.4)
   - Dynamic velocity reaction: expands containment radius on pointer drag
2. SHADER ATTRIBUTES & PBR MATERIALS:
   - Tint transition: Electric Royal Blue (#3B82F6) -> Alert Crimson (#FF0055)
   - Subsurface light scattering & transmission (IOR 1.52)
3. PERFORMANCE GUARANTEE:
   - Strict < 18 draw calls via InstancedMesh & shared BufferGeometry
   - Clamped DPR (1.0 - 1.75) for guaranteed 60 FPS mobile/retina performance`;

  return `
<!-- SIGNATURE PROMPT ARCHITECTURE BLUEPRINT TERMINAL -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#05050b" style="background-color: #05050b; border: 1px solid #1a1a2e; border-radius: 12px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <!-- Terminal Window Chrome -->
  <tr>
    <td style="padding: 10px 16px; background-color: #0c0c18; border-bottom: 1px solid #181829;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left" width="60">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #ff5f56; margin-right: 4px;"></span>
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #ffbd2e; margin-right: 4px;"></span>
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #27c93f;"></span>
          </td>
          <td align="center">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; color: #64748b; letter-spacing: 0.05em;">
              prompt-architecture // ${item.id}.glsl.ts
            </span>
          </td>
          <td align="right" width="90">
            <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 9px; font-weight: 700; color: #38bdf8; background-color: rgba(56, 189, 248, 0.12); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.25);">
              CLAUDE 3.7
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Code Body with Syntax Tints -->
  <tr>
    <td style="padding: 16px 18px; font-family: 'SF Mono', Consolas, Monaco, 'Courier New', monospace; font-size: 11px; line-height: 1.65; color: #94a3b8; background-color: #05050b;">
      <div style="color: #64748b; margin-bottom: 8px;">
        <span style="color: #38bdf8;">// ARCHITECTURE BLUEPRINT:</span> ${item.title}<br>
        <span style="color: #38bdf8;">// CALIBRATED FOR:</span> Claude 3.7 Sonnet &amp; Cursor AI<br>
        <span style="color: #34d399;">// COMMERCIAL VALUE:</span> <strong style="color: #34d399;">${item.clientValue} SOW Deliverable</strong>
      </div>
      <div style="background-color: #090914; border-left: 2px solid #3b82f6; padding: 10px 14px; margin: 10px 0; border-radius: 0 6px 6px 0; color: #cbd5e1;">
        <span style="color: #f472b6; font-weight: bold;">Act as Principal 3D Creative Technologist.</span><br>
        Build production-ready, dark-mode WebGL Cyber Hero in React + Three.js:<br>
        &bull; <span style="color: #60a5fa;">Instanced particle dodecahedron</span> with dual counter-rotating ring lattices<br>
        &bull; <span style="color: #a78bfa;">Simplex noise vertex displacement</span> driven by (position + time * 0.4)<br>
        &bull; <span style="color: #fbbf24;">Draw calls clamped &lt; 18</span> via InstancedMesh for locked 60 FPS<br>
        &bull; <span style="color: #34d399;">Mouse-reactive threat pulse</span> with dynamic chromatic aberration
      </div>
      <div style="font-size: 10px; color: #475569; margin-top: 10px; font-family: 'SF Mono', monospace;">
        &bull; Ready to paste into Claude 3.7 or Cursor &bull; 1-Click Copy inside Member Enclave
      </div>
    </td>
  </tr>
</table>
`;
}

/**
 * 4. Agency Math & Economics Comparison Table
 * Demonstrates the massive ROI (₹8k flat 2D vs ₹45k–1.5L 3D vs ₹49 Vault pass)
 */
export function generateEmailAgencyMathHtml(tierPrice: string = '₹49'): string {
  return `
<!-- AGENCY ECONOMICS COMPARISON TABLE -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#0c0c18" style="background-color: #0c0c18; border: 1px solid #242436; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
  <tr>
    <td style="padding: 14px 18px; border-bottom: 1px solid #1a1a2e; background-color: #111122;">
      <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 10px; font-weight: 700; color: #34d399; letter-spacing: 0.12em; text-transform: uppercase;">
        AGENCY MATH // CLIENT REVENUE LEVERAGE
      </span>
    </td>
  </tr>
  <tr>
    <td style="padding: 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <!-- Row 1: Flat 2D -->
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid #161626; color: #94a3b8; font-size: 13px;">
            Standard 2D Landing Page
            <div style="font-size: 10px; color: #475569;">Figma to HTML / basic Webflow</div>
          </td>
          <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #161626; font-family: 'SF Mono', Consolas, monospace; font-size: 13px; color: #64748b;">
            &#8377;8,000 &ndash; &#8377;12,000
          </td>
        </tr>
        <!-- Row 2: 3D WebGL -->
        <tr bgcolor="rgba(16, 185, 129, 0.04)">
          <td style="padding: 12px 18px; border-bottom: 1px solid #161626; color: #ffffff; font-size: 13px; font-weight: 600;">
            Immersive 3D WebGL Experience
            <div style="font-size: 10px; color: #34d399;">Awwwards craft / Interactive PBR shaders</div>
          </td>
          <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #161626; font-family: 'SF Mono', Consolas, monospace; font-size: 14px; font-weight: 700; color: #34d399;">
            &#8377;45,000 &ndash; &#8377;1,50,000+
          </td>
        </tr>
        <!-- Row 3: Vault Sprint Pass -->
        <tr bgcolor="rgba(59, 130, 246, 0.06)">
          <td style="padding: 12px 18px; color: #93c5fd; font-size: 13px; font-weight: bold;">
            3D Vault Pass (Zero 3D Math Needed)
            <div style="font-size: 10px; color: #60a5fa;">500+ Calibrated Prompts for Claude &amp; Cursor</div>
          </td>
          <td align="right" style="padding: 12px 18px; font-family: 'SF Mono', Consolas, monospace; font-size: 16px; font-weight: 800; color: #60a5fa;">
            ${tierPrice}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}

/**
 * 5. Objection Handlers (3 High-Trust Compact Rows)
 */
export function generateEmailObjectionHandlerHtml(): string {
  return `
<!-- OBJECTION HANDLERS & TRUST -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#080812" style="background-color: #080812; border: 1px solid #1a1a2e; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
  <tr>
    <td style="padding-bottom: 12px;">
      <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">
        &#9889; Do I need to know 3D matrix math or WebGL?
      </div>
      <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
        Zero. Every prompt is engineered with camera math, lighting setups, and shaders baked in. Simply paste into Claude 3.7 or Cursor for copy-paste React code.
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 12px; border-top: 1px solid #141424; padding-top: 12px;">
      <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">
        &#128274; Is Slice UPI payment instant and secure?
      </div>
      <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
        100% verified. Pay directly through Google Pay, PhonePe, Paytm, or Slice. We never ask for your PIN or OTP.
      </div>
    </td>
  </tr>
  <tr>
    <td style="border-top: 1px solid #141424; padding-top: 12px;">
      <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">
        &#128172; Need assistance or custom invoice?
      </div>
      <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
        Chat with our agency founder directly on WhatsApp: <a href="${WHATSAPP_LINK}" style="color: #34d399; font-weight: bold; text-decoration: underline;">${WHATSAPP_DISPLAY}</a> (Instant reply).
      </div>
    </td>
  </tr>
</table>
`;
}

/**
 * 6. Bulletproof Primary Action Button (VML + Linear Gradient)
 */
export function generateEmailButtonHtml(label: string, url: string, gradient: string = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
  <tr>
    <td align="center" style="background: ${gradient}; border-radius: 10px; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="20%" stroke="f" fillcolor="#2563eb">
      <w:anchorlock/>
      <center style="color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:bold;">${label}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}" target="_blank" style="display: inline-block; padding: 15px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.02em; border-radius: 10px;">
        ${label}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>
`;
}

/**
 * 7. Standard Luxury Email Footer
 */
export function generateEmailFooterHtml(type: 'transactional' | 'marketing' = 'marketing'): string {
  const unsubscribeBlock = type === 'marketing'
    ? `<div style="margin-top: 12px; font-size: 10px; color: #475569;">
        You received this because you explored the APEX3D Prompt Vault at vinebdigital.store.<br>
        <a href="mailto:support@vinebdigital.store?subject=Unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> &bull;
        <a href="${BASE_PORTAL_URL}" style="color: #64748b; text-decoration: underline;">Manage Preferences</a>
       </div>`
    : '';

  return `
<!-- LUXURY EMAIL FOOTER -->
<tr>
  <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
    <div style="margin-bottom: 6px;">
      Founder Hotline WhatsApp: <a href="${WHATSAPP_LINK}" style="color: #34d399; text-decoration: underline; font-weight: 600;">${WHATSAPP_DISPLAY}</a> &bull;
      Email: <a href="mailto:support@vinebdigital.store" style="color: #60a5fa; text-decoration: underline;">support@vinebdigital.store</a>
    </div>
    <div>
      &copy; 2026 Vine B Digital Marketing Agency &bull; <a href="${BASE_PORTAL_URL}" style="color: #94a3b8; text-decoration: underline;">3dwebprompts-vineb.vercel.app</a>
    </div>
    ${unsubscribeBlock}
  </td>
</tr>
`;
}
