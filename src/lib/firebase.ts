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
 * Save an order to Firestore 'orders' collection
 */
export async function saveOrderToFirestore(order: any): Promise<void> {
  if (typeof window === 'undefined' || !order || !order.id) return;
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(
      orderRef,
      {
        ...order,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // If it's a ghost lead (unsubmitted or abandoned at qr), also mirror to 'ghost_leads'
    if (order.status === 'unsubmitted_keystroke' || order.status === 'abandoned_at_qr') {
      const ghostRef = doc(db, 'ghost_leads', order.id);
      await setDoc(
        ghostRef,
        {
          ...order,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.debug('Firestore saveOrder error:', err);
  }
}

/**
 * Delete an order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
    await deleteDoc(doc(db, 'ghost_leads', orderId)).catch(() => {});
  } catch (err) {
    console.debug('Firestore deleteOrder error:', err);
  }
}

/**
 * Subscribe to real-time updates for all orders from Firestore
 */
export function subscribeToFirestoreOrders(callback: (orders: any[]) => void): Unsubscribe {
  try {
    const ordersCol = collection(db, 'orders');
    return onSnapshot(
      ordersCol,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          list.push(d.data());
        });
        // Sort descending by createdAt or updatedAt
        list.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        callback(list);
      },
      (err) => {
        console.debug('Firestore onSnapshot orders listener notice:', err);
      }
    );
  } catch (err) {
    console.debug('Failed to subscribe to Firestore orders:', err);
    return () => {};
  }
}

/**
 * Fetch all orders from Firestore once
 */
export async function fetchFirestoreOrders(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const list: any[] = [];
    snap.forEach((d) => list.push(d.data()));
    return list;
  } catch (err) {
    console.debug('Failed to fetch Firestore orders:', err);
    return [];
  }
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
  tierId: string;
  tierName: string;
  amountINR: number;
  status: string;
  createdAt: string;
  followupStage?: number;
  source?: string;
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
