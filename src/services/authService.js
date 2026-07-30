/**
 * authService.js
 *
 * All authentication-related API calls.
 */

import api, { setAccessToken } from './api';
import { STORAGE_KEYS, USER_ROLE } from '@/utils/constants';

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
    setAccessToken(normalized.token);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, normalized.token);
    localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, normalized.refreshToken);
  }
  return normalized;
}

/**
 * Register a new account.
 * Returns { user, token }
 */
export async function register({ name, email, password, role = null }) {
  const payload = { full_name: name, email, password };
  const normalizedRole = role === USER_ROLE.AGENT || role === 'agent'
    ? 'agent'
    : role === USER_ROLE.CUSTOMER || role === 'customer'
      ? 'customer'
      : null;

  if (normalizedRole) payload.role = normalizedRole;

  const response = await api.post('/auth/register', payload);
  const normalized = normalizeAuthResponse(response);
  if (normalized.token) {
    setAccessToken(normalized.token);
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
    setAccessToken(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }
  return { success: true };
}

const authService = { login, register, logout };
export default authService;
