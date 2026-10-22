// =========================================================================
// APEX3D VAULT - Secure Prompt Retrieval Service
// Communicates with /api/fetch-prompt serverless gatekeeper
// NEVER caches paid prompt architectures to persistent localStorage!
// =========================================================================

import { VaultItem, isPromptFree } from '../data/vaultCatalog';
import { LeadOrder } from './leadTracker';

// In-memory runtime cache for the active browser session only
const sessionPromptCache = new Map<string, string>();

export interface FetchPromptResult {
  success: boolean;
  promptArchitecture?: string;
  isFree?: boolean;
  isLocked?: boolean;
  message?: string;
}

/**
 * Safely fetches the verified production architecture for any prompt.
 * If the prompt is free, it resolves immediately.
 * If the prompt is paid, it authenticates with the serverless gatekeeper via licenseKey/order.
 */
export async function getAuthorizedPromptArchitecture(
  item: VaultItem,
  activeOrder?: LeadOrder | null
): Promise<FetchPromptResult> {
  // 1. If it's a designated free blueprint, return catalog copy
  if (isPromptFree(item)) {
    return {
      success: true,
      promptArchitecture: item.promptArchitecture,
      isFree: true,
    };
  }

  // 2. Check in-memory session cache first
  if (sessionPromptCache.has(item.id)) {
    return {
      success: true,
      promptArchitecture: sessionPromptCache.get(item.id),
      isFree: false,
    };
  }

  // 3. For paid items, must verify active order status before requesting
  const isPaidOrder = Boolean(
    activeOrder &&
    activeOrder.status === 'approved' &&
    (activeOrder.amountINR || 0) > 0 &&
    activeOrder.licenseKey &&
    !activeOrder.licenseKey.startsWith('LIC-MBR-')
  );

  if (!isPaidOrder) {
    return {
      success: false,
      isLocked: true,
      message: 'Active Apex3D Vault License required to decrypt proprietary architecture.',
    };
  }

  // 4. Request the decrypted architecture from the secure serverless endpoint
  try {
    const res = await fetch('/api/fetch-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: item.id,
        licenseKey: activeOrder?.licenseKey,
        orderId: activeOrder?.orderNumber || activeOrder?.id,
        userEmail: activeOrder?.email,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success && data.promptArchitecture) {
      // Store in transient memory (survives within current session only)
      sessionPromptCache.set(item.id, data.promptArchitecture);
      return {
        success: true,
        promptArchitecture: data.promptArchitecture,
        isFree: false,
      };
    }

    return {
      success: false,
      isLocked: Boolean(data.isLocked),
      message: data.message || 'Failed to authorize prompt.',
    };
  } catch (err: any) {
    console.error('Error fetching authorized prompt:', err);
    return {
      success: false,
      message: err.message || 'Network error while retrieving prompt.',
    };
  }
}
