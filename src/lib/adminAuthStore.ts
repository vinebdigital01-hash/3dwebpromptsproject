// =========================================================================
// APEX3D VAULT - Admin Role-Based Access Control (RBAC) & Team Management
// Super Admin: kumarrneeraj791@gmail.com (Full Master Access)
// Operations Moderators: Invited Staff (Order Approvals, Audits, Fulfillment only)
// =========================================================================

import { sendEmailViaResend, EmailDispatchResult } from './resendEmail';
import { BASE_PORTAL_URL } from './vaultEmailShowcase';

export const SUPER_ADMIN_EMAIL = 'kumarrneeraj791@gmail.com';
export const MASTER_EMERGENCY_PIN = '791000'; // Super admin emergency bypass key

export type AdminRole = 'super_admin' | 'moderator';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'invited' | 'revoked';
  invitedAt: string;
  invitedBy: string;
  lastLoginAt?: string;
  inviteToken?: string;
}

export interface AdminSession {
  email: string;
  name: string;
  role: AdminRole;
  token: string;
  loginAt: string;
}

interface StoredOtp {
  code: string;
  expiresAt: number;
}

const ADMIN_TEAM_STORAGE_KEY = 'apex3d_admin_team_v2';
const ADMIN_SESSION_STORAGE_KEY = 'apex3d_admin_session_v2';
const ADMIN_OTP_STORAGE_KEY = 'apex3d_admin_otp_store_v2';

/**
 * Initial seed with Super Admin
 */
const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'admin-super-01',
  name: 'Neeraj Kumar (Super Admin)',
  email: SUPER_ADMIN_EMAIL,
  role: 'super_admin',
  status: 'active',
  invitedAt: '2026-10-01T00:00:00.000Z',
  invitedBy: 'System Master Root',
  lastLoginAt: new Date().toISOString(),
};

/**
 * Retrieve all registered admins from storage
 */
export function getAllAdmins(): AdminUser[] {
  if (typeof window === 'undefined') return [DEFAULT_SUPER_ADMIN];
  try {
    const raw = localStorage.getItem(ADMIN_TEAM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_TEAM_STORAGE_KEY, JSON.stringify([DEFAULT_SUPER_ADMIN]));
      return [DEFAULT_SUPER_ADMIN];
    }
    const list: AdminUser[] = JSON.parse(raw);
    // Ensure Super Admin always exists and has super_admin role
    const hasSuper = list.some((a) => a.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (!hasSuper) {
      list.unshift(DEFAULT_SUPER_ADMIN);
      localStorage.setItem(ADMIN_TEAM_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch (err) {
    console.error('Failed to read admin list from localStorage:', err);
    return [DEFAULT_SUPER_ADMIN];
  }
}

/**
 * Save updated admin list
 */
function saveAdminList(list: AdminUser[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_TEAM_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('apex_admins_updated', { detail: list }));
  } catch (err) {
    console.error('Failed to save admin list:', err);
  }
}

/**
 * Check if given email is Super Admin
 */
export function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Check if email is an authorized active admin
 */
export function isAuthorizedAdminEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean === SUPER_ADMIN_EMAIL.toLowerCase()) return true;

  const admins = getAllAdmins();
  return admins.some(
    (a) => a.email.toLowerCase() === clean && a.status === 'active'
  );
}

/**
 * Find admin record by email
 */
export function getAdminRecord(email?: string): AdminUser | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const admins = getAllAdmins();
  return admins.find((a) => a.email.toLowerCase() === clean) || null;
}

/**
 * Get current active session
 */
export function getCurrentAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    
    // Validate that user is still active or is super admin
    if (session.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return session;
    }

    const admin = getAdminRecord(session.email);
    if (!admin || admin.status !== 'active') {
      logoutAdminSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Set active admin session
 */
export function setAdminSession(session: AdminSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
    
    // Update lastLoginAt in admin record
    const admins = getAllAdmins();
    const idx = admins.findIndex((a) => a.email.toLowerCase() === session.email.toLowerCase());
    if (idx !== -1) {
      admins[idx].lastLoginAt = new Date().toISOString();
      if (admins[idx].status === 'invited') {
        admins[idx].status = 'active';
      }
      saveAdminList(admins);
    }

    window.dispatchEvent(new CustomEvent('apex_admin_auth_changed', { detail: session }));
  } catch (err) {
    console.error('Failed to set admin session:', err);
  }
}

/**
 * Log out current admin
 */
export function logoutAdminSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('apex_admin_auth_changed', { detail: null }));
  } catch (err) {
    console.error('Failed to logout admin:', err);
  }
}

/**
 * Invite a new sub-admin / moderator (Only callable by Super Admin)
 */
export async function inviteAdminUser(data: {
  name: string;
  email: string;
}): Promise<{ success: boolean; message: string; admin?: AdminUser }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please provide a valid work email address.' };
  }
  if (!cleanName) {
    return { success: false, message: 'Please provide the administrator full name.' };
  }

  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'This email is already registered as the Master Super Admin.' };
  }

  const admins = getAllAdmins();
  const existing = admins.find((a) => a.email.toLowerCase() === cleanEmail);

  if (existing && existing.status === 'active') {
    return { success: false, message: `Admin ${cleanEmail} is already active.` };
  }

  const inviteToken = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

  const newAdmin: AdminUser = {
    id: existing ? existing.id : `admin-mod-${Date.now().toString(36)}`,
    name: cleanName,
    email: cleanEmail,
    role: 'moderator',
    status: 'invited',
    invitedAt: new Date().toISOString(),
    invitedBy: SUPER_ADMIN_EMAIL,
    inviteToken,
  };

  const updatedList = existing
    ? admins.map((a) => (a.email.toLowerCase() === cleanEmail ? newAdmin : a))
    : [...admins, newAdmin];

  saveAdminList(updatedList);

  // Dispatch Invitation & Duty Briefing Email
  const emailRes = await sendAdminInvitationEmail(newAdmin);

  return {
    success: true,
    message: emailRes.success
      ? `Invitation & duty briefing email successfully dispatched to ${cleanEmail}!`
      : `Admin created, but email dispatch had a warning: ${emailRes.message}`,
    admin: newAdmin,
  };
}

/**
 * Re-send invitation email to an existing admin
 */
export async function resendAdminInvitation(adminId: string): Promise<{ success: boolean; message: string }> {
  const admins = getAllAdmins();
  const target = admins.find((a) => a.id === adminId);
  if (!target) {
    return { success: false, message: 'Administrator record not found.' };
  }

  // Refresh token
  target.inviteToken = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  saveAdminList(admins);

  const res = await sendAdminInvitationEmail(target);
  return {
    success: res.success,
    message: res.success
      ? `Invitation resent to ${target.email} successfully!`
      : `Failed to dispatch: ${res.message}`,
  };
}

/**
 * Revoke or remove admin access
 */
export function revokeAdminAccess(adminId: string): { success: boolean; message: string } {
  const admins = getAllAdmins();
  const target = admins.find((a) => a.id === adminId);
  if (!target) return { success: false, message: 'Admin not found.' };
  if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'Cannot revoke Super Admin access.' };
  }

  target.status = 'revoked';
  saveAdminList(admins);

  // If current session is this user, log them out
  const current = getCurrentAdminSession();
  if (current && current.email.toLowerCase() === target.email.toLowerCase()) {
    logoutAdminSession();
  }

  return { success: true, message: `Access for ${target.name} has been revoked.` };
}

/**
 * Delete admin completely
 */
export function deleteAdminPermanently(adminId: string): { success: boolean; message: string } {
  const admins = getAllAdmins();
  const target = admins.find((a) => a.id === adminId);
  if (!target) return { success: false, message: 'Admin not found.' };
  if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'Cannot delete Super Admin.' };
  }

  const updated = admins.filter((a) => a.id !== adminId);
  saveAdminList(updated);

  const current = getCurrentAdminSession();
  if (current && current.email.toLowerCase() === target.email.toLowerCase()) {
    logoutAdminSession();
  }

  return { success: true, message: `Admin ${target.email} removed permanently.` };
}

/**
 * Generate & send a 6-digit OTP verification code to authorized admin email
 */
export async function sendAdminLoginOtp(email: string): Promise<{ success: boolean; message: string }> {
  const clean = email.trim().toLowerCase();
  const isSuper = clean === SUPER_ADMIN_EMAIL.toLowerCase();
  const admins = getAllAdmins();
  const user = admins.find((a) => a.email.toLowerCase() === clean);

  if (!isSuper && (!user || user.status === 'revoked')) {
    return {
      success: false,
      message: `Access denied. Email "${email}" is not authorized as an administrator. Please request an invite from Super Admin (kumarrneeraj791@gmail.com).`,
    };
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP in localStorage
  try {
    const raw = localStorage.getItem(ADMIN_OTP_STORAGE_KEY) || '{}';
    const store: Record<string, StoredOtp> = JSON.parse(raw);
    store[clean] = { code, expiresAt };
    localStorage.setItem(ADMIN_OTP_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save OTP:', err);
  }

  const roleLabel = isSuper ? 'Master Super Admin' : 'Operations Moderator';
  const recipientName = user?.name || (isSuper ? 'Neeraj Kumar' : 'Administrator');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Vine B Digital Admin Access Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 36px 12px; background-color: #06060c;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #0c0c16; border: 1px solid #242438; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981);"></td>
          </tr>
          <tr>
            <td style="padding: 28px 32px 16px 32px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div style="font-family: monospace; font-size: 10px; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.15em;">
                VINE B DIGITAL // SECURITY AUTHENTICATION
              </div>
              <h1 style="margin: 10px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                Admin Portal Access Verification
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Hello <strong style="color: #ffffff;">${recipientName}</strong>,<br><br>
              A sign-in request was initiated for your <strong style="color: #60a5fa;">${roleLabel}</strong> account on the 3D Vault Administration Console.
              <br><br>
              Use the single-use 6-digit verification code below to authenticate your session:
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px 32px;" align="center">
              <div style="display: inline-block; background-color: #070710; border: 2px solid #3b82f6; border-radius: 12px; padding: 18px 36px; font-family: 'SF Mono', Consolas, monospace; font-size: 32px; font-weight: 900; letter-spacing: 0.25em; color: #ffffff; text-shadow: 0 0 15px rgba(59,130,246,0.6);">
                ${code}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 10px; font-family: monospace;">
                Valid for 10 minutes &bull; Single-use only &bull; Do not share with anyone
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 28px 32px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #52525b; line-height: 1.5;">
              If you did not request this verification code, please ignore this email or notify Super Admin Neeraj Kumar (<a href="mailto:${SUPER_ADMIN_EMAIL}" style="color: #60a5fa;">${SUPER_ADMIN_EMAIL}</a>).
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const dispatch = await sendEmailViaResend({
    to: clean,
    subject: `🔐 Your Admin Access Code: [ ${code} ] // Vine B Digital 3D Vault`,
    html,
    text: `Your 6-digit Admin Access Code is: ${code}. Valid for 10 minutes.`,
  });

  return {
    success: true,
    message: dispatch.success
      ? `Verification code dispatched to ${clean}!`
      : `Code generated: ${code} (Resend note: ${dispatch.message})`,
  };
}

/**
 * Verify 6-digit OTP code
 */
export function verifyAdminOtpCode(
  email: string,
  inputCode: string
): { success: boolean; message: string; session?: AdminSession } {
  const clean = email.trim().toLowerCase();
  const code = inputCode.trim();

  // Emergency PIN check for Super Admin
  if (clean === SUPER_ADMIN_EMAIL.toLowerCase() && code === MASTER_EMERGENCY_PIN) {
    const session: AdminSession = {
      email: SUPER_ADMIN_EMAIL,
      name: 'Neeraj Kumar (Super Admin)',
      role: 'super_admin',
      token: `sess_${Date.now().toString(36)}`,
      loginAt: new Date().toISOString(),
    };
    setAdminSession(session);
    return { success: true, message: 'Super Admin master PIN authenticated successfully.', session };
  }

  try {
    const raw = localStorage.getItem(ADMIN_OTP_STORAGE_KEY) || '{}';
    const store: Record<string, StoredOtp> = JSON.parse(raw);
    const record = store[clean];

    if (!record) {
      return { success: false, message: 'No active verification code found. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      delete store[clean];
      localStorage.setItem(ADMIN_OTP_STORAGE_KEY, JSON.stringify(store));
      return { success: false, message: 'Verification code expired. Please request a new one.' };
    }

    if (record.code !== code) {
      return { success: false, message: 'Incorrect verification code. Please check your email and try again.' };
    }

    // Code matches! Clear OTP
    delete store[clean];
    localStorage.setItem(ADMIN_OTP_STORAGE_KEY, JSON.stringify(store));

    const isSuper = clean === SUPER_ADMIN_EMAIL.toLowerCase();
    const admin = getAdminRecord(clean);

    const session: AdminSession = {
      email: clean,
      name: admin?.name || (isSuper ? 'Neeraj Kumar' : 'Administrator'),
      role: isSuper ? 'super_admin' : (admin?.role || 'moderator'),
      token: `sess_${Date.now().toString(36)}`,
      loginAt: new Date().toISOString(),
    };

    setAdminSession(session);
    return { success: true, message: 'Authentication successful! Welcome to the Admin Console.', session };
  } catch (err: any) {
    return { success: false, message: err.message || 'Verification error' };
  }
}

/**
 * Verify Magic Invite Token from email link
 */
export function verifyAdminInviteToken(
  token: string,
  email: string
): { success: boolean; message: string; session?: AdminSession } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();
  const admins = getAllAdmins();

  const target = admins.find(
    (a) => a.email.toLowerCase() === cleanEmail && a.inviteToken === cleanToken
  );

  if (!target) {
    return { success: false, message: 'Invalid or expired invitation token.' };
  }

  if (target.status === 'revoked') {
    return { success: false, message: 'This administrator account has been revoked by Super Admin.' };
  }

  // Activate admin and start session
  target.status = 'active';
  target.lastLoginAt = new Date().toISOString();
  saveAdminList(admins);

  const session: AdminSession = {
    email: target.email,
    name: target.name,
    role: target.role,
    token: `sess_${Date.now().toString(36)}`,
    loginAt: new Date().toISOString(),
  };

  setAdminSession(session);
  return { success: true, message: `Welcome to the team, ${target.name}!`, session };
}

/**
 * Dispatch Official Appointment & Duty Briefing Email to invited admin
 */
async function sendAdminInvitationEmail(admin: AdminUser): Promise<EmailDispatchResult> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://3dwebprompts-vineb.vercel.app';
  const magicLink = `${origin}/#admin?inviteToken=${encodeURIComponent(admin.inviteToken || '')}&email=${encodeURIComponent(admin.email)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Admin Appointment // Vine B Digital</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 36px 12px; background-color: #06060c;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #0c0c16; border: 1px solid #242438; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 50px rgba(0,0,0,0.8);">
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', Consolas, monospace; font-size: 10px; color: #10b981; letter-spacing: 0.15em; text-transform: uppercase; font-weight: bold;">
                      VINE B DIGITAL // EXECUTIVE OPERATIONS
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); border-radius: 999px; font-size: 10px; font-family: monospace; color: #60a5fa; font-weight: bold;">
                      ROLE: OPERATIONS MODERATOR
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; line-height: 1.3;">
                Official Appointment: 3D Vault Operations Administrator
              </h1>
            </td>
          </tr>

          <!-- Welcome & Authority Notice -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; font-size: 14px; line-height: 1.65; color: #9ca3af;">
              Dear <strong style="color: #ffffff;">${admin.name}</strong>,<br><br>
              You have been appointed as an <strong style="color: #60a5fa;">Operations Administrator &amp; Payment Verifier</strong> for the Vine B Digital 3D Architecture Vault by Super Admin <strong style="color: #ffffff;">Neeraj Kumar</strong> (<span style="font-family: monospace; color: #34d399;">${SUPER_ADMIN_EMAIL}</span>).
              <br><br>
              Your administrative duties and operational permissions have been configured below. Please review your scope of authority carefully.
            </td>
          </tr>

          <!-- Core Duties Table -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #34d399; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px;">
                &#9889; YOUR CORE OPERATIONAL DUTIES &amp; RESPONSIBILITIES:
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #080812; border: 1px solid #1f1f33; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <div style="font-size: 13px; font-weight: bold; color: #ffffff;">1. Bank UTR Reconciliation &amp; UPI Verification</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.5;">
                      Inspect incoming customer orders. Match customer-submitted Bank UTR references against real-time credits in the Slice Merchant UPI account (<strong style="color: #ffffff;">s5305704393562990@slc</strong>).
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <div style="font-size: 13px; font-weight: bold; color: #ffffff;">2. 1-Click Order Approval &amp; Customer Provisioning</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.5;">
                      Click <em>"Approve &amp; Grant Access"</em> to automatically trigger instant license generation, MSME commercial invoice issuance (UDYAM-UP-29-0208780), and email dispatch to the buyer.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <div style="font-size: 13px; font-weight: bold; color: #ffffff;">3. Rejection / Uncredited Payment Handling</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.5;">
                      Flag or reject invalid submissions with a clear explanation so customers can re-verify their bank transfer or contact WhatsApp support.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 13px; font-weight: bold; color: #ffffff;">4. Abandoned Checkout (Ghost Leaks) Monitoring</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.5;">
                      Observe real-time lead capture telemetry to identify potential buyers who paused during the checkout flow.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Policy / Access Restrictions (User explicit requirement) -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 8px; padding: 14px 18px;">
                <tr>
                  <td>
                    <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #f87171; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">
                      &#128274; SECURITY BOUNDARY &amp; RESTRICTIONS:
                    </div>
                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                      As an Operations Moderator, your permissions are strictly focused on <strong>Order Approvals &amp; Fulfillments</strong>. Platform financial configurations, Merchant UPI VPAs, Pricing tiers, API credentials, and Team management remain locked and restricted exclusively to Super Admin (<strong style="color: #ffffff;">${SUPER_ADMIN_EMAIL}</strong>).
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button (1-Click Accept & Enter Workspace) -->
          <tr>
            <td style="padding: 0 32px 28px 32px;" align="center">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 10px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); text-align: center;">
                    <a href="${magicLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em;">
                      ⚡ Accept Appointment &amp; Enter Admin Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #64748b; margin-top: 10px; font-family: monospace;">
                One-click instant login &bull; Session auto-authenticated for ${admin.email}
              </div>
            </td>
          </tr>

          <!-- Support & Footer -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
              Appointed by Vine B Digital Marketing Agency &bull; Executive Operations<br>
              Direct questions to Super Admin: <a href="mailto:${SUPER_ADMIN_EMAIL}" style="color: #60a5fa;">${SUPER_ADMIN_EMAIL}</a> &bull; WhatsApp Desk: +91 8860090791
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmailViaResend({
    to: admin.email,
    subject: `⚡ You have been appointed as Operations Administrator // Vine B Digital 3D Vault`,
    html,
    text: `Hello ${admin.name}, you have been appointed as an Operations Administrator for Vine B Digital 3D Vault. Your duty is order approvals and payment reconciliations. Accept your appointment here: ${magicLink}`,
  });
}
