import { LeadOrder } from './leadTracker';

export interface MarketingCampaign {
  id: string;
  type: 'email' | 'whatsapp' | 'webhook';
  recipientEmail: string;
  recipientPhone?: string;
  recipientName: string;
  orderNumber: string;
  triggerEvent: 'quota_reached_abandon' | 'tier_selected_abandon' | 'cta_clicked_abandon';
  selectedTierName: string;
  originalPrice: number;
  discountedPrice: number;
  subject: string;
  body: string;
  checkoutUrl: string;
  status: 'queued' | 'dispatched' | 'opened';
  dispatchedAt?: string;
}

const MARKETING_STORAGE_KEY = 'apex3d_marketing_campaigns_db';

/**
 * Generate high-converting retargeting email content based on user's exact upgrade activity
 */
export function generateRetargetingEmail(order: LeadOrder): { subject: string; bodyHtml: string; bodyText: string; mailtoUrl: string } {
  const name = order.name.split(' ')[0] || 'Creator';
  const telemetry = order.upgradeTelemetry;
  const selectedTier = telemetry?.lastSelectedTierId || 'month_1';
  
  let targetTierName = '1-Month Pro Access';
  let targetPrice = 299;
  if (selectedTier === 'month_6') {
    targetTierName = '6-Month Studio Growth';
    targetPrice = 699;
  } else if (selectedTier === 'lifetime') {
    targetTierName = 'Lifetime VIP All-Access';
    targetPrice = 2999;
  }

  const creditedAmount = 49;
  const finalPrice = Math.max(0, targetPrice - creditedAmount);
  const checkoutUrl = `https://vinebdigital.store/#portal`;

  const isCtaClicked = (telemetry?.clicksCount || 0) > 0;
  const isQuotaTriggered = telemetry?.triggerReason === 'quota_exceeded';

  let subject = '';
  let headline = '';
  let opening = '';

  if (isCtaClicked) {
    subject = `${name}, complete your upgrade to ${targetTierName} (₹49 credit applied)`;
    headline = `Your workstation upgrade to ${targetTierName} is pending`;
    opening = `We saw you started the upgrade to ${targetTierName} but didn't finish the transaction. Your ₹49 Sprint Pass investment has been credited to your invoice.`;
  } else if (isQuotaTriggered) {
    subject = `${name}, your daily prompt copy threshold reached — unlock higher quota`;
    headline = `Daily prompt quota threshold reached on your Sprint Pass`;
    opening = `You reached your 1 copy/day limit today on your 1-Day Sprint Pass. Don't let your client delivery pause while waiting for midnight.`;
  } else {
    subject = `${name}, exclusive upgrade options for your APEX 3D workstation`;
    headline = `Unlock more prompt copies and production repositories`;
    opening = `You recently explored our workstation upgrade enclave. Here are your personalized pricing options with your ₹49 sprint fee credited:`;
  }

  const bodyText = `Hi ${name},

${opening}

UPGRADE SUMMARY:
- Target Tier: ${targetTierName}
- Standard Price: ₹${targetPrice}
- Sprint Pass Credit: -₹${creditedAmount} (Automatically deducted)
- Final Due: ₹${finalPrice} only

WHAT YOU UNLOCK IMMEDIATELY:
- Higher daily prompt copy threshold (Up to unlimited)
- Full Next.js 15 & React 19 Three.js hardware repositories
- 12+ Awwwards GLSL liquid & displacement shaders
- 100% Commercial Client License to bill $5k+ per project
- Official GST Tax Invoice for business deduction

Resume your workstation session:
${checkoutUrl}

License Key: ${order.licenseKey || 'Available in portal'}
Order ID: ${order.orderNumber}

Need personal support? Reply directly or message us on WhatsApp: +91 8860090791.

Best regards,
APEX 3D Creative Engineering Team
Vine B Digital Marketing Agency`;

  const bodyHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #08080f; color: #f0f0f5; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden;">
  <div style="background: #0d0d16; padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <span style="font-size: 11px; font-family: monospace; color: #f59e0b; text-transform: uppercase; letter-spacing: 2px;">APEX 3D STUDIO RETARGETING</span>
    <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 8px 0 0 0;">${headline}</h1>
  </div>
  <div style="padding: 32px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
    <p>Hi <strong>${name}</strong>,</p>
    <p>${opening}</p>
    
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 11px; font-family: monospace; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">YOUR CREDIT DEDUCTION</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>Plan: <strong>${targetTierName}</strong></span>
        <span style="font-family: monospace;">₹${targetPrice}</span>
      </div>
      <div style="display: flex; justify-content: space-between; color: #10b981; margin-bottom: 12px;">
        <span>1-Day Sprint Credit Applied:</span>
        <span style="font-family: monospace;">-₹${creditedAmount}</span>
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #f59e0b;">
        <span>Final Upgrade Amount:</span>
        <span style="font-family: monospace;">₹${finalPrice} only</span>
      </div>
    </div>

    <p style="font-weight: 600; color: #ffffff;">What You Unlock Immediately:</p>
    <ul style="padding-left: 20px; color: #94a3b8;">
      <li>Higher daily prompt quota (No more 1-copy locks)</li>
      <li>Full Next.js 15 & React 19 Three.js Canvas starter repos</li>
      <li>12+ Awwwards GLSL liquid shaders (60 FPS WebGL)</li>
      <li>100% Commercial Client License to bill $5k+</li>
    </ul>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${checkoutUrl}" style="display: inline-block; background: #f59e0b; color: #000000; font-weight: 700; font-family: monospace; font-size: 13px; text-transform: uppercase; padding: 14px 28px; border-radius: 10px; text-decoration: none; letter-spacing: 1px;">
        Upgrade to ${targetTierName.split(' ')[0]} (₹${finalPrice}) →
      </a>
    </div>
  </div>
  <div style="background: #06060a; padding: 20px 32px; font-size: 11px; font-family: monospace; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
    Order: ${order.orderNumber} · License: ${order.licenseKey || 'N/A'} · WhatsApp Desk: +91 8860090791
  </div>
</div>`;

  const mailtoUrl = `mailto:${encodeURIComponent(order.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  return { subject, bodyHtml, bodyText, mailtoUrl };
}

/**
 * Generate WhatsApp deep-link with personalized copy
 */
export function generateRetargetingWhatsAppUrl(order: LeadOrder, phoneOverride?: string): string {
  const name = order.name.split(' ')[0] || 'Creator';
  const telemetry = order.upgradeTelemetry;
  const selectedTier = telemetry?.lastSelectedTierId || 'month_1';
  const tierName = selectedTier === 'lifetime' ? 'Lifetime VIP' : selectedTier === 'month_6' ? '6-Month Studio' : '1-Month Pro';
  const finalPrice = selectedTier === 'lifetime' ? '₹2,950' : selectedTier === 'month_6' ? '₹650' : '₹250';

  const rawPhone = phoneOverride || order.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const message = `Hello ${name}! 👋
This is from APEX 3D Creative Engineering.

We noticed you explored upgrading your 1-Day Sprint Pass to ${tierName}.
Your ₹49 sprint payment has been credited to your account!

You can upgrade now for only ${finalPrice} (₹49 deducted):
🔗 https://vinebdigital.store/#portal

Includes full Three.js hardware repos, GLSL shaders, and higher daily prompt copies. Let us know if you need help with your checkout!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Save a campaign dispatch record
 */
export function logMarketingDispatch(campaign: Omit<MarketingCampaign, 'id' | 'dispatchedAt'>): MarketingCampaign {
  const record: MarketingCampaign = {
    ...campaign,
    id: `MKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dispatchedAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(MARKETING_STORAGE_KEY);
    const list: MarketingCampaign[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(MARKETING_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('apex_marketing_dispatched', { detail: record }));
  } catch (err) {
    console.error('Failed to log marketing dispatch:', err);
  }

  return record;
}

/**
 * Get all marketing dispatch history
 */
export function getAllMarketingDispatches(): MarketingCampaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MARKETING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
