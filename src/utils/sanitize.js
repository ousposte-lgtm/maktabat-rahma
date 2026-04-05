/**
 * src/utils/sanitize.js
 * ─────────────────────────────────────────────────────
 * Lightweight sanitization helpers — zero dependencies.
 * Applied to any user-supplied text before it enters
 * URLs, WhatsApp messages, or is stored/displayed.
 * ─────────────────────────────────────────────────────
 */

/** Strip HTML tags + dangerous chars, collapse whitespace, hard-cap length. */
export function sanitizeText(value, maxLen = 300) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')        // strip HTML tags
    .replace(/[<>"'`\\]/g, '')      // strip remaining injection chars
    .replace(/javascript:/gi, '')   // block JS URI scheme
    .replace(/\s+/g, ' ')           // collapse whitespace
    .trim()
    .slice(0, maxLen);
}

/** Only allow digits + single decimal point. */
export function sanitizePrice(value) {
  return String(value ?? '').replace(/[^0-9.]/g, '').slice(0, 10);
}

/** Validate URL: must be http/https, no JS/data URIs. */
export function sanitizeUrl(value) {
  if (typeof value !== 'string') return '';
  const v = value.trim().slice(0, 2000);
  if (!/^https?:\/\//i.test(v))        return '';
  if (/javascript:/i.test(v))          return '';
  if (/data:/i.test(v))               return '';
  return v;
}

/**
 * Validate an email address format.
 * Returns true if it looks like a valid email.
 */
export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
