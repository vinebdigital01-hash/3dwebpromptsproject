// ==========================================
// APEX3D VAULT - Admin Settings & Merchant Config Engine
// Zero-code real-time updates for UPI, Merchant Identity, Pricing & Cloud Sync
// ==========================================

export interface TierPricing {
  day_1: number;
  month_1: number;
  month_6: number;
  lifetime: number;
}

export interface AdminSettings {
  merchantName: string;
  merchantUpi: string;
  supportEmail: string;
  whatsappNumber: string;
  transactionNote: string;
  pricing: TierPricing;
  // Cloud Sync (Supabase)
  supabaseUrl: string;
  supabaseAnonKey: string;
  cloudSyncEnabled: boolean;
  lastCloudSyncAt: string | null;
}

const SETTINGS_STORAGE_KEY = 'apex3d_admin_settings_v1';

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  merchantName: 'Vine B Digital Marketing Agency',
  merchantUpi: 's5305704393562990@slc',
  supportEmail: 'support@vinebdigital.store',
  whatsappNumber: '918860090791',
  transactionNote: 'Payment to slice merchant QR',
  pricing: {
    day_1: 49,
    month_1: 299,
    month_6: 699,
    lifetime: 2999,
  },
  supabaseUrl: '',
  supabaseAnonKey: '',
  cloudSyncEnabled: false,
  lastCloudSyncAt: null,
};

/**
 * Retrieve current settings from localStorage or fallback to defaults
 */
export function getAdminSettings(): AdminSettings {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        ...parsed,
        pricing: {
          ...DEFAULT_ADMIN_SETTINGS.pricing,
          ...(parsed.pricing || {}),
        },
      };
    }
  } catch (err) {
    console.error('Failed to read admin settings from localStorage:', err);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

/**
 * Save updated settings and dispatch browser event
 */
export function saveAdminSettings(updates: Partial<AdminSettings>): AdminSettings {
  const current = getAdminSettings();
  const updated: AdminSettings = {
    ...current,
    ...updates,
    pricing: {
      ...current.pricing,
      ...(updates.pricing || {}),
    },
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('apex_settings_updated', { detail: updated }));
    } catch (err) {
      console.error('Failed to save admin settings:', err);
    }
  }

  return updated;
}
