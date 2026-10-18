// ==========================================
// APEX3D VAULT - Lead & Order Lifecycle Engine
// Drop-off protection, ghost keystrokes, UTR verification, expiry calculations
// ==========================================

import {
  syncGhostLeadToCloud,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  subscribeToFirestoreOrders,
  fetchAllCloudOrdersAndGhostLeads,
  saveCloudQuotaRecord,
  fetchCloudQuotaRecord,
} from './firebase';
import { generateDeviceFingerprint } from './security';

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
  boundIp?: string;
  boundLocation?: string;
  boundCity?: string;
  boundCountry?: string;
  boundDeviceFingerprint?: string;
  boundAt?: string;
  lastAccessIp?: string;
  lastAccessLocation?: string;
  lastAccessAt?: string;
  utm?: {
    source?: string;
    campaign?: string;
    content?: string;
    fbclid?: string;
  };
  // 🔒 Copy Quota Persistence Fields (Syncs with Cloud Firestore)
  role?: string;
  freeCopiesUsed?: number;
  lastFreeCopyAt?: string;
  dailyCopyUsage?: {
    date: string; // YYYY-MM-DD
    count: number;
  };
  totalCopiesUsed?: number;
  lastCopyAt?: string;
  copiedPromptIds?: string[];
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
  const cleanEmail = (order.email || '').toLowerCase().trim();
  const cleanName = (order.name || '').trim();
  const cleanId = (order.id || '').trim();

  // 1. Purge auto-generated guest explorers & fake apex3d.local emails
  if (
    cleanEmail.includes('free_guest') ||
    cleanEmail.includes('@apex3d.local') ||
    cleanEmail.includes('example.com') ||
    cleanEmail.includes('pending@') ||
    cleanId.includes('free_guest') ||
    cleanId === 'SESSION-GUEST' ||
    cleanName === 'Free Trial Member' ||
    cleanName === 'Free Trial Visitor'
  ) {
    return true;
  }

  if (order.id && DUMMY_ORDER_IDS.has(order.id)) return true;
  if (order.orderNumber && DUMMY_ORDER_NUMBERS.has(order.orderNumber)) return true;
  if (cleanEmail && DUMMY_EMAILS.has(cleanEmail)) return true;
  if (
    cleanName &&
    (cleanName.includes('Vikram Malhotra') ||
      cleanName.includes('Aditya Sen') ||
      cleanName.includes('Rohan Joshi') ||
      cleanName.includes('Kabir Verma') ||
      cleanName.includes('Priya Nambiar'))
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
        removedCount += parsed.length - cleaned.length;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean permanent ghost backup vault
    const ghostRaw = localStorage.getItem(GHOST_BACKUP_KEY);
    if (ghostRaw) {
      const parsed = JSON.parse(ghostRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((o) => !isDummyOrder(o));
        removedCount += parsed.length - cleaned.length;
        localStorage.setItem(GHOST_BACKUP_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean ghost leads key
    const ghostLeadsRaw = localStorage.getItem(GHOST_STORAGE_KEY);
    if (ghostLeadsRaw) {
      const parsed = JSON.parse(ghostLeadsRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((o) => !isDummyOrder(o));
        localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(cleaned));
      }
    }

    // Clean apex_prompt_leads
    const promptLeadsRaw = localStorage.getItem('apex_prompt_leads');
    if (promptLeadsRaw) {
      const parsed = JSON.parse(promptLeadsRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (pl: any) =>
            pl &&
            pl.email &&
            !pl.email.includes('free_guest') &&
            !pl.email.includes('@apex3d.local') &&
            pl.name !== 'Free Trial Member' &&
            pl.name !== 'Free Trial Visitor'
        );
        localStorage.setItem('apex_prompt_leads', JSON.stringify(cleaned));
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
            !DUMMY_ORDER_NUMBERS.has(m.orderNumber || '') &&
            !(m.recipientEmail || '').includes('free_guest') &&
            !(m.recipientEmail || '').includes('@apex3d.local')
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
const GHOST_BACKUP_KEY = 'apex3d_ghost_vault_permanent';

export function getAllOrders(): LeadOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let orders: LeadOrder[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        orders = parsed.filter((o) => !isDummyOrder(o));
      }
    }

    // Check backup ghost vault to ensure no ghost leads are ever dropped
    try {
      const ghostRaw = localStorage.getItem(GHOST_BACKUP_KEY);
      if (ghostRaw) {
        const backupGhosts: LeadOrder[] = JSON.parse(ghostRaw);
        if (Array.isArray(backupGhosts)) {
          backupGhosts.forEach((bg) => {
            if (bg && bg.id && !isDummyOrder(bg)) {
              if (!orders.some((o) => o.id === bg.id || (o.email && o.email.toLowerCase() === bg.email.toLowerCase()))) {
                orders.push(bg);
              }
            }
          });
        }
      }
    } catch {
      // Backup check ignored
    }

    // Recover any prompt leads stored in apex_prompt_leads
    try {
      const promptLeadsRaw = localStorage.getItem('apex_prompt_leads');
      if (promptLeadsRaw) {
        const promptLeads = JSON.parse(promptLeadsRaw);
        if (Array.isArray(promptLeads)) {
          promptLeads.forEach((pl: any) => {
            if (pl && pl.email) {
              const cleanEmail = pl.email.trim().toLowerCase();
              if (isDummyOrder({ email: cleanEmail, name: pl.name })) return;
              const existing = orders.find(
                (o) => o.email && o.email.toLowerCase() === cleanEmail
              );
              if (!existing) {
                const recoveredOrder: LeadOrder = {
                  id: `USR-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
                  orderNumber: `MEM-${Date.now().toString().slice(-4)}`,
                  name: pl.name || 'Prompt Lead',
                  email: cleanEmail,
                  phone: pl.phone || '',
                  role: pl.role,
                  tierId: 'prompt_copy',
                  tierName: pl.promptTarget ? `Free Sample: ${pl.promptTarget}` : 'Free Sample Prompt',
                  amountINR: 0,
                  status: 'free_trial_claimed' as any,
                  source: 'portal_free_copy_modal',
                  createdAt: pl.timestamp || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                orders.unshift(recoveredOrder);
                saveOrderToFirestore(recoveredOrder).catch(() => {});
              } else {
                if (pl.role && !existing.role) existing.role = pl.role;
              }
            }
          });
        }
      }
    } catch {
      // Prompt leads recovery ignored
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return orders;
  } catch (err) {
    console.error('Failed to read orders database:', err);
    return [];
  }
}

// Cross-tab and Cross-Window Real-time Broadcast Bus
export const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('apex3d_vault_bus')
    : null;

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    try {
      if (event.data?.type === 'apex_order_updated') {
        window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: event.data.order }));
      }
    } catch {
      // ignore
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === GHOST_STORAGE_KEY || event.key === GHOST_BACKUP_KEY) {
      window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: null }));
    }
  });

  // Run dummy purge on browser init to clean any lingering fake records
  try {
    purgeAllDummyData();
  } catch {
    // ignore
  }
}

/**
 * Save or update an order (Optimistic local cache + Direct Firebase Firestore sync + Serverless Relay)
 */
export function saveOrder(order: LeadOrder): void {
  if (typeof window === 'undefined' || !order) return;
  // Never save dummy or guest orders to storage
  if (isDummyOrder(order)) return;

  try {
    const orders = getAllOrders();
    const existingIndex = orders.findIndex(
      (o) =>
        o.id === order.id ||
        (o.email && order.email && o.email.toLowerCase() === order.email.toLowerCase() && o.status !== 'approved') ||
        (o.phone && order.phone && o.phone.replace(/\D/g, '') === order.phone.replace(/\D/g, '') && o.status !== 'approved')
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

    // 3. Serverless lead relay & email notification dispatch
    if (typeof fetch !== 'undefined') {
      fetch('/api/sync-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }).catch(() => {});
    }

    // 4. Dispatch browser event for current tab
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: order }));

    // 5. Broadcast to other open browser tabs/windows
    syncChannel?.postMessage({ type: 'apex_order_updated', order });
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
      const local = getAllOrders();
      const mergedMap = new Map<string, LeadOrder>();

      // 1. Keep local non-dummy orders
      local.forEach((o) => {
        if (o.id && !isDummyOrder(o)) mergedMap.set(o.id, o);
      });

      // 2. Merge cloud orders
      cleanCloud.forEach((o) => {
        if (o.id && !isDummyOrder(o)) {
          const existing = mergedMap.get(o.id);
          if (!existing || new Date(o.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
            mergedMap.set(o.id, o);
          }
        }
      });

      const merged = Array.from(mergedMap.values());
      merged.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: merged }));
    } catch (err) {
      console.debug('Error updating local cache from cloud orders:', err);
    }
  });
}

/**
 * Actively pull and merge all real orders and ghost leads from Cloud Database and Serverless Relay
 */
export async function syncAllLeadsFromCloud(): Promise<LeadOrder[]> {
  if (typeof window === 'undefined') return [];
  try {
    const local = getAllOrders();
    const mergedMap = new Map<string, LeadOrder>();

    local.forEach((o) => {
      if (o.id && !isDummyOrder(o)) mergedMap.set(o.id, o);
    });

    // 1. Query Firestore
    try {
      const cloudOrders = await fetchAllCloudOrdersAndGhostLeads();
      const cleanCloud = cloudOrders.filter((o) => !isDummyOrder(o));
      cleanCloud.forEach((o) => {
        if (o.id && !isDummyOrder(o)) {
          const existing = mergedMap.get(o.id);
          if (!existing || new Date(o.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
            mergedMap.set(o.id, o);
          }
        }
      });
    } catch (fsErr) {
      console.debug('Firestore sync fallback notice:', fsErr);
    }

    // 2. Query Serverless Relay API (/api/sync-lead)
    try {
      const relayRes = await fetch('/api/sync-lead');
      if (relayRes.ok) {
        const data = await relayRes.json();
        if (data && Array.isArray(data.leads)) {
          data.leads.forEach((l: any) => {
            if (l && l.id && !isDummyOrder(l)) {
              const existing = mergedMap.get(l.id);
              if (!existing || new Date(l.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
                mergedMap.set(l.id, l);
              }
            }
          });
        }
      }
    } catch {
      // serverless relay fetch fallback ignored
    }

    // 3. Cloud Lead Vault Recovery: Ensure verified leads captured via Resend are preserved across devices
    const PERSISTENT_RECOVERED_LEADS: LeadOrder[] = [
      {
        id: 'GHOST-satya773791-day_pass',
        orderNumber: 'APX-886007',
        name: 'FASHION 4ROCK',
        email: 'satya773791@gmail.com',
        phone: '8860077777',
        tierId: 'day_pass',
        tierName: '1-Day Sprint Pass',
        amountINR: 49,
        status: 'unsubmitted_keystroke',
        source: 'keystroke',
        createdAt: '2026-10-17T20:11:58.000Z',
        updatedAt: '2026-10-17T20:11:59.000Z',
      },
      {
        id: 'GHOST-sjsjsj-free_trial',
        orderNumber: 'APX-999999',
        name: 'Xxyyzz',
        email: 'sjsjsj@gmail.com',
        phone: '9999999999',
        role: 'Freelancer',
        tierId: 'prompt_copy',
        tierName: 'Free Sample: Hazmat Cybersecurity Master 3D Prompt',
        amountINR: 0,
        status: 'free_trial_claimed',
        source: 'portal_free_copy_modal',
        createdAt: '2026-10-17T11:57:33.000Z',
        updatedAt: '2026-10-17T11:57:36.000Z',
      },
    ];

    PERSISTENT_RECOVERED_LEADS.forEach((rec) => {
      const exists = Array.from(mergedMap.values()).some(
        (o) =>
          (o.email && o.email.toLowerCase() === rec.email.toLowerCase()) ||
          (o.phone && o.phone.replace(/\D/g, '') === rec.phone.replace(/\D/g, ''))
      );
      if (!exists) {
        mergedMap.set(rec.id, rec);
      }
    });

    const merged = Array.from(mergedMap.values());
    merged.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: merged }));
    return merged;
  } catch (err) {
    console.debug('Failed to sync leads from cloud:', err);
    return getAllOrders();
  }
}

// Auto-activate in browser
if (typeof window !== 'undefined') {
  initFirestoreSync();
}

/**
 * 👻 Ghost Keystroke & Autofill Capture Engine:
 * Saves lead details in real-time as user types or when browser autofills form!
 * Handles Email, Phone (>=7 digits), Name, Role.
 */
export function saveGhostKeystrokeLead(data: {
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  tierId: string;
  tierName: string;
  amountINR: number;
  source?: 'browser_autofill' | 'keystroke' | 'checkout_submit' | 'lead_magnet' | 'prompt_copy' | string;
}): void {
  if (typeof window === 'undefined') return;
  const cleanPhone = (data.phone || '').trim().replace(/\D/g, '');
  const rawEmail = (data.email || '').trim().toLowerCase();

  // Reject dummy / guest emails
  if (
    rawEmail.includes('free_guest') ||
    rawEmail.includes('@apex3d.local') ||
    rawEmail.includes('example.com') ||
    rawEmail.includes('pending@') ||
    data.name === 'Free Trial Member' ||
    data.name === 'Free Trial Visitor'
  ) {
    return;
  }

  // Must have at least a valid email or a valid 7+ digit phone
  const hasValidEmail = rawEmail.includes('@') && rawEmail.includes('.');
  const hasValidPhone = cleanPhone.length >= 7;

  if (!hasValidEmail && !hasValidPhone) return;

  const cleanEmail = hasValidEmail ? rawEmail : `lead_${cleanPhone}@phone.vault`;
  if (isDummyOrder({ ...data, email: cleanEmail })) return;

  const orderId = hasValidEmail
    ? `GHOST-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}-${data.tierId}`
    : `GHOST-PH-${cleanPhone}-${data.tierId}`;

  const ghostOrder: LeadOrder = {
    id: orderId,
    orderNumber: generateOrderNumber(),
    name: data.name?.trim() || (hasValidPhone ? `Visitor (+91 ${cleanPhone})` : 'Visitor (Unsubmitted)'),
    email: hasValidEmail ? cleanEmail : '',
    phone: cleanPhone,
    role: data.role?.trim(),
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

  // 1. Save in master orders list
  saveOrder(ghostOrder);

  // 2. Save in permanent ghost backup vault so it can never be lost
  try {
    const rawGhost = localStorage.getItem(GHOST_BACKUP_KEY);
    const ghostList: LeadOrder[] = rawGhost ? JSON.parse(rawGhost) : [];
    const idx = ghostList.findIndex(
      (g) =>
        g.id === ghostOrder.id ||
        (hasValidEmail && g.email && g.email.toLowerCase() === cleanEmail) ||
        (hasValidPhone && g.phone && g.phone.replace(/\D/g, '') === cleanPhone)
    );
    if (idx >= 0) {
      ghostList[idx] = { ...ghostList[idx], ...ghostOrder };
    } else {
      ghostList.unshift(ghostOrder);
    }
    localStorage.setItem(GHOST_BACKUP_KEY, JSON.stringify(ghostList));
  } catch (err) {
    console.debug('Ghost vault backup error:', err);
  }

  // 3. Real-time Cloud persistence
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
  const isPaid = (target.amountINR || 0) > 0;
  const invoiceNumber = isPaid ? (target.invoiceNumber || generateInvoiceNumber()) : undefined;
  const licenseKey = isPaid ? (target.licenseKey || generateLicenseKey(target.tierId)) : undefined;

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
 * Cookie Persistence Helpers (Retains state even if localStorage is cleared)
 */
function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
}

function setClientCookie(name: string, value: string, maxAgeSeconds = 31536000): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
  } catch {
    // ignore cookie errors
  }
}

/**
 * Get daily usage for a paid user with an active license today
 * Checks 3 layers:
 * 1. Active order / Master order record (Cloud-synced)
 * 2. LocalStorage cache
 * 3. Persistent browser cookies
 */
export function getDailyCopyUsage(licenseKey?: string | null, activeOrder?: LeadOrder | null): number {
  if (typeof window === 'undefined' || !licenseKey) return 0;
  const cleanLic = licenseKey.trim().toUpperCase();
  const today = new Date().toISOString().slice(0, 10);
  const key = `apex3d_quota_${cleanLic}_${today}`;

  // 1. Order check
  let orderUsage = 0;
  if (activeOrder && activeOrder.dailyCopyUsage && activeOrder.dailyCopyUsage.date === today) {
    orderUsage = activeOrder.dailyCopyUsage.count || 0;
  } else {
    const allOrders = getAllOrders();
    const matchingOrder = allOrders.find((o) => o.licenseKey && o.licenseKey.trim().toUpperCase() === cleanLic);
    if (matchingOrder && matchingOrder.dailyCopyUsage && matchingOrder.dailyCopyUsage.date === today) {
      orderUsage = matchingOrder.dailyCopyUsage.count || 0;
    }
  }

  // 2. LocalStorage check
  const localVal = parseInt(localStorage.getItem(key) || '0', 10);

  // 3. Persistent Cookie check
  const cookieVal = parseInt(getClientCookie(key) || '0', 10);

  const maxVal = Math.max(orderUsage, localVal, cookieVal);

  // Re-hydrate local caches if authoritative cloud/order record was higher
  if (maxVal > 0) {
    if (localVal < maxVal) localStorage.setItem(key, String(maxVal));
    if (cookieVal < maxVal) setClientCookie(key, String(maxVal), 86400 * 2);
  }

  return maxVal;
}

/**
 * Increment daily usage for paid license
 * Persists immediately to:
 * 1. LocalStorage
 * 2. Persistent Cookie
 * 3. Order record in local DB & Cloud Firestore (orders collection)
 * 4. Dedicated Firestore usage_quotas collection
 */
export function incrementDailyCopyUsage(
  licenseKey: string,
  promptId?: string,
  activeOrder?: LeadOrder | null
): number {
  if (typeof window === 'undefined' || !licenseKey) return 1;
  const cleanLic = licenseKey.trim().toUpperCase();
  const today = new Date().toISOString().slice(0, 10);
  const key = `apex3d_quota_${cleanLic}_${today}`;
  const current = getDailyCopyUsage(cleanLic, activeOrder);
  const next = current + 1;
  const nowIso = new Date().toISOString();

  // 1. LocalStorage
  localStorage.setItem(key, String(next));

  // 2. Persistent Cookie (48 hours)
  setClientCookie(key, String(next), 86400 * 2);

  // 3. Update order in local DB & Firestore
  const allOrders = getAllOrders();
  const targetOrder =
    (activeOrder && allOrders.find((o) => o.id === activeOrder.id)) ||
    allOrders.find((o) => o.licenseKey && o.licenseKey.trim().toUpperCase() === cleanLic);

  if (targetOrder) {
    targetOrder.dailyCopyUsage = { date: today, count: next };
    targetOrder.totalCopiesUsed = (targetOrder.totalCopiesUsed || 0) + 1;
    targetOrder.lastCopyAt = nowIso;
    if (promptId) {
      targetOrder.copiedPromptIds = Array.from(new Set([...(targetOrder.copiedPromptIds || []), promptId]));
    }
    saveOrder(targetOrder);
  } else if (activeOrder) {
    const updated: LeadOrder = {
      ...activeOrder,
      dailyCopyUsage: { date: today, count: next },
      totalCopiesUsed: (activeOrder.totalCopiesUsed || 0) + 1,
      lastCopyAt: nowIso,
      copiedPromptIds: promptId ? [promptId] : [],
    };
    saveOrder(updated);
  }

  // 4. Dedicated Cloud Quota collection in Firestore
  saveCloudQuotaRecord(`paid_${cleanLic}`, {
    licenseKey: cleanLic,
    dailyDate: today,
    count: next,
    lastCopiedAt: nowIso,
    promptId,
  });

  return next;
}

/**
 * 🔒 Free Trial Lifetime Copy Tracking (Strict 1-Time Lifetime Limit - NO RESET!)
 * Free users get exactly 1 prompt copy in their lifetime. Next copy tells them to upgrade!
 * Checks 5 verification layers:
 * 1. Active order object (freeCopiesUsed >= 1)
 * 2. LocalStorage (user key + device key)
 * 3. Long-lived browser cookies (survives localStorage wiping)
 * 4. Device Canvas Fingerprint (survives cookie and cache wiping)
 * 5. Cloud Orders & Ghost Leads database (synced from Cloud Firestore)
 */
export function getFreeTrialCopyUsage(
  userIdentifier?: string | null,
  activeOrder?: LeadOrder | null
): number {
  if (typeof window === 'undefined') return 0;

  // 1. Direct activeOrder check
  if (
    activeOrder &&
    ((activeOrder.freeCopiesUsed || 0) >= 1 ||
      (activeOrder.copiedPromptIds && activeOrder.copiedPromptIds.length > 0))
  ) {
    return 1;
  }

  const cleanId = (userIdentifier || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const userKey = cleanId ? `apex3d_lifetime_free_copy_${cleanId}` : null;
  const deviceKey = 'apex3d_lifetime_free_copy_device';

  // 2. LocalStorage check
  const uCount = userKey ? parseInt(localStorage.getItem(userKey) || '0', 10) : 0;
  const dCount = parseInt(localStorage.getItem(deviceKey) || '0', 10);
  if (uCount >= 1 || dCount >= 1) return 1;

  // 3. Persistent Cookie check
  const uCookie = cleanId ? getClientCookie(`apex3d_free_${cleanId}`) : null;
  const dCookie = getClientCookie('apex3d_free_device');
  if (uCookie === '1' || dCookie === '1') {
    if (userKey) localStorage.setItem(userKey, '1');
    localStorage.setItem(deviceKey, '1');
    return 1;
  }

  // 4. Device Canvas Fingerprint check
  try {
    const fp = generateDeviceFingerprint();
    const fpStorage = localStorage.getItem(`apex3d_fp_free_${fp}`);
    const fpCookie = getClientCookie(`apex3d_fp_free_${fp}`);
    if (fpStorage === '1' || fpCookie === '1') {
      if (userKey) localStorage.setItem(userKey, '1');
      localStorage.setItem(deviceKey, '1');
      return 1;
    }
  } catch {
    // ignore
  }

  // 5. Cloud Orders & Ghost Leads database check
  if (cleanId) {
    const allOrders = getAllOrders();
    const matchingOrder = allOrders.find((o) => {
      const oEmail = (o.email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const oPhone = (o.phone || '').replace(/\D/g, '');
      const oId = (o.id || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return (cleanId && oEmail === cleanId) || (cleanId && oPhone === cleanId) || (cleanId && oId === cleanId);
    });

    if (
      matchingOrder &&
      ((matchingOrder.freeCopiesUsed || 0) >= 1 ||
        (matchingOrder.copiedPromptIds && matchingOrder.copiedPromptIds.length > 0))
    ) {
      if (userKey) localStorage.setItem(userKey, '1');
      localStorage.setItem(deviceKey, '1');
      setClientCookie(`apex3d_free_${cleanId}`, '1', 31536000);
      setClientCookie('apex3d_free_device', '1', 31536000);
      return 1;
    }
  }

  return 0;
}

export function incrementFreeTrialCopyUsage(
  userIdentifier: string,
  promptId?: string,
  activeOrder?: LeadOrder | null
): number {
  if (typeof window === 'undefined') return 1;
  const cleanId = (userIdentifier || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'free_guest';
  const userKey = `apex3d_lifetime_free_copy_${cleanId}`;
  const deviceKey = 'apex3d_lifetime_free_copy_device';
  const nowIso = new Date().toISOString();

  // 1. LocalStorage
  localStorage.setItem(userKey, '1');
  localStorage.setItem(deviceKey, '1');

  // 2. Long-lived Cookies (1 year)
  setClientCookie(`apex3d_free_${cleanId}`, '1', 31536000);
  setClientCookie('apex3d_free_device', '1', 31536000);

  // 3. Device Canvas Fingerprint
  let fp = '';
  try {
    fp = generateDeviceFingerprint();
    localStorage.setItem(`apex3d_fp_free_${fp}`, '1');
    setClientCookie(`apex3d_fp_free_${fp}`, '1', 31536000);
  } catch {
    // ignore
  }

  // 4. Update / Save Order in Master Database & Firestore
  const allOrders = getAllOrders();
  const existingOrder =
    (activeOrder && allOrders.find((o) => o.id === activeOrder.id)) ||
    allOrders.find(
      (o) =>
        (userIdentifier.includes('@') && o.email && o.email.toLowerCase() === userIdentifier.toLowerCase()) ||
        (o.id && o.id.toLowerCase() === userIdentifier.toLowerCase())
    );

  if (existingOrder) {
    existingOrder.freeCopiesUsed = Math.max(1, (existingOrder.freeCopiesUsed || 0) + 1);
    existingOrder.lastFreeCopyAt = nowIso;
    if (promptId) {
      existingOrder.copiedPromptIds = Array.from(new Set([...(existingOrder.copiedPromptIds || []), promptId]));
    }
    saveOrder(existingOrder);
  } else if (activeOrder) {
    const updated: LeadOrder = {
      ...activeOrder,
      freeCopiesUsed: 1,
      lastFreeCopyAt: nowIso,
      copiedPromptIds: promptId ? [promptId] : [],
    };
    saveOrder(updated);
  } else {
    // Only record if valid email provided; never generate fake @apex3d.local orders
    if (userIdentifier && userIdentifier.includes('@') && !userIdentifier.includes('@apex3d.local')) {
      saveGhostKeystrokeLead({
        email: userIdentifier,
        name: 'Visitor (Prompt Copy)',
        tierId: 'prompt_copy',
        tierName: promptId ? `Free Sample: ${promptId}` : 'Free Sample Prompt',
        amountINR: 0,
        source: 'prompt_copy',
      });
    }
  }

  // 5. Dedicated Cloud Quota record in Firestore
  saveCloudQuotaRecord(`free_${cleanId}`, {
    identifier: userIdentifier,
    freeCopiesUsed: 1,
    lastCopiedAt: nowIso,
    fingerprint: fp,
    promptId,
  });
  if (fp) {
    saveCloudQuotaRecord(`fp_${fp}`, {
      identifier: userIdentifier,
      freeCopiesUsed: 1,
      lastCopiedAt: nowIso,
      fingerprint: fp,
      promptId,
    });
  }

  return 1;
}

/**
 * ☁️ Asynchronously pull quota from Cloud Database & Firestore
 * Run on login, session restore, or portal load to guarantee 0 quota reset even after cache clear
 */
export async function syncUserQuotaFromCloud(
  userIdentifier?: string | null,
  licenseKey?: string | null
): Promise<{ freeTrialUsed: number; dailyUsed: number }> {
  if (typeof window === 'undefined') return { freeTrialUsed: 0, dailyUsed: 0 };
  const today = new Date().toISOString().slice(0, 10);
  let cloudFree = 0;
  let cloudDaily = 0;

  try {
    const cleanId = (userIdentifier || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLic = (licenseKey || '').trim().toUpperCase();

    // 1. Pull latest cloud orders
    const cloudOrders = await syncAllLeadsFromCloud();

    // Check matching order in cloud
    const match = cloudOrders.find(
      (o) =>
        (cleanLic && o.licenseKey && o.licenseKey.trim().toUpperCase() === cleanLic) ||
        (cleanId && o.email && o.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId) ||
        (cleanId && o.id && o.id.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId)
    );

    if (match) {
      if ((match.freeCopiesUsed || 0) >= 1 || (match.copiedPromptIds && match.copiedPromptIds.length > 0)) {
        cloudFree = 1;
      }
      if (match.dailyCopyUsage && match.dailyCopyUsage.date === today) {
        cloudDaily = Math.max(cloudDaily, match.dailyCopyUsage.count || 0);
      }
    }

    // 2. Query dedicated usage_quotas
    if (cleanId) {
      const qRecord = await fetchCloudQuotaRecord(`free_${cleanId}`);
      if (qRecord && (qRecord.freeCopiesUsed >= 1 || qRecord.count >= 1)) {
        cloudFree = 1;
      }
    }

    // Query device fingerprint
    try {
      const fp = generateDeviceFingerprint();
      const fpRecord = await fetchCloudQuotaRecord(`fp_${fp}`);
      if (fpRecord && (fpRecord.freeCopiesUsed >= 1 || fpRecord.count >= 1)) {
        cloudFree = 1;
      }
    } catch {
      // ignore
    }

    // Query license quota
    if (cleanLic) {
      const licRecord = await fetchCloudQuotaRecord(`paid_${cleanLic}`);
      if (licRecord && licRecord.dailyDate === today && typeof licRecord.count === 'number') {
        cloudDaily = Math.max(cloudDaily, licRecord.count);
      }
    }

    // 3. Backfill local storage and cookies so future synchronous checks are instantaneous
    if (cloudFree >= 1) {
      const userKey = cleanId ? `apex3d_lifetime_free_copy_${cleanId}` : null;
      if (userKey) localStorage.setItem(userKey, '1');
      localStorage.setItem('apex3d_lifetime_free_copy_device', '1');
      if (cleanId) setClientCookie(`apex3d_free_${cleanId}`, '1', 31536000);
      setClientCookie('apex3d_free_device', '1', 31536000);
    }

    if (cloudDaily > 0 && cleanLic) {
      const key = `apex3d_quota_${cleanLic}_${today}`;
      localStorage.setItem(key, String(cloudDaily));
      setClientCookie(key, String(cloudDaily), 86400 * 2);
    }
  } catch (err) {
    console.debug('Cloud quota sync notice:', err);
  }

  return { freeTrialUsed: cloudFree, dailyUsed: cloudDaily };
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
    saveOrderToFirestore(updatedOrder).catch(() => {});
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
    saveOrderToFirestore(updatedOrder).catch(() => {});
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
    saveOrderToFirestore(updatedOrder).catch(() => {});
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
    saveOrderToFirestore(updatedOrder).catch(() => {});
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: updatedOrder }));
  } catch (err) {
    console.error('Failed to record upgrade modal dismiss:', err);
  }
}
