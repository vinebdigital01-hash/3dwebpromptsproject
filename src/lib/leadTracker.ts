// ==========================================
// APEX3D VAULT - Lead & Order Lifecycle Engine
// Drop-off protection, ghost keystrokes, UTR verification, expiry calculations
// ==========================================

import {
  syncGhostLeadToCloud,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  subscribeToFirestoreOrders,
} from './firebase';

export type OrderStatus =
  | 'unsubmitted_keystroke' // User typed email/phone but never hit proceed
  | 'abandoned_at_qr'      // User proceeded to QR code but closed without entering UTR
  | 'pending_approval'     // User submitted 12-digit UTR; awaiting admin verification
  | 'approved'             // Admin accepted; account active, invoice generated
  | 'rejected';            // Admin rejected with reason

export interface UpgradeEvent {
  timestamp: string;
  action: 'modal_viewed' | 'tier_selected' | 'cta_clicked' | 'modal_dismissed';
  tierId?: string;
  triggerReason?: 'quota_exceeded' | 'manual';
}

export interface UpgradeTelemetry {
  viewsCount: number;
  clicksCount: number;
  lastViewedAt?: string;
  lastClickedAt?: string;
  lastSelectedTierId?: string;
  triggerReason?: 'quota_exceeded' | 'manual';
  isAbandoned: boolean;
  history: UpgradeEvent[];
}

export interface LeadOrder {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  phone: string;
  tierId: string;
  tierName: string;
  amountINR: number;
  status: OrderStatus;
  utrNumber?: string;
  upiId?: string;
  rejectionReason?: string;
  invoiceNumber?: string;
  licenseKey?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  expiresAt?: string | null;
  upgradeTelemetry?: UpgradeTelemetry;
  followupStage?: number; // 0 = none sent, 1 = Day 1 (24h) sent, 2 = Day 2 (48h) sent
  lastFollowupAt?: string;
  source?: 'browser_autofill' | 'keystroke' | 'checkout_submit' | 'lead_magnet' | 'prompt_copy' | string;
  utm?: {
    source?: string;
    campaign?: string;
    content?: string;
    fbclid?: string;
  };
}

const STORAGE_KEY = 'apex3d_vault_orders_db';
const GHOST_STORAGE_KEY = 'apex3d_ghost_leads';

/**
 * Generate cryptographic-like short IDs
 */
export function generateOrderNumber(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `APX-${random}`;
}

export function generateInvoiceNumber(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `INV-${year}-${random}`;
}

export function generateLicenseKey(tierId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len = 4) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const prefix = tierId === 'lifetime' ? 'VIP' : 'PRO';
  return `LIC-${prefix}-${segment(4)}-${segment(4)}`;
}

/**
 * Calculate account expiration timestamp according to pricing tier
 */
export function calculateTierExpiry(tierId: string, approvedDate = new Date()): string | null {
  const date = new Date(approvedDate);
  switch (tierId) {
    case 'day_pass':
    case 'day_1':
      date.setHours(date.getHours() + 24);
      return date.toISOString();
    case 'month_1':
      date.setDate(date.getDate() + 30);
      return date.toISOString();
    case 'month_6':
      date.setDate(date.getDate() + 180);
      return date.toISOString();
    case 'lifetime':
      return null; // Lifetime validity
    default:
      return null;
  }
}

/**
 * Extract UTM and ad click attribution from current URL & session
 */
export function getAdAttribution() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source') || sessionStorage.getItem('utm_source') || 'direct';
  const utmCampaign = params.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || '';
  const fbclid = params.get('fbclid') || sessionStorage.getItem('fbclid') || '';

  if (params.get('utm_source')) sessionStorage.setItem('utm_source', utmSource);
  if (params.get('utm_campaign')) sessionStorage.setItem('utm_campaign', utmCampaign);
  if (params.get('fbclid')) sessionStorage.setItem('fbclid', fbclid);

  return {
    source: utmSource,
    campaign: utmCampaign,
    fbclid,
  };
}
 
export const SEED_ORDERS: LeadOrder[] = [];

// Known dummy and mock record identifiers to purge
const DUMMY_ORDER_IDS = new Set([
  'ORD-982142',
  'GHOST-aditya948-day_pass',
  'ORD-651902',
  'ORD-1DAY-4901',
  'ORD-310492',
]);

const DUMMY_ORDER_NUMBERS = new Set([
  'APX-982142',
  'APX-774102',
  'APX-651902',
  'APX-104921',
  'APX-310492',
]);

const DUMMY_EMAILS = new Set([
  'vikram.design@agencyapex.in',
  'aditya.sen@gmail.com',
  'rohan@studiocraft.co',
  'kabir.sprint@gmail.com',
  'priya@voxelstudios.com',
]);

/**
 * Check if an order is dummy/seed data
 */
export function isDummyOrder(order?: Partial<LeadOrder> | null): boolean {
  if (!order) return false;
  if (order.id && DUMMY_ORDER_IDS.has(order.id)) return true;
  if (order.orderNumber && DUMMY_ORDER_NUMBERS.has(order.orderNumber)) return true;
  if (order.email && DUMMY_EMAILS.has(order.email.toLowerCase().trim())) return true;
  if (
    order.name &&
    (order.name.includes('Vikram Malhotra') ||
      order.name.includes('Aditya Sen') ||
      order.name.includes('Rohan Joshi') ||
      order.name.includes('Kabir Verma') ||
      order.name.includes('Priya Nambiar'))
  ) {
    return true;
  }
  return false;
}

/**
 * Thoroughly purge any legacy dummy records from browser localStorage
 */
export function purgeAllDummyData(): { removedOrdersCount: number } {
  if (typeof window === 'undefined') return { removedOrdersCount: 0 };
  let removedCount = 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((o) => !isDummyOrder(o));
        removedCount = parsed.length - cleaned.length;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean marketing campaigns if any reference dummy emails or orders
    const mktRaw = localStorage.getItem('apex3d_marketing_campaigns_db');
    if (mktRaw) {
      const parsedMkt = JSON.parse(mktRaw);
      if (Array.isArray(parsedMkt)) {
        const cleanedMkt = parsedMkt.filter(
          (m: any) =>
            !DUMMY_EMAILS.has((m.recipientEmail || '').toLowerCase().trim()) &&
            !DUMMY_ORDER_NUMBERS.has(m.orderNumber || '')
        );
        localStorage.setItem('apex3d_marketing_campaigns_db', JSON.stringify(cleanedMkt));
      }
    }

    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: null }));
    window.dispatchEvent(new CustomEvent('apex_marketing_dispatched', { detail: null }));
  } catch (err) {
    console.error('Error purging dummy data:', err);
  }
  return { removedOrdersCount: removedCount };
}

/**
 * Clear all orders in storage (full reset to zero)
 */
export function clearAllOrders(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: null }));
  } catch (err) {
    console.error('Error clearing orders:', err);
  }
}

/**
 * Retrieve all orders from local database (mirrors Firebase Firestore)
 */
export function getAllOrders(): LeadOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter((o) => !isDummyOrder(o));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch (err) {
    console.error('Failed to read orders database:', err);
    return [];
  }
}

/**
 * Save or update an order (Optimistic local cache + Direct Firebase Firestore sync)
 */
export function saveOrder(order: LeadOrder): void {
  if (typeof window === 'undefined' || !order) return;
  try {
    const orders = getAllOrders();
    const existingIndex = orders.findIndex(
      (o) => o.id === order.id || (o.email && o.email.toLowerCase() === order.email.toLowerCase() && o.status !== 'approved')
    );

    if (existingIndex >= 0) {
      orders[existingIndex] = {
        ...orders[existingIndex],
        ...order,
        updatedAt: new Date().toISOString(),
      };
    } else {
      orders.unshift({
        ...order,
        updatedAt: new Date().toISOString(),
      });
    }

    // 1. Instant local storage cache for 0ms frontend lag
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

    // 2. Direct real-time cloud persistence on Firebase Firestore
    saveOrderToFirestore(order).catch((err) => {
      console.debug('Firebase Firestore saveOrder notice:', err);
    });

    // 3. Dispatch browser event for open components
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: order }));
  } catch (err) {
    console.error('Failed to save order:', err);
  }
}

// Background Firestore real-time listener (Singleton)
let isFirestoreSyncActive = false;

export function initFirestoreSync(): () => void {
  if (typeof window === 'undefined' || isFirestoreSyncActive) return () => {};
  isFirestoreSyncActive = true;

  return subscribeToFirestoreOrders((cloudOrders) => {
    try {
      const cleanCloud = cloudOrders.filter((o) => !isDummyOrder(o));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanCloud));
      window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: cleanCloud }));
    } catch (err) {
      console.debug('Error updating local cache from Firestore orders:', err);
    }
  });
}

// Auto-activate in browser
if (typeof window !== 'undefined') {
  initFirestoreSync();
}

/**
 * 👻 Ghost Keystroke & Autofill Capture Engine:
 * Saves lead details in real-time as user types or when browser autofills form!
 */
export function saveGhostKeystrokeLead(data: {
  email: string;
  name?: string;
  phone?: string;
  tierId: string;
  tierName: string;
  amountINR: number;
  source?: 'browser_autofill' | 'keystroke' | 'checkout_submit' | 'lead_magnet' | 'prompt_copy' | string;
}): void {
  if (!data.email || typeof window === 'undefined') return;
  const cleanEmail = data.email.trim().toLowerCase();
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) return;
  if (isDummyOrder(data)) return;

  const orderId = `GHOST-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}-${data.tierId}`;
  const ghostOrder: LeadOrder = {
    id: orderId,
    orderNumber: generateOrderNumber(),
    name: data.name?.trim() || 'Visitor (Unsubmitted)',
    email: cleanEmail,
    phone: data.phone?.trim() ? data.phone.replace(/\D/g, '') : '',
    tierId: data.tierId,
    tierName: data.tierName,
    amountINR: data.amountINR,
    status: 'unsubmitted_keystroke',
    followupStage: 0,
    source: data.source || 'keystroke',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    utm: getAdAttribution(),
  };

  saveOrder(ghostOrder);
  syncGhostLeadToCloud(ghostOrder);
}

/**
 * ⚡ Automated Drip Follow-up Heartbeat:
 * Evaluates pending ghost leads and calls /api/cron-followup for automated Day 1 & Day 2 emails via Resend
 */
export async function triggerDripFollowupHeartbeat(force = false): Promise<{
  success: boolean;
  day1Count: number;
  day2Count: number;
}> {
  if (typeof window === 'undefined') return { success: false, day1Count: 0, day2Count: 0 };

  const lastRun = localStorage.getItem('apex_last_drip_cron_run');
  const now = Date.now();
  // Don't spam unless forced or at least 2 hours have passed
  if (!force && lastRun && now - parseInt(lastRun, 10) < 1000 * 60 * 60 * 2) {
    return { success: true, day1Count: 0, day2Count: 0 };
  }

  const allOrders = getAllOrders();
  const ghostLeads = allOrders.filter(
    (o) =>
      (o.status === 'unsubmitted_keystroke' || o.status === 'abandoned_at_qr') &&
      o.email &&
      o.email.includes('@')
  );

  if (ghostLeads.length === 0) {
    localStorage.setItem('apex_last_drip_cron_run', now.toString());
    return { success: true, day1Count: 0, day2Count: 0 };
  }

  try {
    const res = await fetch('/api/cron-followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads: ghostLeads }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('apex_last_drip_cron_run', now.toString());

      let updatedAny = false;
      if (data.day1Recipients && data.day1Recipients.length > 0) {
        ghostLeads.forEach((l) => {
          if (data.day1Recipients.includes(l.email)) {
            l.followupStage = 1;
            l.lastFollowupAt = new Date().toISOString();
            updatedAny = true;
          }
        });
      }
      if (data.day2Recipients && data.day2Recipients.length > 0) {
        ghostLeads.forEach((l) => {
          if (data.day2Recipients.includes(l.email)) {
            l.followupStage = 2;
            l.lastFollowupAt = new Date().toISOString();
            updatedAny = true;
          }
        });
      }

      if (updatedAny) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
      }

      return {
        success: true,
        day1Count: data.day1DispatchedCount || 0,
        day2Count: data.day2DispatchedCount || 0,
      };
    }
  } catch (e) {
    console.debug('Follow-up heartbeat deferred:', e);
  }

  return { success: false, day1Count: 0, day2Count: 0 };
}

/**
 * Admin Action: Approve order with UTR
 */
export function approveOrder(orderId: string): LeadOrder | null {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const target = orders[index];
  const approvedAt = new Date().toISOString();
  const expiresAt = calculateTierExpiry(target.tierId, new Date());
  const invoiceNumber = target.invoiceNumber || generateInvoiceNumber();
  const licenseKey = target.licenseKey || generateLicenseKey(target.tierId);

  const updated: LeadOrder = {
    ...target,
    status: 'approved',
    approvedAt,
    expiresAt,
    invoiceNumber,
    licenseKey,
    updatedAt: new Date().toISOString(),
  };

  orders[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  saveOrderToFirestore(updated).catch(() => {});
  window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: updated }));
  return updated;
}

/**
 * Admin Action: Reject order with reason
 */
export function rejectOrder(orderId: string, reason: string): LeadOrder | null {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const updated: LeadOrder = {
    ...orders[index],
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: new Date().toISOString(),
  };

  orders[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  saveOrderToFirestore(updated).catch(() => {});
  window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: updated }));
  return updated;
}

/**
 * Lookup an approved order by License Key, Order Number, Email, or Phone
 */
export function findApprovedOrder(identifier: string): LeadOrder | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const digitsOnly = identifier.replace(/\D/g, '');
  const orders = getAllOrders();

  return (
    orders.find((o) => {
      if (o.status !== 'approved') return false;
      if (o.licenseKey && o.licenseKey.toLowerCase() === clean) return true;
      if (o.orderNumber && o.orderNumber.toLowerCase() === clean) return true;
      if (o.email && o.email.toLowerCase() === clean) return true;
      if (digitsOnly.length >= 10 && o.phone && o.phone.replace(/\D/g, '').includes(digitsOnly)) return true;
      return false;
    }) || null
  );
}

/**
 * Determine daily quota based on tier
 * day_pass / day_1: 1
 * month_1: 3
 * month_6: 15
 * lifetime: -1 (unlimited)
 */
export function getMaxDailyCopies(tierId: string): number {
  switch (tierId) {
    case 'member':
    case 'free_preview':
    case 'day_pass':
    case 'day_1':
      return 1;
    case 'month_1':
      return 3;
    case 'month_6':
      return 15;
    case 'lifetime':
    default:
      return -1; // Unlimited
  }
}

/**
 * Get daily usage for a user today
 */
export function getDailyCopyUsage(licenseKey: string): number {
  if (typeof window === 'undefined' || !licenseKey) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const key = `apex3d_quota_${licenseKey}_${today}`;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) || 0 : 0;
}

/**
 * Increment daily usage
 */
export function incrementDailyCopyUsage(licenseKey: string): number {
  if (typeof window === 'undefined' || !licenseKey) return 1;
  const today = new Date().toISOString().slice(0, 10);
  const key = `apex3d_quota_${licenseKey}_${today}`;
  const current = getDailyCopyUsage(licenseKey);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return next;
}

/**
 * Format expiry countdown
 */
export function getExpiryDetails(expiresAt: string | null | undefined): {
  isLifetime: boolean;
  isExpired: boolean;
  humanText: string;
  daysRemaining: number;
  hoursRemaining: number;
} {
  if (!expiresAt) {
    return {
      isLifetime: true,
      isExpired: false,
      humanText: 'Active Forever (Lifetime VIP)',
      daysRemaining: 9999,
      hoursRemaining: 9999,
    };
  }

  const expiryDate = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expiryDate - now;

  if (diffMs <= 0) {
    return {
      isLifetime: false,
      isExpired: true,
      humanText: 'Pass Expired',
      daysRemaining: 0,
      hoursRemaining: 0,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let humanText = '';
  if (days > 0) {
    humanText = `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    humanText = `${hours}h ${mins}m remaining`;
  } else {
    humanText = `${mins}m remaining`;
  }

  return {
    isLifetime: false,
    isExpired: false,
    humanText,
    daysRemaining: days,
    hoursRemaining: hours,
  };
}

/**
 * Record when a customer opens the Upgrade Modal
 */
export function recordUpgradeModalView(
  identifier: string,
  triggerReason: 'quota_exceeded' | 'manual' = 'quota_exceeded'
): void {
  if (typeof window === 'undefined' || !identifier) return;
  try {
    const orders = getAllOrders();
    const clean = identifier.trim().toLowerCase();
    const index = orders.findIndex(
      (o) =>
        (o.licenseKey && o.licenseKey.toLowerCase() === clean) ||
        (o.email && o.email.toLowerCase() === clean) ||
        o.id === identifier
    );
    if (index === -1) return;

    const currentOrder = orders[index];
    const prevTelemetry = currentOrder.upgradeTelemetry || {
      viewsCount: 0,
      clicksCount: 0,
      isAbandoned: false,
      history: [],
    };

    const newHistory = [
      ...(prevTelemetry.history || []),
      {
        timestamp: new Date().toISOString(),
        action: 'modal_viewed' as const,
        triggerReason,
      },
    ];

    const updatedOrder: LeadOrder = {
      ...currentOrder,
      upgradeTelemetry: {
        ...prevTelemetry,
        viewsCount: prevTelemetry.viewsCount + 1,
        lastViewedAt: new Date().toISOString(),
        triggerReason,
        isAbandoned: true,
        history: newHistory,
      },
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: updatedOrder }));
  } catch (err) {
    console.error('Failed to record upgrade modal view:', err);
  }
}

/**
 * Record when a customer clicks/switches to a specific tier in the modal
 */
export function recordUpgradeTierSelection(identifier: string, tierId: string): void {
  if (typeof window === 'undefined' || !identifier) return;
  try {
    const orders = getAllOrders();
    const clean = identifier.trim().toLowerCase();
    const index = orders.findIndex(
      (o) =>
        (o.licenseKey && o.licenseKey.toLowerCase() === clean) ||
        (o.email && o.email.toLowerCase() === clean) ||
        o.id === identifier
    );
    if (index === -1) return;

    const currentOrder = orders[index];
    const prevTelemetry = currentOrder.upgradeTelemetry || {
      viewsCount: 1,
      clicksCount: 0,
      isAbandoned: true,
      history: [],
    };

    const updatedOrder: LeadOrder = {
      ...currentOrder,
      upgradeTelemetry: {
        ...prevTelemetry,
        lastSelectedTierId: tierId,
        history: [
          ...(prevTelemetry.history || []),
          {
            timestamp: new Date().toISOString(),
            action: 'tier_selected' as const,
            tierId,
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: updatedOrder }));
  } catch (err) {
    console.error('Failed to record upgrade tier selection:', err);
  }
}

/**
 * Record when a customer clicks the primary upgrade CTA button
 */
export function recordUpgradeCtaClick(identifier: string, tierId: string): void {
  if (typeof window === 'undefined' || !identifier) return;
  try {
    const orders = getAllOrders();
    const clean = identifier.trim().toLowerCase();
    const index = orders.findIndex(
      (o) =>
        (o.licenseKey && o.licenseKey.toLowerCase() === clean) ||
        (o.email && o.email.toLowerCase() === clean) ||
        o.id === identifier
    );
    if (index === -1) return;

    const currentOrder = orders[index];
    const prevTelemetry = currentOrder.upgradeTelemetry || {
      viewsCount: 1,
      clicksCount: 0,
      isAbandoned: true,
      history: [],
    };

    const updatedOrder: LeadOrder = {
      ...currentOrder,
      upgradeTelemetry: {
        ...prevTelemetry,
        clicksCount: prevTelemetry.clicksCount + 1,
        lastClickedAt: new Date().toISOString(),
        lastSelectedTierId: tierId,
        isAbandoned: true,
        history: [
          ...(prevTelemetry.history || []),
          {
            timestamp: new Date().toISOString(),
            action: 'cta_clicked' as const,
            tierId,
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: updatedOrder }));
  } catch (err) {
    console.error('Failed to record upgrade CTA click:', err);
  }
}

/**
 * Record when a customer dismisses the modal without upgrading
 */
export function recordUpgradeModalDismiss(identifier: string, tierId?: string): void {
  if (typeof window === 'undefined' || !identifier) return;
  try {
    const orders = getAllOrders();
    const clean = identifier.trim().toLowerCase();
    const index = orders.findIndex(
      (o) =>
        (o.licenseKey && o.licenseKey.toLowerCase() === clean) ||
        (o.email && o.email.toLowerCase() === clean) ||
        o.id === identifier
    );
    if (index === -1) return;

    const currentOrder = orders[index];
    if (!currentOrder.upgradeTelemetry) return;

    const updatedOrder: LeadOrder = {
      ...currentOrder,
      upgradeTelemetry: {
        ...currentOrder.upgradeTelemetry,
        isAbandoned: true,
        history: [
          ...(currentOrder.upgradeTelemetry.history || []),
          {
            timestamp: new Date().toISOString(),
            action: 'modal_dismissed' as const,
            tierId,
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: updatedOrder }));
  } catch (err) {
    console.error('Failed to record upgrade modal dismiss:', err);
  }
}
