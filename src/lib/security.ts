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

// Comprehensive set of known disposable and temporary email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minutemail.co.uk',
  '20minutemail.it',
  'tempmail.com',
  'tempmail.net',
  'temp-mail.org',
  'temp-mail.io',
  'temp-mail.ru',
  'tempail.com',
  'tempail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.org',
  'yopmail.com',
  'yopmail.net',
  'yopmail.fr',
  'mailinator.com',
  'mailinator2.com',
  'mailin8r.com',
  'dispostable.com',
  'throwawaymail.com',
  'getairmail.com',
  'burnermail.io',
  'burnermail.com',
  'mohmal.com',
  'mohmal.im',
  'crazymailing.com',
  'fakemailgenerator.com',
  'fakemail.net',
  'generator.email',
  'inboxkitten.com',
  'emailondeck.com',
  'mytemp.email',
  'minutemail.com',
  'pokemail.net',
  'spam4.me',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'einrot.com',
  'nada.ltd',
  'nada.email',
  'dropmail.me',
  'maildrop.cc',
  'getnada.com',
  'fakeinbox.com',
  'tempinbox.com',
  'throwawayemailaddress.com',
  'safetymail.info',
  'deadaddress.com',
  'emailfake.com',
  'crazymail.com',
  'tempr.email',
  'discard.email',
  'spambog.com',
  'spambog.de',
  'mytempemail.com',
  'incognitotool.com',
  'tempmailaddress.com',
  'nowmymail.com',
  'zoemail.org',
  'tmail.ws',
  'bupmail.com',
  'crazyinbox.com',
  'spamevader.com',
  'tempemail.co',
  'tempmailo.com',
  'moakt.com',
  'moakt.ws',
  'tmail.link',
  'clipmail.eu',
  'quickinbox.com',
  'zillamail.com',
  'mailpoof.com',
  'mailpoof.org',
  'tmpmail.net',
  'tmpmail.org',
  'internxt.com',
  'inboxbear.com',
  'disposablemail.com',
  'guerrillamail.de',
  'harakirimail.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'trashymail.com',
  'emailtemporal.org',
  'correo-temporal.com',
  'jetable.org',
  'kasmail.com',
  'spambox.us',
  'anonaddy.me',
  'mailcatch.com',
  'mytrashmail.com',
  'no-spam.ws',
  'mailnull.com',
  'mintemail.com',
  'meltmail.com',
  'guerrillamail.info',
  'shortmail.com',
]);

const DISPOSABLE_REGEX = /(temp|trash|fake|burner|disposable|throwaway|10minute|minutemail|guerrilla|mohmal|yopmail|mailinator|sharklaser|maildrop|dispostable|fakeinbox)/i;

/**
 * Detects whether an email domain belongs to a disposable/temporary burner provider
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length < 2) return false;
  const domain = parts[1];
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;
  return DISPOSABLE_REGEX.test(domain);
}

/**
 * Returns human-readable validation error, specifically calling out blocked temp mails
 */
export function getEmailValidationError(email: string): string | null {
  const sanitized = email.trim().toLowerCase();
  if (!sanitized) return 'Please enter an email address.';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return 'Please enter a valid email address (e.g. rahul@example.com).';
  }
  if (isDisposableEmail(sanitized)) {
    return '⛔ Temporary / disposable email addresses (e.g. temp-mail, 10minutemail, mailinator) are strictly blocked. Please provide your permanent Google, Microsoft, Yahoo, Apple, or company email to secure your commercial license and invoice.';
  }
  return null;
}

/**
 * Validates strict RFC standard email format & blocks disposable/temporary email domains
 */
export function validateEmail(email: string): boolean {
  return getEmailValidationError(email) === null;
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
