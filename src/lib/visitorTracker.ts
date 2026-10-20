// ==========================================
// APEX3D VAULT // End-to-End Visitor & Ad Attribution Telemetry Engine
// Automatic tracking for Meta Ads, Google Ads, Organic Search, Dwell Time, Scroll Depth & Funnel Drop-offs
// ==========================================

import {
  saveVisitorSessionToFirestore,
  logVisitorEventToFirestore,
} from './firebase';
import { getAdminSettings } from './adminSettings';

export type TrafficChannel = 'meta_ads' | 'google_ads' | 'organic_search' | 'organic_social' | 'direct';

export interface VisitorUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  fbclid?: string;
  gclid?: string;
}

export interface VisitorEventItem {
  id: string;
  timestamp: string;
  eventType:
    | 'page_view'
    | 'scroll'
    | 'section_view'
    | 'prompt_inspect'
    | 'copy_prompt_click'
    | 'modal_open'
    | 'lead_submitted'
    | 'portal_redirect'
    | 'checkout_initiate'
    | 'checkout_dropoff'
    | 'payment_success'
    | 'session_ping';
  label: string;
  metadata?: Record<string, any>;
}

export interface VisitorSession {
  sessionId: string;
  firstSeenAt: string;
  lastActiveAt: string;
  durationSeconds: number;
  isOnline: boolean;

  // Attribution
  channel: TrafficChannel;
  referrer: string;
  landingUrl: string;
  utm: VisitorUtm;

  // Device & Client Specs
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  screenResolution: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    countryCode?: string;
    ip?: string;
  };

  // Funnel Milestones
  maxScrollPercentage: number;
  viewedSections: string[];
  inspectedPrompts: string[];
  hasClickedFreeCopy: boolean;
  hasSubmittedLead: boolean;
  hasInitiatedCheckout: boolean;
  hasConvertedPaid: boolean;

  // Associated Lead
  leadEmail?: string;
  leadName?: string;
  leadPhone?: string;
  leadRole?: string;

  // Embedded chronological activity log for instant dashboard rendering
  recentEvents: VisitorEventItem[];
}

const SESSION_KEY = 'apex3d_vis_session_id';
const SESSION_DATA_KEY = 'apex3d_vis_session_cache';
const EXCLUDE_ADMIN_KEY = 'apex3d_exclude_admin_tracking';

/**
 * 🛡️ Check if current browser client belongs to an Administrator / Store Owner
 * Automatically flags and excludes admin visits from analytics to prevent self-traffic skew.
 */
export function isAdminDevice(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    // If explicit tracking test override is present, NEVER exclude
    if (
      search.includes('track=1') ||
      search.includes('track=true') ||
      search.includes('test_visitor=1') ||
      hash.includes('track=1')
    ) {
      localStorage.removeItem(EXCLUDE_ADMIN_KEY);
      return false;
    }

    const hasAdminSession = !!localStorage.getItem('apex3d_admin_session_v2');
    const hasExplicitExclude = localStorage.getItem(EXCLUDE_ADMIN_KEY) === 'true';
    const isAtAdminUrl =
      hash.includes('#admin') ||
      window.location.pathname.startsWith('/admin');

    if (hasAdminSession || hasExplicitExclude || isAtAdminUrl) {
      if (!hasExplicitExclude) {
        localStorage.setItem(EXCLUDE_ADMIN_KEY, 'true');
      }
      return true;
    }
  } catch {}
  return false;
}

/**
 * Toggle admin device exclusion flag
 */
export function setAdminDeviceExclusion(excluded: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (excluded) {
      localStorage.setItem(EXCLUDE_ADMIN_KEY, 'true');
    } else {
      localStorage.removeItem(EXCLUDE_ADMIN_KEY);
    }
  } catch {}
}

let activeSession: VisitorSession | null = null;
let isInitialized = false;
let pingInterval: any = null;
const firedScrollDepths = new Set<number>();
const viewedSectionsSet = new Set<string>();

/**
 * Detect client device classification
 */
function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  if (/tablet|ipad|playbook|silk/i.test(ua) || (width >= 768 && width <= 1024)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua) || width < 768) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detect browser name
 */
function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  return 'Browser';
}

/**
 * Detect Operating System
 */
function detectOS(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'OS';
}

/**
 * Determine traffic source channel from query parameters & referrer
 */
function detectTrafficChannel(utm: VisitorUtm, referrer: string): TrafficChannel {
  const source = (utm.source || '').toLowerCase();
  const medium = (utm.medium || '').toLowerCase();
  const ref = (referrer || '').toLowerCase();

  // 1. Meta Ads: Click ID present or Meta source tags
  if (utm.fbclid || source.includes('facebook') || source.includes('instagram') || source.includes('meta')) {
    return 'meta_ads';
  }

  // 2. Google Ads: Click ID present or Google cpc/ppc tags
  if (utm.gclid || (source.includes('google') && (medium.includes('cpc') || medium.includes('ads') || medium.includes('ppc')))) {
    return 'google_ads';
  }

  // 3. Organic Search: Search engine referrers
  if (
    ref.includes('google.') ||
    ref.includes('bing.com') ||
    ref.includes('yahoo.com') ||
    ref.includes('duckduckgo.com') ||
    ref.includes('ecosia.org') ||
    ref.includes('baidu.com')
  ) {
    return 'organic_search';
  }

  // 4. Organic Social: Social platform referrers without ad tags
  if (
    ref.includes('instagram.com') ||
    ref.includes('facebook.com') ||
    ref.includes('t.co') ||
    ref.includes('twitter.com') ||
    ref.includes('x.com') ||
    ref.includes('youtube.com') ||
    ref.includes('linkedin.com') ||
    ref.includes('tiktok.com') ||
    ref.includes('reddit.com') ||
    ref.includes('pinterest.com')
  ) {
    return 'organic_social';
  }

  // 5. Direct
  return 'direct';
}

/**
 * Lightweight asynchronous IP-based Geolocation with timeout safety
 */
async function fetchGeoLocation(): Promise<{
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  ip?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1400);
    // Use fast JSON IP location endpoint
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json();
      return {
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        ip: data.ip,
      };
    }
  } catch {
    // ignore geo fetch failures
  }
  return {};
}

/**
 * Dynamically inject Meta Pixel and Microsoft Clarity if configured in Admin Settings or env
 */
export function initializeThirdPartyScripts(): void {
  if (typeof window === 'undefined' || isAdminDevice()) return;

  try {
    const settings = getAdminSettings();
    const metaPixelId = (settings?.metaPixelId || (import.meta as any)?.env?.VITE_META_PIXEL_ID || '').trim();
    const clarityId = (settings?.clarityProjectId || (import.meta as any)?.env?.VITE_CLARITY_PROJECT_ID || '').trim();

    // 1. Meta Pixel Injection
    if (metaPixelId && !(window as any).fbq) {
      try {
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = true;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        (window as any).fbq('init', metaPixelId);
      } catch (e) {
        console.debug('Meta Pixel init notice:', e);
      }
    }

    // 2. Microsoft Clarity Session Replays Injection
    if (clarityId && !(window as any).clarity) {
      try {
        (function(c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
          c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
          t = l.createElement(r);
          t.async = 1;
          t.src = 'https://www.clarity.ms/tag/' + i;
          y = l.getElementsByTagName(r)[0];
          y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', clarityId);
      } catch (e) {
        console.debug('Clarity init notice:', e);
      }
    }
  } catch {}
}

/**
 * Retrieve or generate Meta _fbp (Browser ID) cookie
 */
function getOrCreateFbp(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(^|;)\s*_fbp=([^;]+)/);
  if (match) return match[2];

  const sessionCached = sessionStorage.getItem('_fbp');
  if (sessionCached) return sessionCached;

  const generated = `fb.1.${Date.now()}.${Math.floor(Math.random() * 8999999999 + 1000000000)}`;
  try {
    document.cookie = `_fbp=${generated}; path=/; max-age=7776000; SameSite=Lax`;
    sessionStorage.setItem('_fbp', generated);
  } catch {}
  return generated;
}

/**
 * Retrieve or generate Meta _fbc (Click ID) cookie if fbclid is present
 */
function getOrCreateFbc(fbclid?: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(^|;)\s*_fbc=([^;]+)/);
  if (match) return match[2];

  const sessionCached = sessionStorage.getItem('_fbc');
  if (sessionCached) return sessionCached;

  const id = fbclid || sessionStorage.getItem('fbclid') || new URLSearchParams(window.location.search).get('fbclid');
  if (!id) return undefined;

  const generated = `fb.1.${Date.now()}.${id}`;
  try {
    document.cookie = `_fbc=${generated}; path=/; max-age=7776000; SameSite=Lax`;
    sessionStorage.setItem('_fbc', generated);
  } catch {}
  return generated;
}

/**
 * Dual Dispatch: Sends event to both client Meta Pixel (fbq) and Meta Conversions API (CAPI)
 * with deduplicated event_id for maximum Event Match Quality (EMQ)
 */
export function dispatchMetaEvent(
  eventName: string,
  params?: Record<string, any>,
  leadData?: { email?: string; phone?: string; name?: string }
): string {
  if (isAdminDevice()) {
    return 'admin_excluded';
  }

  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const email = leadData?.email || activeSession?.leadEmail;
  const phone = leadData?.phone || activeSession?.leadPhone;
  const name = leadData?.name || activeSession?.leadName;

  // 1. Browser Meta Pixel (fbq) with Advanced Matching
  if (typeof window !== 'undefined' && (window as any).fbq) {
    try {
      if (email || phone || name) {
        (window as any).fbq('setUserProperties', '4722606601349243', {
          em: email ? email.trim().toLowerCase() : undefined,
          ph: phone ? phone.replace(/\D/g, '') : undefined,
          fn: name ? name.trim().split(/\s+/)[0] : undefined,
        });
      }
      (window as any).fbq('track', eventName, params || {}, { eventID: eventId });
    } catch (e) {
      console.debug('Browser fbq notice:', e);
    }
  }

  // 2. Server-side Meta Conversions API (Direct CAPI Integration with 100% EMQ parameters)
  if (typeof window !== 'undefined') {
    try {
      const fbp = getOrCreateFbp();
      const fbc = getOrCreateFbc(activeSession?.utm?.fbclid);
      const externalId = activeSession?.sessionId;
      const city = activeSession?.location?.city;
      const countryCode = activeSession?.location?.countryCode || 'IN';
      const region = activeSession?.location?.region;

      fetch('/api/meta-conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName,
          eventId,
          eventSourceUrl: window.location.href,
          userData: {
            email,
            phone,
            name,
            externalId,
            city,
            countryCode,
            region,
            fbc,
            fbp,
            clientUserAgent: navigator.userAgent,
          },
          customData: params || {},
        }),
      }).catch(() => {});
    } catch {}
  }

  return eventId;
}

/**
 * Persist the current active session state both to sessionStorage and Firestore
 */
function persistSession(session: VisitorSession) {
  try {
    sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(session));
  } catch {}

  saveVisitorSessionToFirestore(session).catch((err) => {
    console.debug('Telemetry session sync notice:', err);
  });

  // Relay to real-time serverless visitor stream for instant cross-device monitoring
  if (typeof fetch !== 'undefined') {
    fetch('/api/visitor-relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }).catch(() => {});
  }
}

/**
 * Dispatch an individual behavioral event
 */
export function trackVisitorEvent(
  eventType: VisitorEventItem['eventType'],
  label: string,
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined' || isAdminDevice() || !activeSession) return;

  const nowIso = new Date().toISOString();
  const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const eventItem: VisitorEventItem = {
    id: eventId,
    timestamp: nowIso,
    eventType,
    label,
    metadata,
  };

  // 1. Append to session recent events (keep latest 35 entries)
  const currentEvents = activeSession.recentEvents || [];
  activeSession.recentEvents = [eventItem, ...currentEvents].slice(0, 35);
  activeSession.lastActiveAt = nowIso;
  activeSession.isOnline = true;

  // 2. Update session duration
  const startMs = new Date(activeSession.firstSeenAt).getTime();
  const currentMs = new Date(nowIso).getTime();
  activeSession.durationSeconds = Math.max(0, Math.floor((currentMs - startMs) / 1000));

  // 3. Update milestones based on event
  if (eventType === 'scroll' && metadata?.depth) {
    activeSession.maxScrollPercentage = Math.max(activeSession.maxScrollPercentage || 0, metadata.depth);
  }
  if (eventType === 'section_view' && metadata?.sectionId) {
    if (!activeSession.viewedSections.includes(metadata.sectionId)) {
      activeSession.viewedSections.push(metadata.sectionId);
    }
  }
  if (eventType === 'prompt_inspect' && metadata?.promptId) {
    if (!activeSession.inspectedPrompts.includes(metadata.promptId)) {
      activeSession.inspectedPrompts.push(metadata.promptId);
    }
  }
  if (eventType === 'copy_prompt_click') {
    activeSession.hasClickedFreeCopy = true;
  }
  if (eventType === 'lead_submitted') {
    activeSession.hasSubmittedLead = true;
    if (metadata?.email) activeSession.leadEmail = metadata.email;
    if (metadata?.name) activeSession.leadName = metadata.name;
    if (metadata?.phone) activeSession.leadPhone = metadata.phone;
    if (metadata?.role) activeSession.leadRole = metadata.role;
  }
  if (eventType === 'checkout_initiate') {
    activeSession.hasInitiatedCheckout = true;
  }
  if (eventType === 'payment_success') {
    activeSession.hasConvertedPaid = true;
  }

  // 4. Save session and log event to Firestore
  persistSession(activeSession);
  logVisitorEventToFirestore(eventItem).catch(() => {});
}

/**
 * 🚀 Initialize Full End-to-End Visitor & Ad Tracking
 * Call once on app startup (e.g. in App.tsx)
 */
export function initVisitorTracking(): void {
  if (typeof window === 'undefined' || isInitialized) return;

  if (isAdminDevice()) {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_DATA_KEY);
    } catch {}
    isInitialized = true;
    return;
  }

  isInitialized = true;

  // Initialize Meta Pixel & Microsoft Clarity if configured
  initializeThirdPartyScripts();

  const nowIso = new Date().toISOString();

  // 1. Session ID Handshake (preserve throughout session)
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  let cachedSession: VisitorSession | null = null;

  try {
    const rawCache = sessionStorage.getItem(SESSION_DATA_KEY);
    if (rawCache) cachedSession = JSON.parse(rawCache);
  } catch {}

  const urlParams = new URLSearchParams(window.location.search);

  // Extract UTM parameters
  const utm: VisitorUtm = {
    source: urlParams.get('utm_source') || sessionStorage.getItem('utm_source') || undefined,
    medium: urlParams.get('utm_medium') || sessionStorage.getItem('utm_medium') || undefined,
    campaign: urlParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || undefined,
    content: urlParams.get('utm_content') || sessionStorage.getItem('utm_content') || undefined,
    term: urlParams.get('utm_term') || sessionStorage.getItem('utm_term') || undefined,
    fbclid: urlParams.get('fbclid') || sessionStorage.getItem('fbclid') || undefined,
    gclid: urlParams.get('gclid') || sessionStorage.getItem('gclid') || undefined,
  };

  // Cache UTM in sessionStorage so it survives internal page navigation
  if (utm.source) sessionStorage.setItem('utm_source', utm.source);
  if (utm.medium) sessionStorage.setItem('utm_medium', utm.medium);
  if (utm.campaign) sessionStorage.setItem('utm_campaign', utm.campaign);
  if (utm.content) sessionStorage.setItem('utm_content', utm.content);
  if (utm.term) sessionStorage.setItem('utm_term', utm.term);
  if (utm.fbclid) sessionStorage.setItem('fbclid', utm.fbclid);
  if (utm.gclid) sessionStorage.setItem('gclid', utm.gclid);

  const referrer = document.referrer || '';
  const channel = detectTrafficChannel(utm, referrer);

  if (!sessionId || !cachedSession) {
    sessionId = `SES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);

    activeSession = {
      sessionId,
      firstSeenAt: nowIso,
      lastActiveAt: nowIso,
      durationSeconds: 0,
      isOnline: true,
      channel,
      referrer,
      landingUrl: window.location.href,
      utm,
      device: detectDevice(),
      browser: detectBrowser(),
      os: detectOS(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      maxScrollPercentage: 0,
      viewedSections: [],
      inspectedPrompts: [],
      hasClickedFreeCopy: false,
      hasSubmittedLead: false,
      hasInitiatedCheckout: false,
      hasConvertedPaid: false,
      recentEvents: [],
    };
  } else {
    activeSession = {
      ...cachedSession,
      lastActiveAt: nowIso,
      isOnline: true,
    };
  }

  // Initial page view event
  const landingPath = window.location.pathname + window.location.hash;
  trackVisitorEvent('page_view', `Landed on ${landingPath || 'Homepage'}`, {
    channel,
    utmCampaign: utm.campaign,
    utmSource: utm.source,
  });

  // Forward to Meta Pixel & Conversions API (CAPI)
  dispatchMetaEvent('PageView');

  // Enrich with IP Geolocation asynchronously without blocking UI
  fetchGeoLocation().then((geo) => {
    if (activeSession && (geo.city || geo.country)) {
      activeSession.location = geo;
      persistSession(activeSession);
    }
  });

  // 2. Setup Scroll Depth Milestones (25%, 50%, 75%, 90%)
  const handleScroll = () => {
    try {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) return;

      const scrollPct = Math.round((scrollTop / docHeight) * 100);

      [25, 50, 75, 90].forEach((milestone) => {
        if (scrollPct >= milestone && !firedScrollDepths.has(milestone)) {
          firedScrollDepths.add(milestone);
          trackVisitorEvent('scroll', `Scrolled to ${milestone}% of page`, { depth: milestone });
        }
      });
    } catch {}
  };

  let scrollThrottleTimer: any = null;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollThrottleTimer) return;
      scrollThrottleTimer = setTimeout(() => {
        handleScroll();
        scrollThrottleTimer = null;
      }, 250);
    },
    { passive: true }
  );

  // 3. Setup Section View Visibility Observer
  if (typeof IntersectionObserver !== 'undefined') {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id || entry.target.getAttribute('data-section');
            if (sectionId && !viewedSectionsSet.has(sectionId)) {
              viewedSectionsSet.add(sectionId);
              trackVisitorEvent('section_view', `Viewed section: ${sectionId}`, { sectionId });
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    // Watch key landmark elements once DOM ready
    setTimeout(() => {
      const targets = document.querySelectorAll(
        '#hero, #theater, #showcase, #catalog, #pricing, #faq, #portal, section[id]'
      );
      targets.forEach((t) => sectionObserver.observe(t));
    }, 800);
  }

  // 4. Regular Session Ping Heartbeat (Every 25 seconds while tab is active)
  if (pingInterval) clearInterval(pingInterval);
  pingInterval = setInterval(() => {
    if (document.visibilityState === 'visible' && activeSession) {
      const now = new Date().toISOString();
      activeSession.lastActiveAt = now;
      activeSession.isOnline = true;
      const startMs = new Date(activeSession.firstSeenAt).getTime();
      activeSession.durationSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      persistSession(activeSession);
    }
  }, 25000);

  // 5. Visibility Change & Unload Handlers (Marks offline on departure)
  const handleDeparture = () => {
    if (activeSession) {
      activeSession.isOnline = false;
      const now = new Date().toISOString();
      activeSession.lastActiveAt = now;
      const startMs = new Date(activeSession.firstSeenAt).getTime();
      activeSession.durationSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      persistSession(activeSession);
    }
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handleDeparture();
    } else if (activeSession) {
      activeSession.isOnline = true;
      activeSession.lastActiveAt = new Date().toISOString();
      persistSession(activeSession);
    }
  });

  window.addEventListener('beforeunload', handleDeparture);
}

/**
 * 🔍 Track when a visitor clicks "Inspect Specs" on a 3D prompt
 */
export function trackPromptInspect(promptId: string, promptTitle?: string): void {
  trackVisitorEvent('prompt_inspect', `Inspected prompt: ${promptTitle || promptId}`, {
    promptId,
    promptTitle,
  });
  dispatchMetaEvent('ViewContent', {
    content_name: promptTitle || promptId,
    content_category: '3D Prompt Blueprint',
  });
}

/**
 * 📥 Track when a visitor clicks "Copy Free Prompt" (before modal opens)
 */
export function trackFreeCopyClick(promptId: string, promptTitle?: string): void {
  trackVisitorEvent('copy_prompt_click', `Clicked "Copy Free Prompt": ${promptTitle || promptId}`, {
    promptId,
    promptTitle,
  });
}

/**
 * 🪟 Track when any modal is opened (Lead Magnet or Checkout)
 */
export function trackModalOpen(modalName: string): void {
  trackVisitorEvent('modal_open', `Opened modal: ${modalName}`, { modalName });
}

/**
 * 🎯 Track when visitor submits lead form details
 */
export function trackLeadSubmitted(lead: {
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  source?: string;
}): void {
  trackVisitorEvent('lead_submitted', `Lead form submitted by ${lead.name || 'Visitor'} (${lead.email})`, {
    email: lead.email,
    name: lead.name,
    phone: lead.phone,
    role: lead.role,
    source: lead.source,
  });
  dispatchMetaEvent(
    'Lead',
    {
      content_name: 'Free Starter Prompt Magnet',
      lead_role: lead.role,
    },
    lead
  );
}

/**
 * 🚀 Track when visitor is redirected to /#portal
 */
export function trackPortalRedirect(): void {
  trackVisitorEvent('portal_redirect', 'Redirected to Member Portal (/#portal)', {
    path: '/#portal',
  });
}

/**
 * 💳 Track when visitor initiates checkout on any tier
 */
export function trackCheckoutInitiate(tierId: string, priceINR?: number, tierName?: string): void {
  trackVisitorEvent('checkout_initiate', `Initiated checkout for ${tierName || tierId} (₹${priceINR || 0})`, {
    tierId,
    priceINR,
    tierName,
  });
  dispatchMetaEvent('InitiateCheckout', {
    content_name: tierName || tierId,
    value: priceINR || 0,
    currency: 'INR',
  });
}

/**
 * 🔎 Track when a visitor searches the vault
 */
export function trackSearch(searchQuery: string, category?: string): void {
  if (!searchQuery || !searchQuery.trim()) return;
  trackVisitorEvent('search', `Searched: "${searchQuery}"${category ? ` in ${category}` : ''}`, {
    query: searchQuery,
    category,
  });
  dispatchMetaEvent('Search', {
    search_string: searchQuery.trim(),
    content_category: category || 'All Prompts',
  });
}

/**
 * 💳 Track when a visitor views payment instructions / QR screen
 */
export function trackAddPaymentInfo(tierId: string, priceINR: number, paymentType = 'UPI / QR'): void {
  trackVisitorEvent('add_payment_info', `Selected payment method (${paymentType}) for ₹${priceINR}`, {
    tierId,
    priceINR,
    paymentType,
  });
  dispatchMetaEvent('AddPaymentInfo', {
    content_category: tierId,
    value: priceINR,
    currency: 'INR',
  });
}

/**
 * ⚠️ Track checkout dropoff / abandonment
 */
export function trackCheckoutDropoff(tierId: string, reason = 'Modal closed without entering UTR'): void {
  trackVisitorEvent('checkout_dropoff', `Dropped off from checkout (${tierId}): ${reason}`, {
    tierId,
    reason,
  });
}

/**
 * ✅ Track approved or submitted payment with full customer identity for Meta Purchase attribution
 */
export function trackPaymentSuccess(
  orderId: string,
  amountINR: number,
  tierName?: string,
  customerData?: { email?: string; phone?: string; name?: string }
): void {
  trackVisitorEvent('payment_success', `Payment completed: Order ${orderId} (₹${amountINR})`, {
    orderId,
    amountINR,
    tierName,
    ...customerData,
  });
  dispatchMetaEvent(
    'Purchase',
    {
      value: amountINR,
      currency: 'INR',
      content_name: tierName || 'APEX3D Vault Access',
      content_type: 'product',
      order_id: orderId,
      num_items: 1,
    },
    customerData
  );
}

/**
 * Get current active session snapshot
 */
export function getActiveVisitorSession(): VisitorSession | null {
  return activeSession;
}
