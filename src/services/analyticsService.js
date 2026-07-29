/**
 * analyticsService.js
 *
 * API wrappers for analytics endpoints.
 */

import api from './api';
import { normalizeApiError } from './apiHelpers';

/**
 * @typedef {object} AnalyticsPeriodParams
 * @property {string} [period]
 */

/**
 * @typedef {object} ChartParams
 * @property {number} [days]
 * @property {number} [months]
 */

/**
 * Fetch KPI overview metrics.
 * @param {string} [period]
 */
export async function getMetrics(period = 'last_30_days') {
  try {
    const response = await api.get('/analytics/overview', { params: { period } });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch full dashboard analytics.
 * @param {string} [period]
 */
export async function getDashboard(period = 'last_30_days') {
  try {
    const response = await api.get('/analytics/dashboard', { params: { period } });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch daily chart data.
 * @param {{days?: number}} [params]
 */
export async function getDailyChart(params = { days: 30 }) {
  try {
    const response = await api.get('/analytics/charts/daily', { params });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch monthly chart data.
 * @param {{months?: number}} [params]
 */
export async function getMonthlyChart(params = { months: 12 }) {
  try {
    const response = await api.get('/analytics/charts/monthly', { params });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch sentiment chart data.
 * @param {string} [period]
 */
export async function getSentimentChart(period = 'last_30_days') {
  try {
    const response = await api.get('/analytics/charts/sentiment', { params: { period } });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch intent chart data.
 * @param {string} [period]
 */
export async function getIntentChart(period = 'last_30_days') {
  try {
    const response = await api.get('/analytics/charts/intents', { params: { period } });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch response time chart data.
 * @param {{days?: number}} [params]
 */
export async function getResponseTimeChart(params = { days: 30 }) {
  try {
    const response = await api.get('/analytics/charts/response-time', { params });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch ticket analytics.
 * @param {string} [period]
 */
export async function getTicketMetrics(period = 'last_30_days') {
  try {
    const response = await api.get('/analytics/tickets', { params: { period } });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Fetch escalation analytics.
 * @param {string} [period]
 */
export async function getEscalationMetrics(period = 'last_30_days') {
  try {
    const response = await api.get('/analytics/escalations', { params: { period } });
    return response?.data ?? response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Export conversations as JSON or CSV.
 * @param {{period?: string, format?: string, limit?: number}} params
 */
export async function exportConversations(params = { period: 'last_30_days', format: 'json', limit: 5000 }) {
  try {
    const response = await api.get('/analytics/export/conversations', {
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json',
    });
    return response;
  } catch (error) {
    normalizeApiError(error);
  }
}

/**
 * Export tickets as JSON or CSV.
 * @param {{period?: string, format?: string, limit?: number}} params
 */
export async function exportTickets(params = { period: 'last_30_days', format: 'json', limit: 5000 }) {
  try {
    const response = await api.get('/analytics/export/tickets', {
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json',
    });
    return response;
  } catch (error) {
    normalizeApiError(error);
  }
}

const analyticsService = {
  getMetrics,
  getDashboard,
  getDailyChart,
  getMonthlyChart,
  getSentimentChart,
  getIntentChart,
  getResponseTimeChart,
  getTicketMetrics,
  getEscalationMetrics,
  exportConversations,
  exportTickets,
};

export default analyticsService;
