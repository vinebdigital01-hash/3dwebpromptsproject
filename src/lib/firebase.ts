// =========================================================================
// APEX3D // Firebase Client Integration
// Authentication (Email/Password, Google, GitHub) & Analytics
// Project: dprompts-4c800
// =========================================================================

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';

const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyA8S97ReZY0nXczM-JMlW-BbcVyc5N9iEY",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "dprompts-4c800.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "dprompts-4c800",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "dprompts-4c800.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "74724497042",
  appId: env.VITE_FIREBASE_APP_ID || "1:74724497042:web:ff48dc48c11f71ae1cb84b",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-Y4E20CT89L"
};

// Initialize Firebase App (Singleton safe across hot reloads)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

/**
 * Recursively strip undefined values so Firestore setDoc never rejects with "Unsupported field value: undefined"
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  }
  return sanitized;
}

/**
 * Save an order to Firestore 'orders' collection and mirror ghost leads
 */
export async function saveOrderToFirestore(order: any): Promise<void> {
  if (typeof window === 'undefined' || !order || !order.id) return;
  try {
    const cleanData = sanitizeForFirestore({
      ...order,
      updatedAt: new Date().toISOString(),
    });

    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, cleanData, { merge: true });

    // If it's a ghost lead / abandoned lead / free lead magnet / free trial copy, also persist to 'ghost_leads'
    const isGhost =
      order.status === 'unsubmitted_keystroke' ||
      order.status === 'abandoned_at_qr' ||
      order.status === 'abandoned_checkout' ||
      order.status === 'lead_magnet' ||
      order.status === 'free_trial_claimed' ||
      order.source === 'lead_magnet' ||
      order.source === 'portal_free_copy_modal' ||
      order.tierId === 'free_pdf' ||
      order.tierId === 'prompt_copy' ||
      (order.tierId === 'member' && (order.amountINR || 0) === 0) ||
      order.isAbandoned;

    if (isGhost) {
      const ghostRef = doc(db, 'ghost_leads', order.id);
      await setDoc(ghostRef, cleanData, { merge: true }).catch(() => {});
    }
  } catch (err) {
    console.debug('Cloud saveOrder error:', err);
  }
}

/**
 * Global Firestore Cloud Blacklist & Purge Tracker
 * Collection: 'app_metadata', Doc: 'deleted_leads'
 */
export async function fetchCloudDeletedMetadata(): Promise<{ keys: string[]; purgedAllAt?: string }> {
  if (typeof window === 'undefined') return { keys: [] };
  try {
    const snap = await getDoc(doc(db, 'app_metadata', 'deleted_leads')).catch(() => null);
    if (snap && snap.exists()) {
      const data = snap.data();
      return {
        keys: Array.isArray(data.keys) ? data.keys : [],
        purgedAllAt: data.purgedAllAt || undefined,
      };
    }
  } catch (err) {
    console.debug('Failed to fetch cloud deleted metadata:', err);
  }
  return { keys: [] };
}

export async function recordDeletedLeadsToFirestore(keys: string[], purgedAll?: boolean): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const cleanKeys = keys.filter(Boolean).map((k) => k.trim().toLowerCase());
    const existing = await fetchCloudDeletedMetadata();
    const mergedKeys = Array.from(new Set([...existing.keys, ...cleanKeys]));

    const payload: any = {
      keys: mergedKeys,
      updatedAt: new Date().toISOString(),
    };
    if (purgedAll) {
      payload.purgedAllAt = new Date().toISOString();
      payload.keys = [];
    }

    await setDoc(doc(db, 'app_metadata', 'deleted_leads'), payload, { merge: true });
  } catch (err) {
    console.debug('Failed to record deleted leads to firestore:', err);
  }
}

/**
 * Delete an order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string, email?: string, phone?: string): Promise<void> {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    const keys = [orderId];
    if (email) keys.push(email);
    if (phone) keys.push(phone);
    await recordDeletedLeadsToFirestore(keys);

    await deleteDoc(doc(db, 'orders', orderId)).catch(() => {});
    await deleteDoc(doc(db, 'ghost_leads', orderId)).catch(() => {});

    await setDoc(doc(db, 'orders', orderId), { isDeleted: true, status: 'deleted_purged' }, { merge: true }).catch(() => {});
    await setDoc(doc(db, 'ghost_leads', orderId), { isDeleted: true, status: 'deleted_purged' }, { merge: true }).catch(() => {});
  } catch (err) {
    console.debug('Cloud deleteOrder error:', err);
  }
}

/**
 * Delete orders matching email or phone across Firestore
 */
export async function deleteMatchingOrdersFromFirestore(email?: string, phone?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim().replace(/\D/g, '');
    const keys: string[] = [];
    if (cleanEmail) keys.push(cleanEmail);
    if (cleanPhone) keys.push(cleanPhone);
    if (keys.length > 0) await recordDeletedLeadsToFirestore(keys);

    for (const collName of ['orders', 'ghost_leads']) {
      try {
        const snap = await getDocs(collection(db, collName));
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          const docEmail = (data.email || '').trim().toLowerCase();
          const docPhone = (data.phone || '').trim().replace(/\D/g, '');
          if (
            (cleanEmail && docEmail === cleanEmail) ||
            (cleanPhone && docPhone === cleanPhone)
          ) {
            await deleteDoc(doc(db, collName, docSnap.id)).catch(() => {});
            await setDoc(doc(db, collName, docSnap.id), { isDeleted: true, status: 'deleted_purged' }, { merge: true }).catch(() => {});
          }
        }
      } catch {}
    }
  } catch (err) {
    console.debug('Cloud deleteMatchingOrders error:', err);
  }
}

/**
 * Purge all orders and ghost leads from Firestore
 */
export async function purgeAllOrdersFromFirestore(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // 1. Record global purge timestamp in Cloud Firestore
    const purgeTime = new Date().toISOString();
    await setDoc(doc(db, 'app_metadata', 'deleted_leads'), {
      purgedAllAt: purgeTime,
      keys: [],
      updatedAt: purgeTime,
    }, { merge: true }).catch(() => {});

    // 2. Wipe/Mark all documents across 'orders' and 'ghost_leads'
    for (const collName of ['orders', 'ghost_leads']) {
      try {
        const snap = await getDocs(collection(db, collName));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, collName, docSnap.id)).catch(() => {});
          await setDoc(doc(db, collName, docSnap.id), { isDeleted: true, status: 'deleted_purged' }, { merge: true }).catch(() => {});
        }
      } catch {}
    }
  } catch (err) {
    console.debug('Cloud purgeAllOrders error:', err);
  }
}

/**
 * Subscribe to real-time updates for all orders AND ghost leads from Cloud Database
 */
export function subscribeToFirestoreOrders(callback: (orders: any[]) => void): Unsubscribe {
  try {
    const masterMap = new Map<string, any>();
    let cloudDeletedKeys = new Set<string>();
    let cloudPurgedAllAt: number = 0;

    const dispatchMerged = () => {
      const list = Array.from(masterMap.values()).filter((item) => {
        if (!item || item.isDeleted || item.status === 'deleted_purged') return false;
        const itemTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        if (cloudPurgedAllAt > 0 && itemTime <= cloudPurgedAllAt) return false;
        const id = (item.id || '').trim();
        const email = (item.email || '').trim().toLowerCase();
        const phone = (item.phone || '').trim().replace(/\D/g, '');
        if (id && cloudDeletedKeys.has(id)) return false;
        if (email && cloudDeletedKeys.has(email)) return false;
        if (phone && cloudDeletedKeys.has(phone)) return false;
        return true;
      });

      list.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callback(list);
    };

    // 0. Listen to 'app_metadata/deleted_leads'
    const unsubMetadata = onSnapshot(
      doc(db, 'app_metadata', 'deleted_leads'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.keys)) {
            cloudDeletedKeys = new Set(data.keys.map((k: string) => k.toLowerCase()));
          }
          if (data.purgedAllAt) {
            cloudPurgedAllAt = new Date(data.purgedAllAt).getTime();
          }
          dispatchMerged();
        }
      },
      (err) => console.debug('Metadata snapshot error:', err)
    );

    // 1. Listen to 'orders'
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) masterMap.set(data.id, data);
        });
        dispatchMerged();
      },
      (err) => console.debug('Orders cloud snapshot notice:', err)
    );

    // 2. Also listen to 'ghost_leads'
    const unsubGhosts = onSnapshot(
      collection(db, 'ghost_leads'),
      (snapshot) => {
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) {
            const existing = masterMap.get(data.id);
            if (!existing || new Date(data.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
              masterMap.set(data.id, data);
            }
          }
        });
        dispatchMerged();
      },
      (err) => console.debug('Ghost leads cloud snapshot notice:', err)
    );

    return () => {
      unsubMetadata();
      unsubOrders();
      unsubGhosts();
    };
  } catch (err) {
    console.debug('Failed to subscribe to cloud database:', err);
    return () => {};
  }
}

/**
 * Fetch all orders and ghost leads from Cloud Database once
 */
export async function fetchAllCloudOrdersAndGhostLeads(): Promise<any[]> {
  try {
    const meta = await fetchCloudDeletedMetadata();
    const cloudDeletedKeys = new Set((meta.keys || []).map((k: string) => k.toLowerCase()));
    const cloudPurgedAllAt = meta.purgedAllAt ? new Date(meta.purgedAllAt).getTime() : 0;

    const masterMap = new Map<string, any>();

    // 1. Get orders collection
    const ordersSnap = await getDocs(collection(db, 'orders')).catch(() => null);
    if (ordersSnap) {
      ordersSnap.forEach((d) => {
        const data = d.data();
        if (data && data.id) masterMap.set(data.id, data);
      });
    }

    // 2. Get ghost_leads collection
    const ghostSnap = await getDocs(collection(db, 'ghost_leads')).catch(() => null);
    if (ghostSnap) {
      ghostSnap.forEach((d) => {
        const data = d.data();
        if (data && data.id) {
          const existing = masterMap.get(data.id);
          if (!existing || new Date(data.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
            masterMap.set(data.id, data);
          }
        }
      });
    }

    const list = Array.from(masterMap.values()).filter((item) => {
      if (!item || item.isDeleted || item.status === 'deleted_purged') return false;
      const itemTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
      if (cloudPurgedAllAt > 0 && itemTime <= cloudPurgedAllAt) return false;
      const id = (item.id || '').trim();
      const email = (item.email || '').trim().toLowerCase();
      const phone = (item.phone || '').trim().replace(/\D/g, '');
      if (id && cloudDeletedKeys.has(id)) return false;
      if (email && cloudDeletedKeys.has(email)) return false;
      if (phone && cloudDeletedKeys.has(phone)) return false;
      return true;
    });

    list.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    return list;
  } catch (err) {
    console.debug('Failed to fetch cloud records:', err);
    return [];
  }
}

/**
 * Fetch all orders from Firestore once
 */
export async function fetchFirestoreOrders(): Promise<any[]> {
  return fetchAllCloudOrdersAndGhostLeads();
}

/**
 * Save admin member to Firestore 'admin_team'
 */
export async function saveAdminToFirestore(admin: any): Promise<void> {
  if (typeof window === 'undefined' || !admin || !admin.id) return;
  try {
    const adminRef = doc(db, 'admin_team', admin.id);
    await setDoc(adminRef, admin, { merge: true });
  } catch (err) {
    console.debug('Firestore saveAdmin error:', err);
  }
}

/**
 * Delete admin member from Firestore
 */
export async function deleteAdminFromFirestore(adminId: string): Promise<void> {
  if (typeof window === 'undefined' || !adminId) return;
  try {
    await deleteDoc(doc(db, 'admin_team', adminId));
  } catch (err) {
    console.debug('Firestore deleteAdmin error:', err);
  }
}

/**
 * Subscribe to real-time updates for admin team from Firestore
 */
export function subscribeToFirestoreAdmins(callback: (admins: any[]) => void): Unsubscribe {
  try {
    const teamCol = collection(db, 'admin_team');
    return onSnapshot(
      teamCol,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => list.push(d.data()));
        callback(list);
      },
      (err) => {
        console.debug('Firestore onSnapshot admin_team notice:', err);
      }
    );
  } catch (err) {
    console.debug('Failed to subscribe to Firestore admin_team:', err);
    return () => {};
  }
}

/**
 * Real-time Ghost Lead Cloud Sync
 * Saves unsubmitted leads to Firestore collection 'ghost_leads' for automated 24h & 48h followups
 */
export async function syncGhostLeadToCloud(lead: {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  tierId: string;
  tierName: string;
  amountINR: number;
  status: string;
  createdAt: string;
  followupStage?: number;
  source?: string;
  copiedPromptIds?: string[];
  lastFreeCopyAt?: string;
}): Promise<void> {
  if (typeof window === 'undefined' || !lead.email) return;
  try {
    const cleanEmail = lead.email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    const docId = lead.id || `GHOST-${cleanEmail}-${lead.tierId}`;
    const leadRef = doc(db, 'ghost_leads', docId);
    await setDoc(
      leadRef,
      {
        ...lead,
        followupStage: lead.followupStage ?? 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    // Also mirror to orders collection so admin can view in real time
    await saveOrderToFirestore({
      ...lead,
      id: docId,
    });
  } catch (err) {
    console.debug('Ghost lead cloud sync deferred:', err);
  }
}

// Initialize Analytics conditionally
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics unsupported environment
  });
}

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const githubProvider = new GithubAuthProvider();

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with GitHub Popup
 */
export async function loginWithGithub(): Promise<User> {
  const result = await signInWithPopup(auth, githubProvider);
  return result.user;
}

/**
 * Sign in with Email & Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

/**
 * Create Account with Email & Password
 */
export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && result.user) {
    try {
      await updateProfile(result.user, { displayName: displayName.trim() });
    } catch {
      // Ignore display name update error
    }
  }
  return result.user;
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out of Firebase
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Human-Friendly Error Messages for Firebase Auth
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';

  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address. Please sign up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled (popup was closed before completing).';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Save / Update a prompt in Cloud Database 'vault_prompts' collection
 */
export async function savePromptToFirestore(prompt: any): Promise<void> {
  if (typeof window === 'undefined' || !prompt || !prompt.id) return;
  try {
    const cleanData = sanitizeForFirestore({
      ...prompt,
      updatedAt: new Date().toISOString(),
    });
    const promptRef = doc(db, 'vault_prompts', prompt.id);
    await setDoc(promptRef, cleanData, { merge: true });
  } catch (err) {
    console.debug('Cloud savePrompt notice:', err);
  }
}

/**
 * Delete a prompt from Cloud Database
 */
export async function deletePromptFromFirestore(promptId: string): Promise<void> {
  if (typeof window === 'undefined' || !promptId) return;
  try {
    await deleteDoc(doc(db, 'vault_prompts', promptId));
  } catch (err) {
    console.debug('Cloud deletePrompt notice:', err);
  }
}

/**
 * Fetch all custom/modified prompts from Cloud Database
 */
export async function fetchPromptsFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'vault_prompts'));
    const list: any[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.id) list.push(data);
    });
    return list;
  } catch (err) {
    console.debug('Cloud fetchPrompts notice:', err);
    return [];
  }
}

/**
 * Subscribe to Cloud Database changes for prompts
 */
export function subscribeToFirestorePrompts(callback: (prompts: any[]) => void): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, 'vault_prompts'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id) list.push(data);
        });
        callback(list);
      },
      (err) => console.debug('Cloud prompts snapshot notice:', err)
    );
    return unsub;
  } catch (err) {
    console.debug('Failed to subscribe to cloud prompts:', err);
    return () => {};
  }
}

/**
 * 🔒 Persist copy quota record to Cloud Firestore 'usage_quotas' collection
 * Prevents copy limit bypass even if local cookies and browser cache are cleared!
 */
export async function saveCloudQuotaRecord(key: string, data: any): Promise<void> {
  if (typeof window === 'undefined' || !key) return;
  try {
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 80);
    if (!cleanKey) return;
    const cleanData = sanitizeForFirestore({
      ...data,
      key: cleanKey,
      updatedAt: new Date().toISOString(),
    });
    const quotaRef = doc(db, 'usage_quotas', cleanKey);
    await setDoc(quotaRef, cleanData, { merge: true });
  } catch (err) {
    console.debug('Cloud saveCloudQuotaRecord notice:', err);
  }
}

/**
 * 🔍 Fetch copy quota record from Cloud Firestore 'usage_quotas' collection
 */
export async function fetchCloudQuotaRecord(key: string): Promise<any | null> {
  if (typeof window === 'undefined' || !key) return null;
  try {
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 80);
    if (!cleanKey) return null;
    const snap = await getDoc(doc(db, 'usage_quotas', cleanKey));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.debug('Cloud fetchCloudQuotaRecord notice:', err);
    return null;
  }
}


