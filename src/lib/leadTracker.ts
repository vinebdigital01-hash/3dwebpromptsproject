// ==========================================
// APEX3D VAULT - Lead & Order Lifecycle Engine
// Drop-off protection, ghost keystrokes, UTR verification, expiry calculations
// ==========================================

export type OrderStatus =
  | 'unsubmitted_keystroke' // User typed email/phone but never hit proceed
  | 'abandoned_at_qr'      // User proceeded to QR code but closed without entering UTR
  | 'pending_approval'     // User submitted 12-digit UTR; awaiting admin verification
  | 'approved'             // Admin accepted; account active, invoice generated
  | 'rejected';            // Admin rejected with reason

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

const SEED_ORDERS: LeadOrder[] = [
  {
    id: 'ORD-982142',
    orderNumber: 'APX-982142',
    name: 'Vikram Malhotra',
    email: 'vikram.design@agencyapex.in',
    phone: '9820194821',
    tierId: 'month_1',
    tierName: '1-Month Pro Access',
    amountINR: 299,
    status: 'pending_approval',
    utrNumber: '428190812345',
    upiId: 'vikram@okhdfcbank',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    utm: { source: 'facebook_ads', campaign: '3d_agency_scale_q2', fbclid: 'fb.1.17128491.9841' },
  },
  {
    id: 'GHOST-aditya948-day_pass',
    orderNumber: 'APX-774102',
    name: 'Aditya Sen',
    email: 'aditya.sen@gmail.com',
    phone: '9876543210',
    tierId: 'day_pass',
    tierName: '1-Day Sprint Pass',
    amountINR: 49,
    status: 'unsubmitted_keystroke',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    utm: { source: 'instagram_reels', campaign: 'awwwards_shaders', fbclid: 'ig.1.849201.21' },
  },
  {
    id: 'ORD-651902',
    orderNumber: 'APX-651902',
    name: 'Rohan Joshi',
    email: 'rohan@studiocraft.co',
    phone: '9811234567',
    tierId: 'month_6',
    tierName: '6-Month Studio Growth',
    amountINR: 699,
    status: 'abandoned_at_qr',
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 72).toISOString(),
    utm: { source: 'meta_retargeting', campaign: 'cart_abandoners_v1' },
  },
  {
    id: 'ORD-310492',
    orderNumber: 'APX-310492',
    name: 'Priya Nambiar',
    email: 'priya@voxelstudios.com',
    phone: '9899123456',
    tierId: 'lifetime',
    tierName: 'Lifetime Agency Mastermind',
    amountINR: 2999,
    status: 'approved',
    utrNumber: '419082716354',
    upiId: 'priya@icici',
    invoiceNumber: 'INV-2026-8941',
    licenseKey: 'LIC-VIP-84K2-91Q7',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    expiresAt: null,
    utm: { source: 'meta_ads', campaign: 'high_ticket_studios' },
  },
];

/**
 * Retrieve all orders from local database (mirrors Firebase Firestore)
 */
export function getAllOrders(): LeadOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ORDERS;
  } catch (err) {
    console.error('Failed to read orders database:', err);
    return SEED_ORDERS;
  }
}

/**
 * Save or update an order
 */
export function saveOrder(order: LeadOrder): void {
  if (typeof window === 'undefined') return;
  try {
    const orders = getAllOrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id || (o.email && o.email === order.email && o.status !== 'approved'));

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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

    // Dispatch custom browser event so any open Admin Console instantly updates in real-time
    window.dispatchEvent(new CustomEvent('apex_order_updated', { detail: order }));
  } catch (err) {
    console.error('Failed to save order:', err);
  }
}

/**
 * 👻 Ghost Keystroke Capture Engine:
 * Saves lead details in real-time as user types without needing them to hit submit!
 */
export function saveGhostKeystrokeLead(data: {
  email: string;
  name?: string;
  phone?: string;
  tierId: string;
  tierName: string;
  amountINR: number;
}): void {
  if (!data.email || typeof window === 'undefined') return;

  const orderId = `GHOST-${data.email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}-${data.tierId}`;
  const ghostOrder: LeadOrder = {
    id: orderId,
    orderNumber: generateOrderNumber(),
    name: data.name?.trim() || 'Visitor (Unsubmitted)',
    email: data.email.trim(),
    phone: data.phone?.trim() || '',
    tierId: data.tierId,
    tierName: data.tierName,
    amountINR: data.amountINR,
    status: 'unsubmitted_keystroke',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    utm: getAdAttribution(),
  };

  saveOrder(ghostOrder);
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
