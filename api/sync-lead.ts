// Vercel Serverless Function: Real-time Cloud Lead & Order Bridge (Firestore-Backed)
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection,
  deleteDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyA8S97ReZY0nXczM-JMlW-BbcVyc5N9iEY",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "dprompts-4c800.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "dprompts-4c800",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "dprompts-4c800.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "74724497042",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:74724497042:web:ff48dc48c11f71ae1cb84b",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// In-memory hot cache fallback
export const memoryLeads: any[] = [];
export const deletedLeadKeys = new Set<string>();
export let globalPurgedAt = 0;

function sanitizeForCloud(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForCloud);

  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = sanitizeForCloud(v);
    }
  }
  return clean;
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // -------------------------------------------------------------
  // GET: Fetch all active orders and leads from cloud database
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const masterMap = new Map<string, any>();

      // 1. Fetch from Firestore 'orders' collection
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        ordersSnap.forEach((d) => {
          if (d.id.startsWith('GLOBAL_') || d.id.startsWith('QUOTA_')) return;
          const data = d.data();
          const docId = (data.id || d.id || '').trim();
          if (docId && !docId.startsWith('GLOBAL_') && !docId.startsWith('QUOTA_')) {
            masterMap.set(docId, { ...data, id: docId });
          }
        });
      } catch (err) {
        console.error('[API sync-lead] Firestore orders fetch error:', err);
      }

      // 2. Fetch from Firestore 'ghost_leads' collection
      try {
        const ghostSnap = await getDocs(collection(db, 'ghost_leads'));
        ghostSnap.forEach((d) => {
          if (d.id.startsWith('GLOBAL_') || d.id.startsWith('QUOTA_')) return;
          const data = d.data();
          const docId = (data.id || d.id || '').trim();
          if (docId && !docId.startsWith('GLOBAL_') && !docId.startsWith('QUOTA_')) {
            const existing = masterMap.get(docId);
            // Never overwrite pending_approval or approved orders with abandoned ghost records
            if (existing && (existing.status === 'pending_approval' || existing.status === 'approved')) {
              return;
            }
            if (!existing || new Date(data.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
              masterMap.set(docId, { ...data, id: docId });
            }
          }
        });
      } catch (err) {
        console.error('[API sync-lead] Firestore ghost fetch error:', err);
      }

      // 3. Merge hot in-memory cache
      memoryLeads.forEach((l) => {
        if (!l || !l.id) return;
        const existing = masterMap.get(l.id);
        if (!existing || new Date(l.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
          masterMap.set(l.id, { ...l });
        }
      });

      // Filter active leads
      const activeLeads = Array.from(masterMap.values()).filter((item) => {
        if (!item || item.isDeleted || item.status === 'deleted_purged') return false;
        // Orders with pending_approval, approved, or a valid UTR are ALWAYS preserved!
        if (item.status === 'pending_approval' || item.status === 'approved' || item.utrNumber) {
          return true;
        }

        const itemId = (item.id || '').trim();
        const itemEmail = (item.email || '').trim().toLowerCase();
        const itemPhone = (item.phone || '').trim().replace(/\D/g, '');
        const itemTime = new Date(item.createdAt || item.updatedAt || 0).getTime();

        if (globalPurgedAt > 0 && itemTime <= globalPurgedAt) return false;
        if (itemId && deletedLeadKeys.has(itemId)) return false;
        if (itemEmail && deletedLeadKeys.has(itemEmail)) return false;
        if (itemPhone && deletedLeadKeys.has(itemPhone)) return false;
        return true;
      });

      activeLeads.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      return res.status(200).json({ success: true, leads: activeLeads, count: activeLeads.length });
    } catch (err: any) {
      console.error('[API sync-lead] GET error:', err);
      return res.status(500).json({ success: false, message: err.message, leads: memoryLeads });
    }
  }

  // -------------------------------------------------------------
  // POST / PUT: Save or update an order in Cloud Firestore
  // -------------------------------------------------------------
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const order = req.body || {};
      const status = order.status || 'free_trial_claimed';
      const isPendingOrApproved = status === 'pending_approval' || status === 'approved' || Boolean(order.utrNumber);

      const email = (order.email || '').trim().toLowerCase();
      const phone = (order.phone || '').trim().replace(/\D/g, '');
      const name = (order.name || '').trim();

      // Only discard true unsubmitted bot guests if not a payment transaction
      if (!isPendingOrApproved) {
        if (
          email.includes('free_guest') ||
          email.includes('@apex3d.local') ||
          email.includes('example.com') ||
          name === 'Free Trial Member' ||
          name === 'Free Trial Visitor'
        ) {
          return res.status(200).json({ status: 'ignored_dummy' });
        }
      }

      const orderId = order.id || `ORD-${Date.now().toString().slice(-6)}`;
      const nowIso = new Date().toISOString();

      const orderRecord = sanitizeForCloud({
        id: orderId,
        orderNumber: order.orderNumber || `APX-${Math.floor(100000 + Math.random() * 900000)}`,
        name: name || 'Developer',
        email: email || 'buyer@apex3d.local',
        phone: phone || '',
        role: order.role || '',
        tierId: order.tierId || 'day_pass',
        tierName: order.tierName || '1-Day Sprint Pass',
        amountINR: Number(order.amountINR) || 0,
        status: status,
        utrNumber: order.utrNumber ? String(order.utrNumber).replace(/\D/g, '') : undefined,
        upiId: order.upiId || undefined,
        licenseKey: order.licenseKey || undefined,
        invoiceNumber: order.invoiceNumber || undefined,
        approvedAt: order.approvedAt || (status === 'approved' ? nowIso : undefined),
        expiresAt: order.expiresAt || undefined,
        source: order.source || 'checkout_upi',
        utm: order.utm || undefined,
        createdAt: order.createdAt || nowIso,
        updatedAt: nowIso,
      });

      // 1. Persist directly to Firestore 'orders' collection
      try {
        await setDoc(doc(db, 'orders', orderId), orderRecord, { merge: true });
        console.log(`[API sync-lead] Saved order to Firestore 'orders/${orderId}': status=${status}, utr=${orderRecord.utrNumber || 'none'}`);
      } catch (fsErr) {
        console.error('[API sync-lead] Firestore save error:', fsErr);
      }

      // 2. If it's an abandoned lead / keystroke, also mirror to 'ghost_leads'
      const isGhost =
        status === 'unsubmitted_keystroke' ||
        status === 'abandoned_at_qr' ||
        status === 'abandoned_checkout' ||
        status === 'free_trial_claimed' ||
        order.source === 'lead_magnet';

      if (isGhost) {
        try {
          await setDoc(doc(db, 'ghost_leads', orderId), orderRecord, { merge: true });
        } catch {}
      } else if (isPendingOrApproved) {
        // If order transitioned to pending_approval or approved, remove old ghost copy so it never appears abandoned
        try {
          await deleteDoc(doc(db, 'ghost_leads', orderId));
        } catch {}
      }

      // 3. Store in hot memory cache
      const existingIdx = memoryLeads.findIndex((l) => l.id === orderId);
      if (existingIdx >= 0) {
        memoryLeads[existingIdx] = { ...memoryLeads[existingIdx], ...orderRecord };
      } else {
        memoryLeads.unshift(orderRecord);
        if (memoryLeads.length > 200) memoryLeads.pop();
      }

      return res.status(200).json({ success: true, order: orderRecord });
    } catch (err: any) {
      console.error('[API sync-lead] POST error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // -------------------------------------------------------------
  // DELETE: Purge lead or all leads from cloud
  // -------------------------------------------------------------
  if (req.method === 'DELETE') {
    try {
      const { id, all, email, phone } = req.query;
      if (all === 'true' || req.body?.all === true) {
        globalPurgedAt = Date.now();
        memoryLeads.length = 0;
        deletedLeadKeys.clear();
        return res.status(200).json({ success: true, message: 'All leads purged from relay.' });
      }

      const cleanId = (typeof id === 'string' ? id : '').trim();
      const cleanEmail = (typeof email === 'string' ? email : '').trim().toLowerCase();
      const cleanPhone = (typeof phone === 'string' ? phone : '').trim().replace(/\D/g, '');

      if (cleanId) {
        deletedLeadKeys.add(cleanId);
        try {
          await deleteDoc(doc(db, 'orders', cleanId));
          await deleteDoc(doc(db, 'ghost_leads', cleanId));
        } catch {}
      }
      if (cleanEmail) deletedLeadKeys.add(cleanEmail);
      if (cleanPhone) deletedLeadKeys.add(cleanPhone);

      for (let i = memoryLeads.length - 1; i >= 0; i--) {
        const item = memoryLeads[i];
        if (
          (cleanId && item.id === cleanId) ||
          (cleanEmail && (item.email || '').toLowerCase() === cleanEmail) ||
          (cleanPhone && (item.phone || '').replace(/\D/g, '') === cleanPhone)
        ) {
          memoryLeads.splice(i, 1);
        }
      }

      return res.status(200).json({ success: true, remaining: memoryLeads.length });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
