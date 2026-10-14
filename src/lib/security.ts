// ==========================================
// APEX3D VAULT - Client Security & Anti-Bot Shield
// ==========================================

/**
 * Strips script tags, HTML tags, and malicious injection characters from user input
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '')
    .replace(/[<>'";()]/g, '') // Remove injection symbols
    .trim();
}

/**
 * Validates strict RFC standard email format & blocks disposable/temporary email domains
 */
export function validateEmail(email: string): boolean {
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) return false;

  // Block common disposable / trash email services often used by spammers
  const disposableDomains = [
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'sharklasers.com',
    'trashmail.com',
    'yopmail.com',
  ];

  const domain = sanitized.split('@')[1];
  return !disposableDomains.includes(domain);
}

/**
 * Validates 10-digit Indian Mobile Numbers (starting with 6, 7, 8, or 9)
 */
export function validateIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Matches 10 digits directly or 12 digits with 91 country code prefix
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  return false;
}

/**
 * In-memory client rate limiter to prevent bot flood attacks
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(actionKey: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(actionKey);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(actionKey, { count: 1, resetTime: now + windowMs });
    return true; // Allowed
  }

  if (record.count >= maxAttempts) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true; // Allowed
}

/**
 * Honeypot bot detector: If hidden field is filled, it's a headless crawler/bot
 */
export function isBotTrapTriggered(honeypotValue: string): boolean {
  return typeof honeypotValue === 'string' && honeypotValue.trim().length > 0;
}

/**
 * Optional Anti-Scraper protection: Prevents casual prompt theft via right-click or DevTools shortcuts
 */
export function initAntiScraperShield() {
  if (typeof window === 'undefined') return;

  // Block right-click context menu on code snippets & prompt previews
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('pre') || target.closest('[data-protected="true"]')) {
      e.preventDefault();
    }
  });

  // Block common inspect shortcuts (F12, Ctrl+U, Ctrl+Shift+I) on protected prompt elements
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
    ) {
      // Allow for development; block in production
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    }
  });
}
