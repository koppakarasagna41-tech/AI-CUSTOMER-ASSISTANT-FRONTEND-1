/**
 * api.js — Axios instance & interceptors
 *
 * All HTTP requests go through this singleton.
 * Features:
 *  - Base URL from VITE_API_BASE_URL env variable
 *  - Automatic Authorization header injection from localStorage
 *  - Response unwrapping (returns res.data directly)
 *  - 401 → clears auth and redirects to /login
 *  - Consistent error shape thrown to callers
 */

import axios from 'axios';
import { STORAGE_KEYS } from '@/utils/constants';

// ── Create instance ──────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
});

// ── Request interceptor — attach token ───────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwrap data, handle 401 ──────────
api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message
                 || error.response?.data?.detail
                 || error.message
                 || 'An unexpected error occurred.';

    // Clear session on 401 Unauthorized and bounce to login
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      // Use window.location so we don't need a router reference here
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Normalise the error shape so callers can always read `err.message`
    return Promise.reject({ status, message, raw: error });
  }
);

export default api;
