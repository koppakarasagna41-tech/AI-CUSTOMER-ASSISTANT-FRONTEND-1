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

let cachedAccessToken = null;

export function setAccessToken(token) {
  cachedAccessToken = token ?? null;
}

export function getAccessToken() {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

const remoteBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://ai-customer-assistant-backend-1.onrender.com')
  .trim()
  .replace(/\/+$|\s+$/g, '');
const normalizedRemoteBaseUrl = remoteBaseUrl.endsWith('/api/v1')
  ? remoteBaseUrl
  : remoteBaseUrl.endsWith('/api')
    ? `${remoteBaseUrl}/v1`
    : `${remoteBaseUrl}/api/v1`;

const isLocalDevHost = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const baseURL = import.meta.env.DEV && isLocalDevHost
  ? '/api/v1'
  : normalizedRemoteBaseUrl;

const api = axios.create({
  baseURL,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function clearAuthSession() {
  setAccessToken(null);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

function getBackendErrorMessage(error, fallbackMessage) {
  const responseData = error.response?.data;
  const validationDetails = responseData?.details;

  if (Array.isArray(validationDetails) && validationDetails.length > 0) {
    const validationMessages = validationDetails
      .map((item) => item?.message)
      .filter(Boolean);
    if (validationMessages.length > 0) {
      return validationMessages.join(' ');
    }
  }

  return responseData?.message
    || responseData?.detail
    || responseData?.error?.message
    || fallbackMessage;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
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
      : getBackendErrorMessage(
        error,
        error.response
          ? 'An unexpected error occurred.'
          : 'Unable to reach the API. Check the backend status and CORS settings.'
      );

    if (status === 403) {
      return Promise.reject({ status, message, raw: error });
    }

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
            setAccessToken(newAccessToken);
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch {
          // refresh failed, clear the session below
        }
      }
    }

    if (status === 401) {
      clearAuthSession();
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default api;
