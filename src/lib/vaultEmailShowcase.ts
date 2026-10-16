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
<!-- REAL PROJECT PROMPT VIDEO SHOWCASE (HTML5 AUTOPLAY / 60FPS WEBP FALLBACK / PORTAL DEEP-LINK) -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#090914" style="background-color: #090914; border: 1px solid #1e1e2f; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
  <tr>
    <td style="padding: 14px 20px; border-bottom: 1px solid #161626; background: rgba(255,255,255,0.02);">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; font-weight: 700; color: #ec4899; text-transform: uppercase; letter-spacing: 0.1em;">
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
    <td align="center" style="padding: 0; background-color: #040408;">
      <!--[if !mso]><!-->
      <video width="100%" height="auto" autoplay="autoplay" muted="muted" loop="loop" playsinline="playsinline" controls="controls" poster="${showcase.posterUrl}" style="display: block; width: 100%; max-width: 536px; border: 0; outline: none; background-color: #000000;">
        <source src="${showcase.videoUrl}" type="video/mp4" />
        <!-- Gmail & Webmail Fallback: Real 60 FPS Animated 3D Preview (Autoplays seamlessly in Gmail) -->
        <a href="${showcase.portalDeepLink}" target="_blank" style="display: block; text-decoration: none; position: relative;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding: 0; line-height: 0; background-color: #000000;">
                <img src="${showcase.animatedPreviewUrl}" alt="${showcase.headline}" width="536" style="display: block; width: 100%; max-width: 536px; height: auto; border: 0;" />
              </td>
            </tr>
          </table>
        </a>
      </video>
      <!--<![endif]-->
      <!--[if mso]>
      <a href="${showcase.portalDeepLink}" target="_blank" style="display: block; text-decoration: none;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" bgcolor="#090914" style="background-color: #090914; padding: 36px 16px;">
              <div style="color: #ffffff; font-size: 20px; font-weight: bold; margin-bottom: 8px;">&#9658; ${showcase.headline}</div>
              <div style="color: #10b981; font-family: 'SF Mono', monospace; font-size: 12px;">Client Value: ${showcase.clientValue}</div>
              <div style="color: #818cf8; font-size: 12px; margin-top: 10px; text-decoration: underline;">&#9889; Play 60 FPS Video & Copy Prompt on 3D Vault &rarr;</div>
            </td>
          </tr>
        </table>
      </a>
      <![endif]-->
    </td>
  </tr>
  <!-- Video Player Scrubber & Action Bar -->
  <tr>
    <td style="padding: 0; background-color: #070710; border-top: 1px solid #141422;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <!-- Scrubber Line -->
        <tr>
          <td colspan="2" style="padding: 0; height: 3px; background-color: #1e1e32;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="68%" style="height: 3px; background: linear-gradient(90deg, #3b82f6, #10b981);">
              <tr><td style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td valign="middle" align="left" style="padding: 14px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            <a href="${showcase.portalDeepLink}" target="_blank" style="text-decoration: none;">
              <strong style="color: #ffffff; font-size: 13px;">${showcase.headline}</strong><br />
              <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #64748b;">
                Valuation: <strong style="color: #10b981;">${showcase.clientValue}</strong> &bull; Click to Play on Site
              </span>
            </a>
          </td>
          <td valign="middle" align="right" style="padding: 14px 20px; white-space: nowrap;">
            <a href="${showcase.portalDeepLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; padding: 9px 18px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4); letter-spacing: 0.01em;">
              &#9889; Play Video &amp; Copy &rarr;
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}
