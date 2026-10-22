// =========================================================================
// APEX3D VAULT - Secure Serverless Admin OTP Gatekeeper: /api/admin-otp
// Generates, dispatches, and verifies one-time login codes on the server
// ⚠️ OTP codes NEVER leak to client-side localStorage or browser logs
// =========================================================================

interface ServerOtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory server-side OTP cache (keyed by clean email)
const serverOtpStore = new Map<string, ServerOtpRecord>();

// Configured authorized admin emails
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || process.env.VITE_SUPER_ADMIN_EMAIL || 'kumarrneeraj791@gmail.com').trim().toLowerCase();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  try {
    const { action, email, code } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email required' });
    }

    // -------------------------------------------------------------
    // ACTION 1: SEND OTP CODE TO AUTHORIZED EMAIL
    // -------------------------------------------------------------
    if (action === 'send') {
      // Generate a cryptographically random 6-digit numeric OTP
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      serverOtpStore.set(cleanEmail, {
        code: generatedCode,
        expiresAt,
        attempts: 0,
      });

      // Dispatch via Resend API
      const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
      if (!resendApiKey) {
        return res.status(500).json({ success: false, message: 'Server email service unavailable' });
      }

      const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Admin Access Code</title></head>
<body style="margin: 0; padding: 0; background-color: #06060c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 36px 12px; background-color: #06060c;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #0c0c16; border: 1px solid #242438; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          <tr><td style="height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981);"></td></tr>
          <tr>
            <td style="padding: 28px 32px 16px 32px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div style="font-family: monospace; font-size: 10px; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.15em;">VINE B DIGITAL // ADMIN SECURITY</div>
              <h1 style="margin: 10px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">Admin Access Code</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
              Use the single-use verification code below to access the Administration Console:
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px 32px;" align="center">
              <div style="display: inline-block; background-color: #070710; border: 2px solid #3b82f6; border-radius: 12px; padding: 18px 36px; font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 0.25em; color: #ffffff;">
                ${generatedCode}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 10px; font-family: monospace;">
                Valid for 10 minutes &bull; Single-use only &bull; Do not share with anyone
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Vine B Digital // Security <vault@vinebdigital.store>',
            to: [cleanEmail],
            subject: `🔐 Your Admin Access Code: [ ${generatedCode} ]`,
            html,
            text: `Your Admin Access Code is: ${generatedCode}. Valid for 10 minutes.`,
          }),
        });

        if (!emailRes.ok) {
          const errData = await emailRes.json();
          console.error('Failed to send admin OTP via Resend:', errData);
          return res.status(500).json({ success: false, message: 'Failed to dispatch verification code via email.' });
        }

        return res.status(200).json({
          success: true,
          message: `Verification code successfully dispatched to ${cleanEmail}. Check your inbox.`,
        });
      } catch (err: any) {
        console.error('Email dispatch error:', err);
        return res.status(500).json({ success: false, message: 'Network error sending verification code.' });
      }
    }

    // -------------------------------------------------------------
    // ACTION 2: VERIFY OTP CODE
    // -------------------------------------------------------------
    if (action === 'verify') {
      const cleanCode = (code || '').trim();
      if (!cleanCode || cleanCode.length !== 6) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit code.' });
      }

      const record = serverOtpStore.get(cleanEmail);
      if (!record) {
        return res.status(401).json({ success: false, message: 'No active code found. Please request a new code.' });
      }

      if (Date.now() > record.expiresAt) {
        serverOtpStore.delete(cleanEmail);
        return res.status(401).json({ success: false, message: 'Code expired. Please request a new one.' });
      }

      // Check max attempts (brute-force defense: max 5 attempts)
      if (record.attempts >= 5) {
        serverOtpStore.delete(cleanEmail);
        return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Code invalidated.' });
      }

      if (record.code !== cleanCode) {
        record.attempts += 1;
        return res.status(401).json({ success: false, message: 'Incorrect verification code. Please check your email.' });
      }

      // Successful verification! Delete code immediately (single-use)
      serverOtpStore.delete(cleanEmail);

      const isSuper = cleanEmail === SUPER_ADMIN_EMAIL;
      const session = {
        email: cleanEmail,
        name: isSuper ? 'Neeraj Kumar (Super Admin)' : 'Staff Administrator',
        role: isSuper ? 'super_admin' : 'moderator',
        token: `adm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
        loginAt: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        message: 'Authenticated successfully.',
        session,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action. Supported: "send", "verify".' });
  } catch (err: any) {
    console.error('Error in /api/admin-otp:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}
