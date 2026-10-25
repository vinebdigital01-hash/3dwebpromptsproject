// ==========================================
// Vercel Serverless Function & Cron Worker
// Automatic Drip Follow-ups (Day 1 & Day 2) via Resend API
// Ultra-Premium Dark Obsidian Design System (Linear / Raycast / Stripe aesthetic)
// 100% Deliverable in Gmail & Outlook (No raw <video> tags, No unverified domains)
// ==========================================

export interface FollowupLeadInfo {
  name: string;
  email: string;
  phone?: string;
  tierId: string;
  tierName: string;
  amountINR: number;
  orderNumber?: string;
}

const SITE_URL = 'https://3dwebprompts-vineb.vercel.app';
const WHATSAPP_LINK = 'https://wa.me/919717466626';
const WHATSAPP_DISPLAY = '+91 9717466626';
const CALL_PHONE_DISPLAY = '+91 8287578025';

function buildDay1Email(lead: FollowupLeadInfo): string {
  const checkoutUrl = `${SITE_URL}/#pricing?tier=${encodeURIComponent(lead.tierId || 'day_pass')}&email=${encodeURIComponent(lead.email)}`;
  const portalUrl = `${SITE_URL}/#portal`;
  const name = lead.name?.trim() || 'Creator';
  const tierName = lead.tierName || '1-Day Sprint Pass';
  const amount = lead.amountINR ? `₹${lead.amountINR}` : '₹49';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How agencies are charging ₹45,000+ for 3D websites</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; font-size: 1px; color: #06060c; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    How agencies charge ₹45,000+ for 3D WebGL sites with zero math. Calibrated prompt blueprints for Claude 3.7 & Cursor.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid #242436; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.75);">
          <!-- Top Accent Line -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height: 3px; line-height: 3px; font-size: 0;">
                <tr>
                  <td width="33.33%" bgcolor="#3b82f6" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                  <td width="33.33%" bgcolor="#8b5cf6" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                  <td width="33.34%" bgcolor="#ec4899" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; letter-spacing: 0.15em; color: #60a5fa; text-transform: uppercase;">
                      VINE B DIGITAL // AGENCY VALUE DROP
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 999px; font-size: 10px; font-family: 'SF Mono', monospace; color: #34d399; font-weight: bold;">
                      [ROI BREAKDOWN]
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.25;">
                How agencies are charging ₹45,000+ for 3D interactive websites
              </h1>
            </td>
          </tr>

          <!-- Body Copy -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; font-size: 14px; line-height: 1.65; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${name}</strong>,<br><br>
              A standard 2D flat landing page sells for ₹8,000 &ndash; ₹12,000. Clients haggle, revisions take weeks, and competition is fierce.<br><br>
              But when you present an <strong>interactive 3D WebGL hero or photorealistic PBR product turntable</strong>, clients immediately perceive enterprise agency craft and readily pay <strong style="color: #34d399;">₹45,000 to ₹1,50,000+</strong> ($15,000+ on global contracts).
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 4px 32px 24px 32px;" align="center">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 10px; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);">
                    <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.02em;">
                      ⚡ Unlock Your 3D Vault Pass for ${amount} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: 'SF Mono', monospace;">
                500+ Calibrated Prompts &bull; Instant Slice UPI Activation
              </div>
            </td>
          </tr>

          <!-- Visual Poster Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#080813" style="background-color: #080813; border: 1px solid #1f1f33; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #1a1a2e; background-color: #0d0d1c;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left">
                          <span style="font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase;">
                            &#9679; FEATURED SHOWCASE // LUXURY HOROLOGY
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            PBR TITANIUM 60FPS
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0; background-color: #05050a; text-align: center;">
                    <a href="${portalUrl}" target="_blank" style="display: block;">
                      <img src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&auto=format&fit=crop&q=80" alt="Luxury Watchmaker 3D Preview" width="536" border="0" style="display: block; width: 100%; max-width: 536px; height: auto; border: 0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: #090914;">
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
                      Luxury Watchmaker 3D One-Shot (Rolex/Audemars style)
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px;">
                      Precision horology turntable with anisotropic brushed titanium textures, sapphire crystal refraction, and ticking complication gears.
                    </div>
                    <div style="font-family: 'SF Mono', monospace; font-size: 11px; color: #64748b;">
                      SOW Commercial Value: <strong style="color: #34d399;">$18,000 Client Contract</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signature Prompt Blueprint Terminal Window -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#05050b" style="background-color: #05050b; border: 1px solid #1a1a2e; border-radius: 12px; overflow: hidden;">
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
                          <span style="font-family: 'SF Mono', monospace; font-size: 11px; color: #64748b;">
                            terminal // watchmaker-turntable.glsl.ts
                          </span>
                        </td>
                        <td align="right" width="90">
                          <span style="font-family: 'SF Mono', monospace; font-size: 9px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.25);">
                            CLAUDE 3.7
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 18px; font-family: 'SF Mono', Consolas, monospace; font-size: 11px; line-height: 1.6; color: #94a3b8;">
                    <div style="color: #64748b; margin-bottom: 6px;">
                      <span style="color: #38bdf8;">// STACK:</span> React 19 + Three.js + Physical Shaders<br>
                      <span style="color: #34d399;">// CLIENT CONTRACT:</span> $18,000 SOW
                    </div>
                    <div style="background-color: #090914; border-left: 2px solid #3b82f6; padding: 10px 14px; margin: 8px 0; color: #cbd5e1;">
                      <span style="color: #f472b6; font-weight: bold;">Generate ultra-luxury 3D Timepiece Showcase:</span><br>
                      &bull; <span style="color: #60a5fa;">Case:</span> MeshPhysicalMaterial (metalness: 0.95, roughness: 0.15)<br>
                      &bull; <span style="color: #a78bfa;">Sapphire Crystal:</span> transmission: 0.98, ior: 1.77, dispersion: 0.04<br>
                      &bull; <span style="color: #fbbf24;">Complication:</span> sweeping second hand at 28,800 vph (8 ticks/s)<br>
                      &bull; <span style="color: #34d399;">OrbitControls:</span> polar angle clamping (30&deg; to 105&deg;) with damping
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Agency Economics Comparison Table -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#0c0c18" style="background-color: #0c0c18; border: 1px solid #242436; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #1a1a2e; background-color: #111122;">
                    <span style="font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #34d399; letter-spacing: 0.12em; text-transform: uppercase;">
                      AGENCY MATH // CLIENT VALUE COMPARISON
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #161626; color: #94a3b8; font-size: 13px;">
                    Standard 2D Landing Page
                    <div style="font-size: 10px; color: #475569;">Figma to HTML / basic Webflow</div>
                  </td>
                  <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #161626; font-family: 'SF Mono', monospace; font-size: 13px; color: #64748b;">
                    &#8377;8,000 &ndash; &#8377;12,000
                  </td>
                </tr>
                <tr bgcolor="rgba(16, 185, 129, 0.04)">
                  <td style="padding: 12px 18px; border-bottom: 1px solid #161626; color: #ffffff; font-size: 13px; font-weight: 600;">
                    Immersive 3D WebGL Experience
                    <div style="font-size: 10px; color: #34d399;">Awwwards craft / Interactive PBR shaders</div>
                  </td>
                  <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #161626; font-family: 'SF Mono', monospace; font-size: 14px; font-weight: 700; color: #34d399;">
                    &#8377;45,000 &ndash; &#8377;1,50,000+
                  </td>
                </tr>
                <tr bgcolor="rgba(59, 130, 246, 0.06)">
                  <td style="padding: 12px 18px; color: #93c5fd; font-size: 13px; font-weight: bold;">
                    3D Vault Pass (Zero 3D Math Needed)
                    <div style="font-size: 10px; color: #60a5fa;">500+ Calibrated Prompts for Claude &amp; Cursor</div>
                  </td>
                  <td align="right" style="padding: 12px 18px; font-family: 'SF Mono', monospace; font-size: 16px; font-weight: 800; color: #60a5fa;">
                    ${amount}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              Call: <a href="tel:8287578025" style="color: #60a5fa; font-weight: 600; text-decoration: underline;">${CALL_PHONE_DISPLAY}</a> &bull; Call/WhatsApp: <a href="${WHATSAPP_LINK}" style="color: #34d399; font-weight: 600; text-decoration: underline;">${WHATSAPP_DISPLAY}</a> &bull;
              Email: <a href="mailto:support@vinebdigital.store" style="color: #60a5fa; text-decoration: underline;">support@vinebdigital.store</a><br>
              &copy; 2026 Vine B Digital Marketing Agency &bull; <a href="${SITE_URL}" style="color: #94a3b8; text-decoration: underline;">3dwebprompts-vineb.vercel.app</a>
              <div style="margin-top: 10px; font-size: 10px; color: #475569;">
                <a href="mailto:support@vinebdigital.store?subject=Unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> &bull;
                <a href="${SITE_URL}" style="color: #64748b; text-decoration: underline;">Preferences</a>
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

function buildDay2Email(lead: FollowupLeadInfo): string {
  const checkoutUrl = `${SITE_URL}/#pricing?tier=${encodeURIComponent(lead.tierId || 'day_pass')}&email=${encodeURIComponent(lead.email)}`;
  const portalUrl = `${SITE_URL}/#portal`;
  const name = lead.name?.trim() || 'Creator';
  const amount = lead.amountINR ? `₹${lead.amountINR}` : '₹49';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Final Notice: Your ₹49 Sprint Pass reservation is expiring tonight</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; font-size: 1px; color: #06060c; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your promotional ₹49 slot reservation expires tonight at midnight. Credit locked to your email.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #06060c; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c16; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 16px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.85);">
          <!-- Top Accent Line -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height: 3px; line-height: 3px; font-size: 0;">
                <tr>
                  <td width="50%" bgcolor="#ef4444" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                  <td width="50%" bgcolor="#f97316" style="height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; letter-spacing: 0.15em; color: #f87171; text-transform: uppercase;">
                      VINE B DIGITAL // FINAL NOTICE
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 999px; font-size: 10px; font-family: 'SF Mono', monospace; color: #fca5a5; font-weight: bold;">
                      [EXPIRING TONIGHT]
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.25;">
                Your ${amount} Sprint Pass reservation expires tonight at midnight
              </h1>
            </td>
          </tr>

          <!-- Body Copy -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; font-size: 14px; line-height: 1.65; color: #9ca3af;">
              Hey <strong style="color: #ffffff;">${name}</strong>,<br><br>
              This is the final automated reminder regarding your introductory access reservation for the <strong>APEX3D Prompt Vault</strong>.<br><br>
              We held the promotional <strong style="color: #ffffff;">${amount} introductory pricing</strong> for your email (<span style="font-family: 'SF Mono', monospace; color: #93c5fd;">${lead.email}</span>) for 48 hours. After tonight, this reservation releases and standard subscription rates (₹299/mo) apply.
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 4px 32px 24px 32px;" align="center">
              <div style="display: inline-block; padding: 6px 16px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 999px; font-size: 11px; font-family: 'SF Mono', monospace; color: #fca5a5; font-weight: bold; margin-bottom: 16px;">
                &#9203; CLOSING IN: &lt; 6 HOURS
              </div>
              <br>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 10px; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.45);">
                    <a href="${checkoutUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 0.02em;">
                      🔥 Lock In Pass for ${amount} Before Reset &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px; font-family: 'SF Mono', monospace;">
                One-click instant payment via any UPI app (GPay, PhonePe, Paytm, Slice)
              </div>
            </td>
          </tr>

          <!-- Featured Showcase: Hypercar Studio Configurator -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#080813" style="background-color: #080813; border: 1px solid #1f1f33; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #1a1a2e; background-color: #0d0d1c;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left">
                          <span style="font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase;">
                            &#9679; BESPOKE AUTOMOTIVE // 3D CONFIGURATOR
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            AERODYNAMIC PBR
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0; background-color: #05050a; text-align: center;">
                    <a href="${portalUrl}" target="_blank" style="display: block;">
                      <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80" alt="Hypercar 3D Configurator Preview" width="536" border="0" style="display: block; width: 100%; max-width: 536px; height: auto; border: 0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: #090914;">
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
                      Hypercar Bespoke 3D Studio Configurator
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px;">
                      Multi-coat metallic pearlescent paint, procedural carbon fiber normal mapping, and real-time wind tunnel smoke trails.
                    </div>
                    <div style="font-family: 'SF Mono', monospace; font-size: 11px; color: #64748b;">
                      Commercial SOW: <strong style="color: #34d399;">$28,000 Client Build</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              Call: <a href="tel:8287578025" style="color: #60a5fa; font-weight: 600; text-decoration: underline;">${CALL_PHONE_DISPLAY}</a> &bull; Call/WhatsApp: <a href="${WHATSAPP_LINK}" style="color: #34d399; font-weight: 600; text-decoration: underline;">${WHATSAPP_DISPLAY}</a> &bull;
              Email: <a href="mailto:support@vinebdigital.store" style="color: #60a5fa; text-decoration: underline;">support@vinebdigital.store</a><br>
              &copy; 2026 Vine B Digital Marketing Agency &bull; <a href="${SITE_URL}" style="color: #94a3b8; text-decoration: underline;">3dwebprompts-vineb.vercel.app</a>
              <div style="margin-top: 10px; font-size: 10px; color: #475569;">
                <a href="mailto:support@vinebdigital.store?subject=Unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> &bull;
                <a href="${SITE_URL}" style="color: #64748b; text-decoration: underline;">Preferences</a>
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

const recipientLogs = new Map<string, number[]>();
const MAX_SERVER_DAILY = 4; // Max 4 emails per recipient per 24 hours

export default async function handler(req: any, res: any) {
  // Allow GET (Vercel Cron) and POST (Heartbeat / Manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey =
    process.env.RESEND_API_KEY ||
    req.body?.apiKey ||
    process.env.VITE_RESEND_API_KEY;

  const fromEmail =
    process.env.VITE_RESEND_FROM ||
    'Vine B Digital // 3D Vault <vault@vinebdigital.store>';

  if (!apiKey) {
    return res.status(500).json({ message: 'Missing Resend API Key' });
  }

  const incomingLeads: (FollowupLeadInfo & {
    createdAt: string;
    followupStage?: number;
    status?: string;
  })[] = Array.isArray(req.body?.leads) ? req.body.leads : [];

  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;
  const day1Sent: string[] = [];
  const day2Sent: string[] = [];
  const errors: any[] = [];

  for (const lead of incomingLeads) {
    if (!lead.email || !lead.email.includes('@')) continue;
    if (lead.status === 'approved') continue;

    const recipient = lead.email.trim().toLowerCase();
    const existing = recipientLogs.get(recipient) || [];
    const recent = existing.filter((t) => now - t < windowMs);
    if (recent.length >= MAX_SERVER_DAILY) {
      continue; // Skip recipient if already reached daily limit of 4
    }

    const createdAtMs = new Date(lead.createdAt || now).getTime();
    const ageHours = (now - createdAtMs) / (1000 * 60 * 60);
    const stage = lead.followupStage ?? 0;

    if (ageHours >= 24 && ageHours < 48 && stage === 0) {
      try {
        const html = buildDay1Email(lead);
        const subject = `How agencies are charging ₹45,000+ for 3D websites [Architecture Breakdown]`;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [lead.email.trim()],
            subject,
            html,
            text: `Hey ${lead.name}, agencies are charging ₹45k+ for 3D websites. Unlock your 3D Vault Pass for ₹49 today: ${SITE_URL}/#pricing?tier=${lead.tierId}`,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          day1Sent.push(lead.email);
          recent.push(now);
          recipientLogs.set(recipient, recent);
        } else {
          errors.push({ email: lead.email, stage: 1, error: data });
        }
      } catch (err: any) {
        errors.push({ email: lead.email, stage: 1, error: err.message });
      }
    } else if (ageHours >= 48 && stage <= 1) {
      try {
        const html = buildDay2Email(lead);
        const subject = `Final Notice: Your ₹49 Sprint Pass reservation expires tonight`;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [lead.email.trim()],
            subject,
            html,
            text: `Hey ${lead.name}, your ₹49 promotional reservation expires tonight. Lock it in here before reset: ${SITE_URL}/#pricing?tier=${lead.tierId}`,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          day2Sent.push(lead.email);
          recent.push(now);
          recipientLogs.set(recipient, recent);
        } else {
          errors.push({ email: lead.email, stage: 2, error: data });
        }
      } catch (err: any) {
        errors.push({ email: lead.email, stage: 2, error: err.message });
      }
    }
  }

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    totalEvaluated: incomingLeads.length,
    day1DispatchedCount: day1Sent.length,
    day1Recipients: day1Sent,
    day2DispatchedCount: day2Sent.length,
    day2Recipients: day2Sent,
    errorsCount: errors.length,
    errors,
  });
}
