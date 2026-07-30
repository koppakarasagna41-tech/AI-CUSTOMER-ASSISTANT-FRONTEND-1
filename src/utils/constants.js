/**
 * constants.js — Application-wide constants
 *
 * Centralising magic strings and numbers here prevents typos
 * and makes global changes trivial.
 */

// ── App meta ──────────────────────────────────────────────────
export const APP_NAME = 'AI Support';
export const APP_VERSION = '1.0.0';

// ── Route paths ───────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  HISTORY: '/history',
  CONVERSATION_DETAIL: '/history/:conversationId',
  TICKETS: '/tickets',
  KNOWLEDGE: '/knowledge',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
};

// ── localStorage keys ─────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_REFRESH_TOKEN: 'auth_refresh_token',
  AUTH_USER: 'auth_user',
  THEME: 'theme',
};

// ── API status ────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// ── Conversation statuses ─────────────────────────────────────
export const CONVERSATION_STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
  PENDING: 'pending',
};

// ── Message roles ─────────────────────────────────────────────
export const MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
};

// ── User roles ────────────────────────────────────────────────
export const USER_ROLE = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CUSTOMER: 'customer',
};

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;

// ── Analytics periods ─────────────────────────────────────────
export const ANALYTICS_PERIODS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This year', value: '1y' },
];
