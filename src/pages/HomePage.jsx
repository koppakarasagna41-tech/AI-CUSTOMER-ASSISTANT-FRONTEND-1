/**
 * HomePage.jsx
 *
 * Dashboard landing page shown after login.
 * Displays a welcome hero, quick-action cards, and a live activity feed.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiChatBubbleLeftRight,
  HiChartBarSquare,
  HiClipboardDocumentList,
  HiArrowRight,
  HiSparkles,
  HiBoltSlash,
  HiCheckCircle,
  HiClock,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROUTES } from '@/utils/constants';
import { formatCount, timeAgo } from '@/utils/helpers';
import Badge, { statusVariant } from '@/components/ui/Badge';
import analyticsService from '@/services/analyticsService';
import chatService from '@/services/chatService';

// ── Animation helpers ─────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

// ── Quick action cards ────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    to: ROUTES.CHAT,
    label: 'Start AI Chat',
    desc: 'Get instant answers from the AI assistant.',
    icon: HiChatBubbleLeftRight,
    color: 'from-primary-500 to-primary-700',
    shadow: 'shadow-glow',
  },
  {
    to: ROUTES.HISTORY,
    label: 'View History',
    desc: 'Browse past conversations and resolutions.',
    icon: HiClipboardDocumentList,
    color: 'from-purple-500 to-purple-700',
    shadow: '',
  },
  {
    to: ROUTES.ANALYTICS,
    label: 'Analytics',
    desc: 'Track support metrics and AI performance.',
    icon: HiChartBarSquare,
    color: 'from-emerald-500 to-emerald-700',
    shadow: '',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [overviewResponse, conversationResponse] = await Promise.all([
          analyticsService.getMetrics('last_30_days'),
          chatService.getConversations({ page_size: 4 }),
        ]);
        const overview = overviewResponse?.data ?? overviewResponse;
        const items = (conversationResponse?.data ?? []).map((conversation) => ({
          id: conversation.id || conversation.conversation_id,
          title: conversation.title || 'Untitled conversation',
          preview: conversation.title || 'No preview available',
          status: conversation.status || 'open',
          updatedAt: conversation.updated_at || conversation.created_at,
        }));
        setMetrics(overview);
        setConversations(items);
      } catch (error) {
        toast.error(error.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [toast]);

  const KPI = [
    { label: 'Total Conversations', value: formatCount(metrics?.total_conversations?.value ?? 0), icon: HiChatBubbleLeftRight, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Resolved Today', value: metrics?.resolved_tickets?.value ?? 0, icon: HiCheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Avg Response', value: metrics?.avg_response_time_ms?.value ? `${metrics.avg_response_time_ms.value} ms` : '—', icon: HiClock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'AI Resolution Rate', value: `${Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100)}%`, icon: HiBoltSlash, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">

      {/* ── Hero greeting ────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Good {getGreeting()}, {firstName} 👋
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Here's what's happening with your support today.
            </p>
          </div>
          <Link
            to={ROUTES.CHAT}
            className="btn-primary self-start sm:self-auto flex items-center gap-2"
          >
            <HiSparkles className="w-4 h-4" />
            New Conversation
          </Link>
        </div>
      </motion.div>

      {/* ── KPI row ──────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(0.05)}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {KPI.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-none mt-0.5">
                {value}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <motion.section {...fadeUp(0.1)}>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400
                       uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ to, label, desc, icon: Icon, color, shadow }) => (
            <Link
              key={to}
              to={to}
              className={`group card p-5 flex flex-col gap-3 hover:scale-[1.02]
                          active:scale-100 transition-transform duration-200 ${shadow}`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color}
                               flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600
                               dark:group-hover:text-primary-400 transition-colors flex items-center gap-1">
                  {label}
                  <HiArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100
                                           transition-opacity -translate-x-1
                                           group-hover:translate-x-0 duration-200" />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── Recent conversations ──────────────────────────────── */}
      <motion.section {...fadeUp(0.15)}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400
                         uppercase tracking-wide">
            Recent Conversations
          </h2>
          <Link to={ROUTES.HISTORY}
            className="text-xs text-primary-600 dark:text-primary-400
                           hover:underline font-medium">
            View all
          </Link>
        </div>

        <div className="card divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
          {loading ? (
            <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">Loading recent conversations…</div>
          ) : conversations.length === 0 ? (
            <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">No recent conversations yet.</div>
          ) : conversations.map((conv) => (
            <Link
              key={conv.id}
              to={ROUTES.HISTORY}
              className="flex flex-col gap-3 px-5 py-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4
                         dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20
                              flex items-center justify-center flex-shrink-0">
                <HiChatBubbleLeftRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {conv.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {conv.preview}
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-1.5 sm:flex-col sm:items-end sm:justify-start flex-shrink-0">
                <Badge variant={statusVariant(conv.status)} dot>
                  {conv.status}
                </Badge>
                <span className="text-[11px] text-gray-400">{timeAgo(conv.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
