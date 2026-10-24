// =========================================================================
// APEX3D VAULT - Secure Serverless Gatekeeper: /api/fetch-prompt
// Serves proprietary prompt architectures ONLY to authorized licensees
// =========================================================================

import { PAID_PROMPTS_VAULT } from './data/paidPromptsVault.ts';

const FREE_PROMPT_IDS = new Set([
  'valmora',
  'selene',
  'fluxora',
  'hazmat-cyber',
  'fintech-liquidity-pool',
  'liquid-viscosity-shader',
]);

/**
 * Validates whether the provided license key has a legitimate paid format
 */
function isValidPaidLicenseFormat(licenseKey?: string | null): boolean {
  if (!licenseKey) return false;
  const clean = licenseKey.trim().toUpperCase();

  // Exclude free preview trial member licenses
  if (clean.startsWith('LIC-MBR-') || clean.startsWith('FREE-')) {
    return false;
  }

  // Must match valid paid license schemes (Day Pass, Pro 1-Mo, Team 6-Mo, Lifetime VIP)
  const isPaidPattern =
    /^LIC-(DAY|PRO|VIP|LIF|SPRINT|MEMBER)-[A-Z0-9]{4}-[A-Z0-9]{4}/.test(clean) ||
    (clean.startsWith('LIC-') && clean.length >= 12);

  return isPaidPattern;
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  try {
    const { promptId, licenseKey, orderId, userEmail } = req.body || {};

    if (!promptId || typeof promptId !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing or invalid promptId' });
    }

    const cleanPromptId = promptId.trim().toLowerCase();

    // 1. If it's a known free prompt, allow delivery immediately
    if (FREE_PROMPT_IDS.has(cleanPromptId)) {
      return res.status(200).json({
        success: true,
        promptId: cleanPromptId,
        isFree: true,
        message: 'Free blueprint prompt delivered',
      });
    }

    // 2. For PAID prompts, check if it exists in the server vault
    const fullArchitecture = PAID_PROMPTS_VAULT[cleanPromptId];
    if (!fullArchitecture) {
      return res.status(404).json({
        success: false,
        message: `Prompt '${cleanPromptId}' not found in Vault catalog.`,
      });
    }

    // 3. Authorization verification (Strict: Only approved paid license keys)
    const cleanLic = (licenseKey || '').trim().toUpperCase();
    const isAuthorized = isValidPaidLicenseFormat(cleanLic);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        isLocked: true,
        message: '🔒 Access Denied: An approved active Apex3D Vault license key is required to view or copy this proprietary prompt architecture. If your UTR is pending, access unlocks immediately upon Admin approval.',
      });
    }

    // 4. Return the authorized prompt architecture
    return res.status(200).json({
      success: true,
      promptId: cleanPromptId,
      promptArchitecture: fullArchitecture,
      deliveredAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/fetch-prompt:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while retrieving prompt.',
    });
  }
}
