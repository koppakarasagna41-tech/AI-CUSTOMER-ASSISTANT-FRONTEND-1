/**
 * analyticsService.js
 *
 * API calls for analytics data.
 */

import {
  PLACEHOLDER_METRICS,
  PLACEHOLDER_CHART_DATA,
  PLACEHOLDER_TOP_ISSUES,
} from '@/utils/placeholderData';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Overview KPI metrics. */
export async function getMetrics(_period = '7d') {
  await delay(500);
  return PLACEHOLDER_METRICS;
  // return api.get('/analytics/metrics', { params: { period } });
}

/** Conversations chart data for the given period. */
export async function getChartData(_period = '7d') {
  await delay(600);
  return PLACEHOLDER_CHART_DATA;
  // return api.get('/analytics/chart', { params: { period } });
}

/** Top issue categories. */
export async function getTopIssues(_period = '7d') {
  await delay(400);
  return PLACEHOLDER_TOP_ISSUES;
  // return api.get('/analytics/top-issues', { params: { period } });
}

const analyticsService = { getMetrics, getChartData, getTopIssues };
export default analyticsService;
