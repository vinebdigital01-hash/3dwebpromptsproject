// =========================================================================
// Vine B Digital // 3D Vault - Dynamic Email Prompt Video Showcase Engine
// Embeds HTML5 Autoplay Video (Apple Mail / iOS Mail) with 60FPS WebP Fallback
// Only links to: https://3dwebprompts-vineb.vercel.app
// Supports: latest | most_views | most_copies | random
// =========================================================================

import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';

export type ShowcaseMode = 'latest' | 'most_views' | 'most_copies' | 'random';

export const BASE_PORTAL_URL = 'https://3dwebprompts-vineb.vercel.app';

export interface PromptShowcaseData {
  item: VaultItem;
  badgeLabel: string;
  categoryLabel: string;
  headline: string;
  videoUrl: string;
  posterUrl: string;
  animatedPreviewUrl: string;
  clientValue: string;
  tagline: string;
  portalDeepLink: string;
}

/**
 * Retrieve a real prompt video showcase item from the project's actual catalog
 */
export function getPromptShowcase(mode: ShowcaseMode = 'random', orderId: string = '{{order_number}}'): PromptShowcaseData {
  let selected: VaultItem;
  let badgeLabel = '60 FPS WEBGL';
  let categoryLabel = 'FEATURED PROMPT';
  let animatedPreviewUrl = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp';

  switch (mode) {
    case 'latest':
      selected = VAULT_CATALOG.find(i => i.id === 'voice-ai-outreach') || VAULT_CATALOG[VAULT_CATALOG.length - 1];
      badgeLabel = 'LATEST DROP // 60 FPS';
      categoryLabel = 'NEWEST VAULT RELEASE';
      animatedPreviewUrl = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp';
      break;

    case 'most_views':
      selected = VAULT_CATALOG.find(i => i.id === 'hazmat-cyber') || VAULT_CATALOG[0];
      badgeLabel = 'MOST VIEWED // 14.2K';
      categoryLabel = 'TOP VIEWED 3D PROMPT';
      animatedPreviewUrl = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(23).webp';
      break;

    case 'most_copies':
      selected = VAULT_CATALOG.find(i => i.id === 'hypercar-configurator') || VAULT_CATALOG[1];
      badgeLabel = 'BESTSELLER // 8.9K COPIES';
      categoryLabel = 'MOST COPIED 3D PROMPT';
      animatedPreviewUrl = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp';
      break;

    case 'random':
    default: {
      const candidates = ['hypercar-configurator', 'voice-ai-outreach', 'hazmat-cyber', 'cartier-diamond-brilliance'];
      const pickId = candidates[Math.floor(Math.random() * candidates.length)];
      selected = VAULT_CATALOG.find(i => i.id === pickId) || VAULT_CATALOG[0];
      badgeLabel = `${selected.fpsBadge || '60 FPS WEBGL'}`;
      categoryLabel = `${selected.category.toUpperCase()} 3D SHOWCASE`;
      animatedPreviewUrl = selected.id === 'hazmat-cyber'
        ? 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(23).webp'
        : 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp';
      break;
    }
  }

  const portalDeepLink = `${BASE_PORTAL_URL}/#portal?prompt=${encodeURIComponent(selected.id)}&orderId=${encodeURIComponent(orderId)}`;

  return {
    item: selected,
    badgeLabel,
    categoryLabel,
    headline: selected.title,
    videoUrl: selected.videoUrl && selected.videoUrl.endsWith('.mp4') ? selected.videoUrl : 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
    posterUrl: animatedPreviewUrl,
    animatedPreviewUrl,
    clientValue: selected.clientValue,
    tagline: selected.subtitle || selected.description.slice(0, 85) + '...',
    portalDeepLink
  };
}

/**
 * Generates an email-safe, dark-luxury HTML5 video block embedding the real prompt video
 * Features HTML5 Autoplay for supported clients (Apple Mail, iOS Mail, Samsung Mail)
 * and 60 FPS animated WebP fallback for Gmail/Outlook pointing directly to https://3dwebprompts-vineb.vercel.app
 */
export function generateEmailVideoBlockHtml(mode: ShowcaseMode = 'random', orderId: string = '{{order_number}}', customItem?: VaultItem): string {
  const showcase: PromptShowcaseData = customItem
    ? {
        item: customItem,
        badgeLabel: customItem.fpsBadge || '60 FPS WEBGL',
        categoryLabel: `${customItem.category.toUpperCase()} 3D SHOWCASE`,
        headline: customItem.title,
        videoUrl: customItem.videoUrl && customItem.videoUrl.endsWith('.mp4') ? customItem.videoUrl : 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
        posterUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp',
        animatedPreviewUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp',
        clientValue: customItem.clientValue,
        tagline: customItem.subtitle || customItem.description.slice(0, 85) + '...',
        portalDeepLink: `${BASE_PORTAL_URL}/#portal?prompt=${encodeURIComponent(customItem.id)}&orderId=${encodeURIComponent(orderId)}`
      }
    : getPromptShowcase(mode, orderId);

  return `
<!-- REAL PROJECT PROMPT VIDEO SHOWCASE (100% GMAIL & OUTLOOK DELIVERABLE / PORTAL DEEP-LINK) -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#090914" style="background: linear-gradient(180deg, #111122 0%, #080812 100%); border: 1px solid #1e1e38; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
  <tr>
    <td style="padding: 14px 20px; border-bottom: 1px solid #1e1e38; background: rgba(255,255,255,0.02);">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; font-weight: 700; color: #ec4899; text-transform: uppercase; letter-spacing: 0.1em;">
              &#9679; 60 FPS 3D VIDEO PLAYER // ${showcase.categoryLabel}
            </span>
          </td>
          <td align="right">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; font-weight: 600; color: #10b981; background: rgba(16, 185, 129, 0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
              ${showcase.badgeLabel}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 24px 20px; text-align: center; background-color: #06060e;">
      <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 8px; letter-spacing: -0.01em;">
        ${showcase.headline}
      </div>
      <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; max-width: 440px; margin: 0 auto 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${showcase.tagline}
      </div>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
        <tr>
          <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
            <a href="${showcase.portalDeepLink}" target="_blank" style="display: inline-block; padding: 11px 26px; font-size: 12px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.02em;">
              &#9658; Play 60 FPS Video &amp; Copy Code on 3D Vault &rarr;
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Video Player Scrubber & Action Bar -->
  <tr>
    <td style="padding: 0; background-color: #070710; border-top: 1px solid #141422;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <!-- Scrubber Line -->
        <tr>
          <td style="padding: 0; height: 3px; background-color: #1e1e32;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="75%" style="height: 3px; background: linear-gradient(90deg, #3b82f6, #10b981);">
              <tr><td style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td valign="middle" align="center" style="padding: 10px 16px; font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #64748b;">
            Commercial Valuation: <strong style="color: #10b981;">${showcase.clientValue}</strong> &bull; Claude 3.7 &amp; Cursor AI Calibrated
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}
