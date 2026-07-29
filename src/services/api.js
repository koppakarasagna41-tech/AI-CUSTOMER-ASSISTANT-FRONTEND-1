/**
 * api.js — Axios instance & interceptors
 *
 * All HTTP requests go through this singleton.
 * Features:
 *  - Base URL from VITE_API_BASE_URL env variable
 *  - Automatic Authorization header injection from localStorage
 *  - Response unwrapping (returns res.data directly)
 *  - Refresh-token handling for 401 responses
 *  - Consistent error shape thrown to callers
 */

import axios from 'axios';
import { STORAGE_KEYS } from '@/utils/constants';

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://ai-customer-assistant-backend-1.onrender.com')
  .trim()
  .replace(/\/+$|\s+$/g, '');
const baseURL = envBaseUrl.endsWith('/api/v1')
  ? envBaseUrl
  : envBaseUrl.endsWith('/api')
    ? `${envBaseUrl}/v1`
    : `${envBaseUrl}/api/v1`;

const api = axios.create({
  baseURL,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && !config.url?.includes('/auth/refresh')) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const isTimeout = error.code === 'ECONNABORTED' && error.message?.includes('timeout');
    const message = isTimeout
      ? 'The request timed out. Please try again in a moment.'
      : error.response?.data?.message
      || error.response?.data?.detail
      || error.message
      || 'An unexpected error occurred.';

    if (status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/login') && !originalRequest?.url?.includes('/auth/refresh')) {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
      if (refreshToken) {
        try {
          originalRequest._retry = true;
          const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newAccessToken = refreshResponse?.data?.data?.access_token;
          if (newAccessToken) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // fall through to session clear
        }
      }

      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default api;
