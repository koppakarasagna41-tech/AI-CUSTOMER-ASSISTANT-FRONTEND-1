/**
 * authService.js
 *
 * All authentication-related API calls.
 * Currently returns mock data — swap the mock blocks with
 * real `api.post(...)` calls when the backend is ready.
 */

import api from './api';
import { DEMO_USER, DEMO_CREDENTIALS } from '@/utils/placeholderData';

/**
 * Login with email + password.
 * Returns { user, token }
 */
export async function login({ email, password }) {
  // ── MOCK — remove when backend is live ──
  await delay(800);
  if (
    email === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    return { user: DEMO_USER, token: 'mock_jwt_token_' + Date.now() };
  }
  throw { status: 401, message: 'Invalid email or password.' };
  // ── END MOCK ──

  // Real call (uncomment when backend is ready):
  // return api.post('/auth/login', { email, password });
}

/**
 * Register a new account.
 * Returns { user, token }
 */
export async function register({ name, email, password }) {
  // ── MOCK ──
  await delay(1000);
  const newUser = { ...DEMO_USER, id: 'usr_' + Date.now(), name, email };
  return { user: newUser, token: 'mock_jwt_token_' + Date.now() };
  // ── END MOCK ──

  // return api.post('/auth/register', { name, email, password });
}

/**
 * Logout — invalidates the server-side token.
 */
export async function logout() {
  // ── MOCK ──
  await delay(200);
  return { success: true };
  // ── END MOCK ──

  // return api.post('/auth/logout');
}

/**
 * Request a password-reset email.
 */
export async function forgotPassword({ email }) {
  // ── MOCK ──
  await delay(600);
  return { message: `Reset link sent to ${email}` };
  // ── END MOCK ──

  // return api.post('/auth/forgot-password', { email });
}

// ── Helper ───────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const authService = { login, register, logout, forgotPassword };
export default authService;
