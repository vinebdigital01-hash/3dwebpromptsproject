// ==========================================
// Vercel Serverless Function: Meta Conversions API (CAPI) Direct Integration
// Direct server-side tracking with SHA-256 user data hashing, client IP, FBC/FBP cookies & deduplication
// ==========================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const DEFAULT_PIXEL_ID = '4722606601349243';

/**
 * Clean & SHA-256 hash string for Meta customer parameters
 */
function hashString(val?: string): string | undefined {
  if (!val || typeof val !== 'string') return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * Clean phone number to digits only and SHA-256 hash
 */
function hashPhone(phone?: string): string | undefined {
  if (!phone || typeof phone !== 'string') return undefined;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  // If standard 10-digit number without country code, prepend India country code 91 for maximum Meta matching
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return crypto.createHash('sha256').update(digits).digest('hex');
}

/**
 * Parse first and last names and SHA-256 hash
 */
function hashName(fullName?: string): { fn?: string[]; ln?: string[] } {
  if (!fullName || typeof fullName !== 'string') return {};
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return {};
  const fn = hashString(parts[0]);
  const ln = parts.length > 1 ? hashString(parts.slice(1).join(' ')) : undefined;
  return {
    ...(fn ? { fn: [fn] } : {}),
    ...(ln ? { ln: [ln] } : {}),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS for browser client requests
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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  const {
    eventName,
    eventId,
    eventSourceUrl,
    userData = {},
    customData = {},
    testEventCode,
    pixelId: customPixelId,
    accessToken: customToken,
  } = req.body || {};

  if (!eventName) {
    return res.status(400).json({ message: 'Missing required field: eventName' });
  }

  const pixelId =
    customPixelId ||
    process.env.META_PIXEL_ID ||
    process.env.VITE_META_PIXEL_ID ||
    DEFAULT_PIXEL_ID;

  const token =
    customToken ||
    process.env.META_CAPI_TOKEN ||
    process.env.VITE_META_CAPI_TOKEN ||
    '';

  if (!token || !pixelId) {
    return res.status(400).json({ message: 'Missing Meta Pixel ID or Conversions API Access Token' });
  }

  // Extract client IP address from standard proxy headers
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.headers['x-real-ip'] || req.socket?.remoteAddress || userData.clientIp;

  // Filter out localhost loopback for clean reporting
  const clientIp = typeof rawIp === 'string' && rawIp !== '::1' && rawIp !== '127.0.0.1' ? rawIp : '103.21.244.0';

  // Extract client User-Agent
  const clientUserAgent =
    (typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null) ||
    userData.clientUserAgent ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // Hash customer parameters
  const hashedEmail = hashString(userData.email);
  const hashedPhone = hashPhone(userData.phone);
  const { fn, ln } = hashName(userData.name);
  const hashedCity = hashString(userData.city);
  const hashedCountry = hashString((userData.countryCode || userData.country || 'IN').toLowerCase().trim());
  const hashedRegion = hashString(userData.region || userData.state);
  const hashedExternalId = hashString(userData.externalId || userData.sessionId);
  const hashedZip = hashString(userData.zip || userData.postalCode);

  // Extract or build FBC (Click ID) and FBP (Browser ID)
  const fbc = userData.fbc || undefined;
  const fbp = userData.fbp || undefined;

  // Construct Meta Graph API payload
  const metaUserData: Record<string, any> = {
    client_ip_address: clientIp,
    client_user_agent: clientUserAgent,
  };

  if (hashedEmail) metaUserData.em = [hashedEmail];
  if (hashedPhone) metaUserData.ph = [hashedPhone];
  if (fn) metaUserData.fn = fn;
  if (ln) metaUserData.ln = ln;
  if (hashedCity) metaUserData.ct = [hashedCity];
  if (hashedCountry) metaUserData.country = [hashedCountry];
  if (hashedRegion) metaUserData.st = [hashedRegion];
  if (hashedExternalId) metaUserData.external_id = [hashedExternalId];
  if (hashedZip) metaUserData.zp = [hashedZip];
  if (fbc) metaUserData.fbc = fbc;
  if (fbp) metaUserData.fbp = fbp;

  const singleEvent: Record<string, any> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId || `capi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    event_source_url: eventSourceUrl || 'https://3dwebprompts-vineb.vercel.app',
    action_source: 'website',
    user_data: metaUserData,
    custom_data: customData,
  };

  const payload: Record<string, any> = {
    data: [singleEvent],
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  try {
    const metaApiUrl = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
    const response = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Meta CAPI Error response:', data);
      return res.status(response.status).json({
        success: false,
        error: data.error || data,
      });
    }

    return res.status(200).json({
      success: true,
      events_received: data.events_received || 1,
      fbtrace_id: data.fbtrace_id,
      event_id: singleEvent.event_id,
    });
  } catch (err: any) {
    console.error('Meta CAPI Dispatch Exception:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while dispatching to Meta CAPI',
    });
  }
}
