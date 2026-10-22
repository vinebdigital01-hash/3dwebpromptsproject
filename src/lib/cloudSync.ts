// ==========================================
// APEX3D VAULT - Supabase Cloud Database & Live Sync Engine
// Real-time cross-device sync for orders, leads, and admin approvals
// ==========================================

import { LeadOrder, getAllOrders, saveOrder } from './leadTracker';
import { getAdminSettings, saveAdminSettings } from './adminSettings';

if (typeof window !== 'undefined') {
  window.addEventListener('apex_order_updated', (e: any) => {
    if (e.detail) {
      pushOrderToCloud(e.detail).catch(() => {});
    }
  });
}

export interface CloudSyncResult {
  success: boolean;
  message: string;
  pushedCount?: number;
  pulledCount?: number;
}

/**
 * Format local LeadOrder into Supabase row structure
 */
function serializeOrderToRow(order: LeadOrder) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    name: order.name,
    email: order.email,
    phone: order.phone,
    tier_id: order.tierId,
    tier_name: order.tierName,
    amount_inr: order.amountINR,
    status: order.status,
    utr_number: order.utrNumber || null,
    upi_id: order.upiId || null,
    invoice_number: order.invoiceNumber || null,
    license_key: order.licenseKey || null,
    rejection_reason: order.rejectionReason || null,
    approved_at: order.approvedAt || null,
    expires_at: order.expiresAt || null,
    upgrade_telemetry: order.upgradeTelemetry || null,
    utm: order.utm || null,
    raw_payload: order,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString(),
  };
}

/**
 * Parse Supabase row back to local LeadOrder
 */
function deserializeRowToOrder(row: any): LeadOrder {
  if (row.raw_payload && typeof row.raw_payload === 'object') {
    return {
      ...row.raw_payload,
      id: row.id,
      orderNumber: row.order_number || row.raw_payload.orderNumber,
      status: row.status || row.raw_payload.status,
      utrNumber: row.utr_number || row.raw_payload.utrNumber,
      licenseKey: row.license_key || row.raw_payload.licenseKey,
      invoiceNumber: row.invoice_number || row.raw_payload.invoiceNumber,
      approvedAt: row.approved_at || row.raw_payload.approvedAt,
      expiresAt: row.expires_at || row.raw_payload.expiresAt,
      upgradeTelemetry: row.upgrade_telemetry || row.raw_payload.upgradeTelemetry,
      updatedAt: row.updated_at || row.raw_payload.updatedAt,
    };
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    name: row.name,
    email: row.email,
    phone: row.phone,
    tierId: row.tier_id,
    tierName: row.tier_name,
    amountINR: Number(row.amount_inr) || 0,
    status: row.status,
    utrNumber: row.utr_number || undefined,
    upiId: row.upi_id || undefined,
    invoiceNumber: row.invoice_number || undefined,
    licenseKey: row.license_key || undefined,
    rejectionReason: row.rejection_reason || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at || undefined,
    expiresAt: row.expires_at || undefined,
    upgradeTelemetry: row.upgrade_telemetry || undefined,
    utm: row.utm || undefined,
  };
}

/**
 * Test connectivity with user's Supabase credentials
 */
export async function testCloudConnection(url: string, anonKey: string): Promise<CloudSyncResult> {
  const cleanUrl = (url || '').trim().replace(/\/+$/, '');
  const cleanKey = (anonKey || '').trim();

  if (!cleanUrl || !cleanKey) {
    return {
      success: false,
      message: 'Please provide both Supabase Project URL and Anon Public Key.',
    };
  }

  try {
    const res = await fetch(`${cleanUrl}/rest/v1/apex_orders?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      return {
        success: true,
        message: 'Connection successful! Cloud table "apex_orders" is ready.',
      };
    } else if (res.status === 404 || res.status === 400) {
      // Table doesn't exist yet, but credentials work
      return {
        success: true,
        message: 'Connected to Supabase! (Note: Run the 1-click SQL schema to create the table)',
      };
    } else if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Authentication failed. Please verify your Supabase Anon API Key.',
      };
    } else {
      return {
        success: false,
        message: `HTTP Error ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error connecting to Supabase URL.',
    };
  }
}

/**
 * Push a single order to Supabase
 */
export async function pushOrderToCloud(order: LeadOrder): Promise<boolean> {
  const settings = getAdminSettings();
  if (!settings.cloudSyncEnabled || !settings.supabaseUrl || !settings.supabaseAnonKey) {
    return false;
  }

  const cleanUrl = (settings.supabaseUrl || '').trim().replace(/\/+$/, '');
  const cleanKey = (settings.supabaseAnonKey || '').trim();
  const row = serializeOrderToRow(order);

  try {
    const res = await fetch(`${cleanUrl}/rest/v1/apex_orders`, {
      method: 'POST',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(row),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to push order to Supabase cloud:', err);
    return false;
  }
}

/**
 * Fetch all orders from Supabase cloud
 */
export async function fetchOrdersFromCloud(): Promise<LeadOrder[]> {
  const settings = getAdminSettings();
  if (!settings.cloudSyncEnabled || !settings.supabaseUrl || !settings.supabaseAnonKey) {
    return [];
  }

  const cleanUrl = (settings.supabaseUrl || '').trim().replace(/\/+$/, '');
  const cleanKey = (settings.supabaseAnonKey || '').trim();

  try {
    const res = await fetch(`${cleanUrl}/rest/v1/apex_orders?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return [];
    }

    const rows = await res.json();
    if (Array.isArray(rows)) {
      return rows.map(deserializeRowToOrder);
    }
  } catch (err) {
    console.error('Failed to fetch orders from Supabase:', err);
  }
  return [];
}

/**
 * Full two-way synchronization:
 * 1. Pushes local orders to Cloud
 * 2. Pulls new orders from Cloud to local
 */
export async function performFullCloudSync(): Promise<CloudSyncResult> {
  const settings = getAdminSettings();
  if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
    return {
      success: false,
      message: 'Cloud Sync is not configured. Add Supabase URL and Key in Settings.',
    };
  }

  const cleanUrl = (settings.supabaseUrl || '').trim().replace(/\/+$/, '');
  const cleanKey = (settings.supabaseAnonKey || '').trim();

  try {
    const localOrders = getAllOrders();
    const rowsToUpsert = localOrders.map(serializeOrderToRow);

    // 1. Batch Upsert to Cloud
    const pushRes = await fetch(`${cleanUrl}/rest/v1/apex_orders`, {
      method: 'POST',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(rowsToUpsert),
    });

    if (!pushRes.ok) {
      const errText = await pushRes.text();
      return {
        success: false,
        message: `Cloud upload error: ${errText.slice(0, 100)}`,
      };
    }

    // 2. Fetch all from Cloud
    const pullRes = await fetch(`${cleanUrl}/rest/v1/apex_orders?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
      },
    });

    let pulledCount = 0;
    if (pullRes.ok) {
      const cloudRows = await pullRes.json();
      if (Array.isArray(cloudRows)) {
        pulledCount = cloudRows.length;
        const cloudOrders = cloudRows.map(deserializeRowToOrder);

        // Merge into local storage
        for (const cOrder of cloudOrders) {
          saveOrder(cOrder);
        }
      }
    }

    const nowIso = new Date().toISOString();
    saveAdminSettings({
      cloudSyncEnabled: true,
      lastCloudSyncAt: nowIso,
    });

    return {
      success: true,
      message: `Sync successful! ${localOrders.length} pushed, ${pulledCount} cloud records reconciled.`,
      pushedCount: localOrders.length,
      pulledCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Sync failed due to network error.',
    };
  }
}

/**
 * 1-Click Supabase SQL Schema for easy zero-friction setup
 */
export function generateSupabaseSqlSchema(): string {
  return `-- ==========================================
-- APEX3D VAULT - Supabase Cloud Database Schema
-- Copy-paste this SQL script in Supabase SQL Editor and click RUN
-- ==========================================

-- 1. Create Orders & Telemetry Table
create table if not exists public.apex_orders (
  id text primary key,
  order_number text not null,
  name text not null,
  email text not null,
  phone text,
  tier_id text not null,
  tier_name text not null,
  amount_inr numeric not null,
  status text not null,
  utr_number text,
  upi_id text,
  invoice_number text,
  license_key text,
  rejection_reason text,
  approved_at timestamptz,
  expires_at timestamptz,
  upgrade_telemetry jsonb,
  utm jsonb,
  raw_payload jsonb,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

-- 2. Indexes for instant lookup by email, status, and order_number
create index if not exists idx_apex_orders_email on public.apex_orders (email);
create index if not exists idx_apex_orders_status on public.apex_orders (status);
create index if not exists idx_apex_orders_number on public.apex_orders (order_number);

-- 3. Enable Row Level Security (RLS)
alter table public.apex_orders enable row level security;

-- 4. Create Public Access Policies (Allow read/write with Supabase Anon Key)
create policy "Allow Anon Select apex_orders"
  on public.apex_orders for select
  to anon
  using (true);

create policy "Allow Anon Insert apex_orders"
  on public.apex_orders for insert
  to anon
  with check (true);

create policy "Allow Anon Update apex_orders"
  on public.apex_orders for update
  to anon
  using (true)
  with check (true);
`;
}
