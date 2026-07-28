/**
 * authService.js
 *
 * All authentication-related API calls.
 */

import api from './api';
import { STORAGE_KEYS } from '@/utils/constants';

function normalizeAuthResponse(payload) {
  const data = payload?.data ?? payload;
  const user = data?.user ?? null;
  const tokens = data?.tokens ?? null;
  return {
    user: user ? { ...user, name: user.full_name || user.name || user.email } : null,
    token: tokens?.access_token ?? null,
    refreshToken: tokens?.refresh_token ?? null,
  };
}

/**
 * Login with email + password.
 * Returns { user, token }
 */
export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  const normalized = normalizeAuthResponse(response);
  if (normalized.token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, normalized.token);
    localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, normalized.refreshToken);
  }
  return normalized;
}

/**
 * Register a new account.
 * Returns { user, token }
 */
export async function register({ name, email, password }) {
  const response = await api.post('/auth/register', { full_name: name, email, password });
  const normalized = normalizeAuthResponse(response);
  if (normalized.token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, normalized.token);
    localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, normalized.refreshToken);
  }
  return normalized;
}

/**
 * Logout — invalidates the server-side token.
 */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }
  return { success: true };
}

/**
 * Request a password-reset email.
 */
export async function forgotPassword({ email }) {
  return api.post('/auth/forgot-password', { email });
}

const authService = { login, register, logout, forgotPassword };
export default authService;
