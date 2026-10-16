// =========================================================================
// Vine B Digital // 3D Vault - Dynamic Email Prompt Video Showcase Engine
// Embeds HTML5 Autoplay Video (Apple Mail / iOS Mail) with Web Fallback
// Only links to: https://3dwebprompts-vineb.vercel.app
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

  switch (mode) {
    case 'latest':
      selected = VAULT_CATALOG.find(i => i.id === 'liquid-viscosity-shader') || VAULT_CATALOG[VAULT_CATALOG.length - 1];
      badgeLabel = 'LATEST DROP // 60 FPS';
      categoryLabel = 'NEWEST VAULT RELEASE';
      break;

    case 'most_views':
      selected = VAULT_CATALOG.find(i => i.id === 'hazmat-cyber') || VAULT_CATALOG[0];
      badgeLabel = 'MOST VIEWED // 14.2K';
      categoryLabel = 'TOP VIEWED 3D PROMPT';
      break;

    case 'most_copies':
      selected = VAULT_CATALOG.find(i => i.id === 'luxury-watchmaker') || VAULT_CATALOG[1];
      badgeLabel = 'MOST COPIED // 8.9K';
      categoryLabel = 'BESTSELLER PROMPT';
      break;

    case 'random':
    default: {
      const videoItems = VAULT_CATALOG.filter(i => i.videoUrl && i.videoUrl.endsWith('.mp4'));
      const pool = videoItems.length > 0 ? videoItems : VAULT_CATALOG;
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected = pool[randomIndex];
      badgeLabel = `${selected.fpsBadge || '60 FPS WEBGL'}`;
      categoryLabel = `${selected.category.toUpperCase()} 3D SHOWCASE`;
      break;
    }
  }

  const portalDeepLink = `${BASE_PORTAL_URL}/#portal?prompt=${encodeURIComponent(selected.id)}&orderId=${encodeURIComponent(orderId)}`;

  return {
    item: selected,
    badgeLabel,
    categoryLabel,
    headline: selected.title,
    videoUrl: selected.videoUrl,
    posterUrl: selected.poster,
    clientValue: selected.clientValue,
    tagline: selected.subtitle || selected.description.slice(0, 85) + '...',
    portalDeepLink
  };
}

/**
 * Generates an email-safe, dark-luxury HTML5 video block embedding the real prompt video
 * Features HTML5 Autoplay for supported clients (Apple Mail, iOS Mail, Samsung Mail)
 * and click-to-open fallback for Gmail/Outlook pointing directly to https://3dwebprompts-vineb.vercel.app
 */
export function generateEmailVideoBlockHtml(mode: ShowcaseMode = 'random', orderId: string = '{{order_number}}', customItem?: VaultItem): string {
  const showcase = customItem
    ? {
        item: customItem,
        badgeLabel: customItem.fpsBadge || '60 FPS WEBGL',
        categoryLabel: `${customItem.category.toUpperCase()} 3D SHOWCASE`,
        headline: customItem.title,
        videoUrl: customItem.videoUrl,
        posterUrl: customItem.poster,
        clientValue: customItem.clientValue,
        tagline: customItem.subtitle || customItem.description.slice(0, 85) + '...',
        portalDeepLink: `${BASE_PORTAL_URL}/#portal?prompt=${encodeURIComponent(customItem.id)}&orderId=${encodeURIComponent(orderId)}`
      }
    : getPromptShowcase(mode, orderId);

  return `
<!-- REAL PROJECT PROMPT VIDEO SHOWCASE (HTML5 AUTOPLAY / PORTAL DEEP-LINK) -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#090914" style="background-color: #090914; border: 1px solid #1e1e2f; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
  <tr>
    <td style="padding: 14px 20px; border-bottom: 1px solid #161626; background: rgba(255,255,255,0.02);">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; font-weight: 700; color: #ec4899; text-transform: uppercase; letter-spacing: 0.1em;">
              ${showcase.categoryLabel}
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
        <!-- Fallback for clients without HTML5 video playback (Gmail, webmail) -->
        <a href="${showcase.portalDeepLink}" target="_blank" style="display: block; text-decoration: none; position: relative;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="background: url('${showcase.posterUrl}') center center / cover no-repeat #080812; padding: 48px 16px;">
                <div style="width: 64px; height: 64px; background: rgba(10, 10, 20, 0.88); border: 2px solid #3b82f6; border-radius: 50%; text-align: center; line-height: 64px; display: inline-block; box-shadow: 0 0 30px rgba(59, 130, 246, 0.7); margin-bottom: 14px;">
                  <span style="color: #ffffff; font-size: 24px; padding-left: 5px; line-height: 64px; display: inline-block;">&#9658;</span>
                </div>
                <div style="background: rgba(12, 12, 22, 0.92); border: 1px solid #1e1e2f; border-radius: 6px; padding: 10px 18px; display: inline-block; max-width: 460px;">
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff;">
                    ${showcase.headline}
                  </div>
                  <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #38bdf8; margin-top: 4px;">
                    Valuation: <strong style="color: #10b981;">${showcase.clientValue}</strong> &bull; Click to Play on 3D Vault Website
                  </div>
                </div>
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
              <div style="color: #818cf8; font-size: 12px; margin-top: 10px; text-decoration: underline;">Click to Open on 3D Vault Website &rarr;</div>
            </td>
          </tr>
        </table>
      </a>
      <![endif]-->
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 20px; background-color: #070710; border-top: 1px solid #141422;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td valign="middle" align="left" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            <strong style="color: #cbd5e1;">${showcase.headline}</strong><br />
            ${showcase.tagline}
          </td>
          <td valign="middle" align="right" style="white-space: nowrap; padding-left: 12px;">
            <a href="${showcase.portalDeepLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);">
              ⚡ Copy Prompt on Site &rarr;
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}
