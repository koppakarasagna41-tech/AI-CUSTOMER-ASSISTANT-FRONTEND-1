/**
 * analyticsService.js
 *
 * API calls for analytics data.
 */

import api from './api';

/** Overview KPI metrics. */
export async function getMetrics(period = 'last_30_days') {
  const response = await api.get('/analytics/overview', { params: { period } });
  return response?.data ?? response;
}

/** Full dashboard payload. */
export async function getDashboard(period = 'last_30_days') {
  const response = await api.get('/analytics/dashboard', { params: { period } });
  return response?.data ?? response;
}

/** Conversations chart data for the given period. */
export async function getChartData(period = 'last_30_days') {
  const response = await api.get('/analytics/charts/daily', { params: { days: 30 } });
  return response?.data ?? response;
}

/** Top issue categories. */
export async function getTopIssues(period = 'last_30_days') {
  const response = await api.get('/analytics/charts/intents', { params: { period } });
  return response?.data ?? response;
}

const analyticsService = { getMetrics, getDashboard, getChartData, getTopIssues };
export default analyticsService;
