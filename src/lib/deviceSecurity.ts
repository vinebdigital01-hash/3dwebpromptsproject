// ==========================================
// APEX3D VAULT - Device & IP License Binding Engine
// Strict 1-IP / 1-Location Single-Seat Access Security
// ==========================================

import { LeadOrder, getAllOrders, saveOrder } from './leadTracker';

export interface ClientNetworkIdentity {
  ip: string;
  city: string;
  region: string;
  country: string;
  locationStr: string;
  fingerprint: string;
}

let cachedIdentity: ClientNetworkIdentity | null = null;

/**
 * Generate cryptographic-like device & browser canvas fingerprint
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server-node';
  try {
    const nav = window.navigator;
    const screen = window.screen;
    const parts = [
      nav.userAgent || '',
      nav.language || '',
      nav.platform || '',
      screen.width + 'x' + screen.height,
      screen.colorDepth || '',
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || '',
    ];

    // Minimal canvas fingerprint hash
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('APEX3D_LIC_SIG', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('APEX3D_LIC_SIG', 4, 17);
        parts.push(canvas.toDataURL().slice(-50));
      }
    } catch {
      // ignore canvas sandbox failures
    }

    const rawStr = parts.join('###');
    let hash = 0;
    for (let i = 0; i < rawStr.length; i++) {
      const char = rawStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `FP-${Math.abs(hash).toString(36).toUpperCase()}-${screen.width}X${screen.height}`;
  } catch {
    return `FP-${Math.floor(Math.random() * 1000000).toString(36)}`;
  }
}

/**
 * Fetches the client's public IP address and geographical location
 */
export async function fetchClientNetworkIdentity(): Promise<ClientNetworkIdentity> {
  if (cachedIdentity) return cachedIdentity;

  const fingerprint = generateDeviceFingerprint();
  let ip = '127.0.0.1';
  let city = 'Authorized Studio';
  let region = '';
  let country = 'IN';

  // Strategy 1: Free IP API with Geo Location
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        ip = data.ip;
        city = data.city || '';
        region = data.region || '';
        country = data.country_name || data.country || 'IN';
      }
    }
  } catch {
    // Strategy 2: Fallback to fast ipify API
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.ip) ip = data.ip;
      }
    } catch {
      // Offline fallback
      try {
        const storedIp = sessionStorage.getItem('apex_client_ip');
        if (storedIp) ip = storedIp;
      } catch {
        // ignore
      }
    }
  }

  const locationStr = [city, region, country].filter(Boolean).join(', ') || 'Authorized Network';

  try {
    sessionStorage.setItem('apex_client_ip', ip);
    sessionStorage.setItem('apex_client_location', locationStr);
  } catch {
    // ignore
  }

  cachedIdentity = {
    ip,
    city,
    region,
    country,
    locationStr,
    fingerprint,
  };

  return cachedIdentity;
}

export interface LicenseValidationResult {
  allowed: boolean;
  reason?: 'ALLOWED' | 'IP_MISMATCH' | 'NOT_FOUND' | 'EXPIRED';
  message?: string;
  boundIp?: string;
  boundLocation?: string;
  currentIp?: string;
  currentLocation?: string;
  order?: LeadOrder;
}

/**
 * 🔒 Strict Single-IP & Single-Location Enclave Verification:
 * Validates whether the license key is being used from the registered IP & Location.
 * If first time, permanently binds to this IP and location!
 */
export async function verifyAndBindLicenseAccess(order: LeadOrder): Promise<LicenseValidationResult> {
  const identity = await fetchClientNetworkIdentity();

  // If order is not yet bound to an IP, lock and bind to this first verified IP
  if (!order.boundIp) {
    const boundOrder: LeadOrder = {
      ...order,
      boundIp: identity.ip,
      boundLocation: identity.locationStr,
      boundCity: identity.city,
      boundCountry: identity.country,
      boundDeviceFingerprint: identity.fingerprint,
      boundAt: new Date().toISOString(),
      lastAccessIp: identity.ip,
      lastAccessLocation: identity.locationStr,
      lastAccessAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOrder(boundOrder);
    return {
      allowed: true,
      reason: 'ALLOWED',
      boundIp: identity.ip,
      boundLocation: identity.locationStr,
      order: boundOrder,
    };
  }

  // If order IS bound, verify if current IP matches the bound IP
  // Allow localhost during development or matching IP
  const isMatch =
    order.boundIp === identity.ip ||
    order.boundIp === '127.0.0.1' ||
    identity.ip === '127.0.0.1' ||
    (order.boundDeviceFingerprint && order.boundDeviceFingerprint === identity.fingerprint);

  if (!isMatch) {
    return {
      allowed: false,
      reason: 'IP_MISMATCH',
      message: `⛔ LICENSE LOCKED // MULTI-IP ACCESS PROHIBITED:
This commercial license (${order.licenseKey || order.orderNumber}) is strictly bound to authorized IP: ${order.boundIp} (${order.boundLocation || 'Registered Location'}).
Your current IP is: ${identity.ip} (${identity.locationStr}).
Under our Single-Seat Commercial License Policy, simultaneous login or sharing across different locations/networks is prohibited.
If you have changed your Wi-Fi/ISP or office location, please contact support@vinebdigital.store to request an authorized IP re-bind.`,
      boundIp: order.boundIp,
      boundLocation: order.boundLocation,
      currentIp: identity.ip,
      currentLocation: identity.locationStr,
      order,
    };
  }

  // Update last access timestamp and location
  const updatedOrder: LeadOrder = {
    ...order,
    lastAccessIp: identity.ip,
    lastAccessLocation: identity.locationStr,
    lastAccessAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveOrder(updatedOrder);

  return {
    allowed: true,
    reason: 'ALLOWED',
    boundIp: order.boundIp,
    boundLocation: order.boundLocation,
    order: updatedOrder,
  };
}

/**
 * 🔓 Admin Command: Reset IP Lock for a customer who changed ISPs or devices
 */
export function resetOrderIpLock(identifier: string): { success: boolean; message: string; order?: LeadOrder } {
  if (!identifier) return { success: false, message: 'Missing order identifier.' };
  const clean = identifier.trim().toLowerCase();
  const orders = getAllOrders();

  const target = orders.find(
    (o) =>
      o.id.toLowerCase() === clean ||
      o.orderNumber.toLowerCase() === clean ||
      (o.licenseKey && o.licenseKey.toLowerCase() === clean) ||
      (o.email && o.email.toLowerCase() === clean)
  );

  if (!target) {
    return { success: false, message: 'Order / License not found in database.' };
  }

  const updated: LeadOrder = {
    ...target,
    boundIp: undefined,
    boundLocation: undefined,
    boundCity: undefined,
    boundCountry: undefined,
    boundDeviceFingerprint: undefined,
    boundAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  saveOrder(updated);

  return {
    success: true,
    message: `License [${updated.licenseKey || updated.orderNumber}] IP lock successfully cleared. The next location/IP that logs in will be bound as primary.`,
    order: updated,
  };
}
