/**
 * AnalyticsPage.jsx
 *
 * Analytics dashboard with:
 *  - Period selector
 *  - 4 KPI stat cards
 *  - Bar chart (pure CSS — no extra charting lib dependency)
 *  - Top issues table
 *  - Satisfaction score ring
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiClock,
  HiFaceSmile,
  HiBoltSlash,
  HiUsers,
} from 'react-icons/hi2';

import StatCard from '@/components/ui/StatCard';
import { ANALYTICS_PERIODS, ROUTES } from '@/utils/constants';
import { formatCount as fmtCount } from '@/utils/helpers';
import analyticsService from '@/services/analyticsService';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

// Pure-CSS bar chart
function BarChart({ data }) {
  const safeData = Array.isArray(data) ? data : [];
  const chartData = safeData.map((d) => ({
    day: d.date ? d.date.slice(5) : d.day || '—',
    resolved: d.tickets || d.resolved || 0,
    conversations: d.conversations || 0,
  }));
  const max = chartData.length ? Math.max(...chartData.map((d) => d.conversations || 0)) : 1;
  return (
    <div className="flex items-end justify-between gap-2 h-40 px-2">
      {chartData.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="relative w-full flex items-end justify-center" style={{ height: '120px' }}>
            {/* Resolved bar (behind) */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.resolved / max) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="absolute bottom-0 w-full bg-primary-200 dark:bg-primary-900/40 rounded-t-md"
            />
            {/* Conversations bar (front, slightly narrower) */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.conversations / max) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-[60%] bg-primary-500 dark:bg-primary-600 rounded-t-md"
            />
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}

// Satisfaction score ring (pure SVG)
function SatisfactionRing({ score }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none"
            strokeWidth="10" className="stroke-gray-200 dark:stroke-gray-700" />
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none" strokeWidth="10"
            strokeLinecap="round"
            className="stroke-green-500"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <HiFaceSmile className="w-5 h-5 text-green-500 mb-0.5" />
          <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">
            {score}%
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CSAT Score</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('last_30_days');
  const [metrics, setMetrics] = useState(null);
  const [dailyChart, setDailyChart] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      toast.info('Analytics is only available to administrators. Redirecting to home.');
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    async function loadAnalytics() {
      try {
        const [overviewResponse, chartResponse, issuesResponse] = await Promise.all([
          analyticsService.getMetrics(period),
          analyticsService.getChartData(period),
          analyticsService.getTopIssues(period),
        ]);
        const overview = overviewResponse?.data ?? overviewResponse;
        const chart = chartResponse?.data ?? chartResponse;
        const issues = issuesResponse?.data ?? issuesResponse;
        setMetrics(overview);
        setDailyChart(chart?.data ?? []);
        setTopIssues(issues?.data ?? []);
      } catch (err) {
        toast.error(err.message || 'Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [period, toast, isAdmin, navigate]);

  const KPI_CARDS = useMemo(() => [
    {
      title: 'Total Conversations',
      value: fmtCount(metrics?.total_conversations?.value ?? 0),
      icon: <HiChatBubbleLeftRight className="w-5 h-5" />,
      color: 'blue',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Resolved Today',
      value: String(metrics?.resolved_tickets?.value ?? 0),
      icon: <HiCheckCircle className="w-5 h-5" />,
      color: 'green',
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Avg Response Time',
      value: metrics?.avg_response_time_ms?.value ? `${metrics.avg_response_time_ms.value} ms` : '—',
      icon: <HiClock className="w-5 h-5" />,
      color: 'purple',
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Active Users',
      value: String(metrics?.total_users?.value ?? 0),
      icon: <HiUsers className="w-5 h-5" />,
      color: 'yellow',
      trend: { value: 3, isPositive: false },
    },
  ], [metrics]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            AI support performance metrics
          </p>
        </div>

        {/* Period selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input w-auto cursor-pointer min-w-[140px]"
          aria-label="Select time period"
        >
          {ANALYTICS_PERIODS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </motion.div>

      {/* KPI cards */}
      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading analytics…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {KPI_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-4 xl:grid-cols-3">

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="card p-5 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Conversations Overview
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary-500 inline-block" />
                Total
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary-200 dark:bg-primary-900/40 inline-block" />
                Resolved
              </span>
            </div>
          </div>
          <BarChart data={dailyChart} />
        </motion.div>

        {/* Satisfaction ring + AI resolution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="card p-5 flex flex-col gap-6"
        >
          <SatisfactionRing score={Math.min(100, Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100))} />

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HiBoltSlash className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Resolution
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Without human escalation
            </p>
          </div>
        </motion.div>
      </div>

      {/* Top issues table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Top Issue Categories
          </h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {topIssues.map(({ intent, count, percentage }, i) => (
            <div key={intent} className="flex items-center gap-4 px-5 py-3">
              <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{intent}</span>
              <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
                  className="h-full bg-primary-500 rounded-full"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                {fmtCount(count)} ({percentage}%)
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
