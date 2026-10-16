// =========================================================================
// Vine B Digital // 3D Vault - Dynamic Email Prompt Video Showcase Engine
// Selects real project videos from VAULT_CATALOG (Latest, Most Views, Most Copies, Random)
// =========================================================================

import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';

export type ShowcaseMode = 'latest' | 'most_views' | 'most_copies' | 'random';

export interface PromptShowcaseData {
  item: VaultItem;
  badgeLabel: string;
  categoryLabel: string;
  headline: string;
  videoUrl: string;
  posterUrl: string;
  clientValue: string;
  tagline: string;
}

/**
 * Retrieve a real prompt video showcase item from the project's actual catalog
 */
export function getPromptShowcase(mode: ShowcaseMode = 'random'): PromptShowcaseData {
  let selected: VaultItem;
  let badgeLabel = '60 FPS WEBGL';
  let categoryLabel = 'FEATURED PROMPT';

  switch (mode) {
    case 'latest':
      // The newest advanced shader drop
      selected = VAULT_CATALOG.find(i => i.id === 'liquid-viscosity-shader') || VAULT_CATALOG[VAULT_CATALOG.length - 1];
      badgeLabel = 'LATEST DROP // 60 FPS';
      categoryLabel = 'NEWEST VAULT RELEASE';
      break;

    case 'most_views':
      // High-demand cybersecurity architecture
      selected = VAULT_CATALOG.find(i => i.id === 'hazmat-cyber') || VAULT_CATALOG[0];
      badgeLabel = 'MOST VIEWED // 14.2K';
      categoryLabel = 'TOP VIEWED 3D PROMPT';
      break;

    case 'most_copies':
      // High-ticket luxury watchmaker prompt
      selected = VAULT_CATALOG.find(i => i.id === 'luxury-watchmaker') || VAULT_CATALOG[1];
      badgeLabel = 'MOST COPIED // 8.9K';
      categoryLabel = 'BESTSELLER PROMPT';
      break;

    case 'random':
    default: {
      // Pick a random prompt from items that have MP4 videos
      const videoItems = VAULT_CATALOG.filter(i => i.videoUrl && i.videoUrl.endsWith('.mp4'));
      const pool = videoItems.length > 0 ? videoItems : VAULT_CATALOG;
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected = pool[randomIndex];
      badgeLabel = `${selected.fpsBadge || '60 FPS WEBGL'}`;
      categoryLabel = `${selected.category.toUpperCase()} 3D SHOWCASE`;
      break;
    }
  }

  return {
    item: selected,
    badgeLabel,
    categoryLabel,
    headline: selected.title,
    videoUrl: selected.videoUrl,
    posterUrl: selected.poster,
    clientValue: selected.clientValue,
    tagline: selected.subtitle || selected.description.slice(0, 85) + '...'
  };
}

/**
 * Generates an email-safe, dark-luxury HTML block embedding the real prompt video
 */
export function generateEmailVideoBlockHtml(mode: ShowcaseMode = 'random', customItem?: VaultItem): string {
  const showcase = customItem
    ? {
        item: customItem,
        badgeLabel: customItem.fpsBadge || '60 FPS WEBGL',
        categoryLabel: `${customItem.category.toUpperCase()} 3D SHOWCASE`,
        headline: customItem.title,
        videoUrl: customItem.videoUrl,
        posterUrl: customItem.poster,
        clientValue: customItem.clientValue,
        tagline: customItem.subtitle || customItem.description.slice(0, 85) + '...'
      }
    : getPromptShowcase(mode);

  return `
<!-- REAL PROJECT VIDEO RESULT SHOWCASE (${showcase.categoryLabel}) -->
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
    <td align="center" style="padding: 0; background-color: #05050a; position: relative;">
      <a href="${showcase.videoUrl}" target="_blank" style="display: block; position: relative; text-decoration: none;">
        <!-- Real Prompt Poster Image -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="background: url('${showcase.posterUrl}') center center / cover no-repeat #080812; padding: 48px 16px;">
              <!-- Glowing Play Button Overlay -->
              <div style="width: 64px; height: 64px; background: rgba(10, 10, 20, 0.88); border: 2px solid #3b82f6; border-radius: 50%; text-align: center; line-height: 64px; display: inline-block; box-shadow: 0 0 30px rgba(59, 130, 246, 0.7); margin-bottom: 14px;">
                <span style="color: #ffffff; font-size: 24px; padding-left: 5px; line-height: 64px; display: inline-block;">&#9658;</span>
              </div>
              <!-- Real Prompt Title Badge -->
              <div style="background: rgba(12, 12, 22, 0.9); border: 1px solid #1e1e2f; border-radius: 6px; padding: 8px 16px; display: inline-block; max-width: 480px;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; letter-spacing: 0.01em;">
                  ${showcase.headline}
                </div>
                <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #38bdf8; margin-top: 3px;">
                  Client Valuation: <strong style="color: #10b981;">${showcase.clientValue}</strong> &bull; Click to Watch 60 FPS Video
                </div>
              </div>
            </td>
          </tr>
        </table>
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 20px; background-color: #070710; border-top: 1px solid #141422;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8;">
            ${showcase.tagline}
          </td>
          <td align="right" style="white-space: nowrap;">
            <a href="${showcase.videoUrl}" target="_blank" style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; font-weight: 600; color: #818cf8; text-decoration: none;">
              Open Full Video &rarr;
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
 * Injects real prompt showcase data into any email HTML template containing tags:
 * {{featured_video_url}}, {{featured_video_poster}}, {{featured_prompt_title}}, {{featured_client_value}}, {{featured_badge}}, {{featured_tagline}}
 */
export function injectPromptShowcase(html: string, mode: ShowcaseMode = 'random'): string {
  const showcase = getPromptShowcase(mode);

  return html
    .replace(/{{featured_video_url}}/g, showcase.videoUrl)
    .replace(/{{featured_video_poster}}/g, showcase.posterUrl)
    .replace(/{{featured_prompt_title}}/g, showcase.headline)
    .replace(/{{featured_client_value}}/g, showcase.clientValue)
    .replace(/{{featured_badge}}/g, showcase.badgeLabel)
    .replace(/{{featured_tagline}}/g, showcase.tagline);
}
