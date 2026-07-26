/**
 * helpers.js — General-purpose utility functions
 *
 * Keep all pure, framework-agnostic helpers here.
 * Import individual functions to keep bundle size lean.
 */

// ── ID generation ─────────────────────────────────────────────
/**
 * Generates a short random alphanumeric ID.
 * Good enough for client-side keys; not a UUID.
 */
export function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

// ── Date & time formatting ────────────────────────────────────
/**
 * Formats an ISO timestamp to a human-readable "time ago" string.
 * e.g.  "just now", "3 min ago", "2 hours ago", "Jul 24"
 */
export function timeAgo(isoString) {
  if (!isoString) return '';
  const now   = Date.now();
  const then  = new Date(isoString).getTime();
  const diff  = Math.floor((now - then) / 1000); // seconds

  if (diff < 60)         return 'just now';
  if (diff < 3600)       return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800)     return `${Math.floor(diff / 86400)} days ago`;

  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });
}

/**
 * Formats a timestamp to a short clock string, e.g. "2:34 PM".
 */
export function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date to a medium date string, e.g. "Jul 26, 2026".
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
}

// ── String utilities ──────────────────────────────────────────
/**
 * Truncates a string to `maxLen` characters, appending "…".
 */
export function truncate(str, maxLen = 80) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}

/**
 * Capitalises the first letter of a string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Returns user initials from a full name, e.g. "Jane Doe" → "JD".
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

// ── Validation ────────────────────────────────────────────────
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password) {
  // At least 8 chars, one uppercase, one lowercase, one digit
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// ── Number formatting ─────────────────────────────────────────
/**
 * Formats large numbers compactly: 1200 → "1.2K", 1500000 → "1.5M"
 */
export function formatCount(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// ── Object utilities ──────────────────────────────────────────
/**
 * Strips keys with null / undefined values from an object.
 * Useful when building query params.
 */
export function omitEmpty(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );
}

// ── Debounce ──────────────────────────────────────────────────
/**
 * Returns a debounced version of `fn` that fires after `delay` ms.
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Class name utility ────────────────────────────────────────
/**
 * Lightweight cx() — joins class name strings, filtering falsy values.
 * Use instead of a full clsx dependency for simple cases.
 */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
