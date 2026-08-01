/**
 * HomePage.jsx
 *
 * Role-aware dashboard landing page.
 * Customers see support shortcuts, recent conversations, and tickets.
 * Staff see operational metrics and lightweight charts.
 */

import { useEffect, useMemo, useState } from 'react';
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
  HiTicket,
  HiUsers,
  HiArrowTrendingUp,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROUTES } from '@/utils/constants';
import { formatCount, timeAgo } from '@/utils/helpers';
import Badge, { statusVariant } from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import analyticsService from '@/services/analyticsService';
import chatService from '@/services/chatService';
import ticketService from '@/services/ticketService';
import { isStaffRole } from '@/utils/navigation';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

const CUSTOMER_QUICK_ACTIONS = [
  {
    to: ROUTES.CHAT,
    label: 'Start New Chat',
    desc: 'Open a fresh conversation with the AI assistant.',
    icon: HiChatBubbleLeftRight,
    color: 'from-primary-500 to-primary-700',
    shadow: 'shadow-glow',
  },
  {
    to: ROUTES.TICKETS,
    label: 'Create Ticket',
    desc: 'Escalate an issue to the support team.',
    icon: HiTicket,
    color: 'from-amber-500 to-amber-700',
    shadow: '',
  },
  {
    to: ROUTES.KNOWLEDGE,
    label: 'Search Knowledge Base',
    desc: 'Find articles and FAQs before reaching out.',
    icon: HiBookOpenAction,
    color: 'from-emerald-500 to-emerald-700',
    shadow: '',
  },
  {
    to: ROUTES.HISTORY,
    label: 'Continue Previous Conversation',
    desc: 'Pick up where you left off in history.',
    icon: HiClipboardDocumentList,
    color: 'from-purple-500 to-purple-700',
    shadow: '',
  },
];

const STAFF_KPI_CONFIG = [
  { key: 'totalTickets', label: 'Total Tickets', icon: HiTicket, color: 'blue' },
  { key: 'openTickets', label: 'Open Tickets', icon: HiClipboardDocumentList, color: 'yellow' },
  { key: 'resolvedToday', label: 'Resolved Today', icon: HiCheckCircle, color: 'green' },
  { key: 'escalatedTickets', label: 'Escalated Tickets', icon: HiArrowTrendingUp, color: 'red' },
  { key: 'avgResponse', label: 'Average Response Time', icon: HiClock, color: 'purple' },
  { key: 'customerSatisfaction', label: 'Customer Satisfaction', icon: HiUsers, color: 'blue' },
  { key: 'aiResolutionRate', label: 'AI Resolution Rate', icon: HiBoltSlash, color: 'yellow' },
];

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const staffMode = isStaffRole(user?.role);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [dailyChart, setDailyChart] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        if (staffMode) {
          const [overviewResponse, dailyResponse, ticketStatsResponse, conversationsResponse] = await Promise.all([
            analyticsService.getMetrics('last_30_days'),
            analyticsService.getDailyChart({ days: 14 }),
            ticketService.getTicketStats(),
            chatService.getConversations({ page_size: 4 }),
          ]);

          if (!mounted) return;

          setMetrics(overviewResponse?.data ?? overviewResponse);
          setDailyChart((dailyResponse?.data ?? dailyResponse)?.data ?? dailyResponse?.data ?? dailyResponse ?? []);
          setTicketStats(ticketStatsResponse?.data ?? ticketStatsResponse);
          setConversations((conversationsResponse?.data ?? []).map((conversation) => ({
            id: conversation.id || conversation.conversation_id,
            title: conversation.title || 'Untitled conversation',
            preview: conversation.title || 'No preview available',
            status: conversation.status || 'open',
            updatedAt: conversation.updated_at || conversation.created_at,
          })));
          setTickets([]);
        } else {
          const [overviewResponse, conversationResponse, ticketResponse] = await Promise.all([
            analyticsService.getMetrics('last_30_days'),
            chatService.getConversations({ page_size: 4 }),
            ticketService.listTickets({ page: 1, page_size: 4 }),
          ]);

          if (!mounted) return;

          setMetrics(overviewResponse?.data ?? overviewResponse);
          setConversations((conversationResponse?.data ?? []).map((conversation) => ({
            id: conversation.id || conversation.conversation_id,
            title: conversation.title || 'Untitled conversation',
            preview: conversation.title || 'No preview available',
            status: conversation.status || 'open',
            updatedAt: conversation.updated_at || conversation.created_at,
          })));
          setTickets((ticketResponse?.items ?? []).map((ticket) => ({
            id: ticket.id || ticket.ticket_id,
            ticketId: ticket.ticket_id || ticket.id,
            subject: ticket.subject || 'Untitled ticket',
            description: ticket.description || '',
            status: ticket.status || 'open',
            priority: ticket.priority || 'medium',
            createdAt: ticket.created_at || ticket.updated_at,
          })));
          setTicketStats(ticketResponse ?? null);
          setDailyChart([]);
        }
      } catch (error) {
        toast.error(error?.message || 'Unable to load dashboard data.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, [staffMode, toast]);

  const customerMetrics = useMemo(() => ([
    {
      label: 'AI Resolution Rate',
      value: `${Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100)}%`,
      icon: HiBoltSlash,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Total Conversations',
      value: formatCount(metrics?.total_conversations?.value ?? conversations.length ?? 0),
      icon: HiChatBubbleLeftRight,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active Tickets',
      value: formatCount(tickets.filter((ticket) => ['open', 'in_progress', 'pending'].includes(ticket.status)).length),
      icon: HiTicket,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Average Response',
      value: metrics?.avg_response_time_ms?.value ? `${metrics.avg_response_time_ms.value} ms` : '—',
      icon: HiClock,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ]), [conversations.length, metrics, tickets]);

  const staffMetrics = useMemo(() => ([
    {
      label: 'Total Tickets',
      value: formatMetricValue(ticketStats?.total_tickets?.value ?? metrics?.total_tickets?.value ?? ticketStats?.total ?? 0),
      icon: HiTicket,
      color: 'blue',
    },
    {
      label: 'Open Tickets',
      value: formatMetricValue(ticketStats?.open_tickets?.value ?? ticketStats?.open ?? 0),
      icon: HiClipboardDocumentList,
      color: 'yellow',
    },
    {
      label: 'Resolved Today',
      value: formatMetricValue(metrics?.resolved_tickets?.value ?? ticketStats?.resolved ?? 0),
      icon: HiCheckCircle,
      color: 'green',
    },
    {
      label: 'Escalated Tickets',
      value: formatMetricValue(metrics?.escalated_tickets?.value ?? ticketStats?.escalated ?? 0),
      icon: HiArrowTrendingUp,
      color: 'red',
    },
    {
      label: 'Average Response Time',
      value: metrics?.avg_response_time_ms?.value ? `${metrics.avg_response_time_ms.value} ms` : '—',
      icon: HiClock,
      color: 'purple',
    },
    {
      label: 'Customer Satisfaction',
      value: metrics?.customer_satisfaction?.value
        ? `${Math.round(metrics.customer_satisfaction.value * 100)}%`
        : `${Math.round((metrics?.csat_score?.value ?? 0) * 100)}%`,
      icon: HiUsers,
      color: 'blue',
    },
    {
      label: 'AI Resolution Rate',
      value: `${Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100)}%`,
      icon: HiBoltSlash,
      color: 'yellow',
    },
  ]), [metrics, ticketStats]);

  if (staffMode) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <motion.div {...fadeUp(0)}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Good {getGreeting()}, {firstName}
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Operational overview for your support desk.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={ROUTES.TICKETS} className="btn-primary">
                Incoming Tickets
              </Link>
              {isAdmin ? (
                <Link to={ROUTES.ANALYTICS} className="btn-secondary">
                  Open Analytics
                </Link>
              ) : null}
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.05)} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {staffMetrics.map(({ label, value, icon: Icon, color }) => (
            <StatCard key={label} title={label} value={value} icon={<Icon className="w-5 h-5" />} color={color} />
          ))}
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-3">
          <motion.section {...fadeUp(0.1)} className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Daily Tickets</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">Last 14 days</span>
            </div>
            <MiniBarChart data={dailyChart} />
          </motion.section>

          <motion.section {...fadeUp(0.15)} className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Metrics</h2>
            <BreakdownList
              items={[
                { label: 'Conversation volume', value: metrics?.total_conversations?.value ?? conversations.length ?? 0 },
                { label: 'Open tickets', value: ticketStats?.open_tickets?.value ?? ticketStats?.open ?? 0 },
                { label: 'Escalations', value: metrics?.escalated_tickets?.value ?? 0 },
                { label: 'Resolved today', value: metrics?.resolved_tickets?.value ?? 0 },
              ]}
            />
          </motion.section>
        </div>

        <motion.section {...fadeUp(0.2)} className="grid gap-4 lg:grid-cols-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Conversations</h2>
              <Link to={ROUTES.HISTORY} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {conversations.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">No recent conversations yet.</div>
              ) : conversations.map((conversation) => (
                <Link key={conversation.id} to={ROUTES.HISTORY} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                    <HiChatBubbleLeftRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conversation.preview}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={statusVariant(conversation.status)} dot>{conversation.status}</Badge>
                    <span className="text-[11px] text-gray-400">{timeAgo(conversation.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Tickets</h2>
              <Link to={ROUTES.TICKETS} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Open queue</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {tickets.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">No ticket activity yet.</div>
              ) : tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <HiTicket className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{ticket.description || 'No additional details provided.'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={statusVariant(ticket.status)} dot>{ticket.status}</Badge>
                    <span className="text-[11px] text-gray-400">{ticket.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <motion.div {...fadeUp(0)}>
        <div className="rounded-3xl overflow-hidden border border-primary-200 bg-gradient-to-br from-primary-600 via-primary-600 to-secondary-700 text-white shadow-soft">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <HiSparkles className="w-4 h-4" />
                Customer Portal
              </span>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                  Good {getGreeting()}, {firstName}.
                </h1>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/85">
                  Find answers, continue conversations, and track support requests from one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={ROUTES.CHAT} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition hover:-translate-y-0.5">
                  <HiSparkles className="w-4 h-4" />
                  Start New Chat
                </Link>
                <Link to={ROUTES.TICKETS} className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Create Ticket
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <SmallStat label="AI Resolution Rate" value={`${Math.round((metrics?.ai_resolution_rate?.value ?? 0) * 100)}%`} />
              <SmallStat label="Total Conversations" value={formatCount(metrics?.total_conversations?.value ?? conversations.length ?? 0)} />
              <SmallStat label="Active Tickets" value={formatCount(tickets.filter((ticket) => ['open', 'in_progress', 'pending'].includes(ticket.status)).length)} />
              <SmallStat label="Avg Response" value={metrics?.avg_response_time_ms?.value ? `${metrics.avg_response_time_ms.value} ms` : '—'} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.section {...fadeUp(0.05)}>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CUSTOMER_QUICK_ACTIONS.map(({ to, label, desc, icon: Icon, color, shadow }) => (
            <Link key={to} to={to} className={`group card p-5 flex flex-col gap-3 hover:scale-[1.02] active:scale-100 transition-transform duration-200 ${shadow}`}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-1">
                  {label}
                  <HiArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {customerMetrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-none mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.section {...fadeUp(0.15)}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Conversations</h2>
              <Link to={ROUTES.HISTORY} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">Loading recent conversations…</div>
              ) : conversations.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">No recent conversations yet.</div>
              ) : conversations.map((conversation) => (
                <Link key={conversation.id} to={ROUTES.HISTORY} className="flex flex-col gap-3 px-5 py-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                    <HiChatBubbleLeftRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conversation.preview}</p>
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-1.5 sm:flex-col sm:items-end sm:justify-start flex-shrink-0">
                    <Badge variant={statusVariant(conversation.status)} dot>{conversation.status}</Badge>
                    <span className="text-[11px] text-gray-400">{timeAgo(conversation.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Tickets</h2>
              <Link to={ROUTES.TICKETS} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View tickets</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">Loading recent tickets…</div>
              ) : tickets.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">No tickets yet.</div>
              ) : tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <HiTicket className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{ticket.description || 'No additional details provided.'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={statusVariant(ticket.status)} dot>{ticket.status}</Badge>
                    <span className="text-[11px] text-gray-400">{ticket.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function MiniBarChart({ data }) {
  const items = (Array.isArray(data) ? data : []).map((entry) => ({
    label: entry.date ? entry.date.slice(5) : entry.day || '—',
    value: entry.tickets ?? entry.conversations ?? entry.resolved ?? 0,
  }));
  const max = Math.max(1, ...items.map((item) => item.value || 0));

  return (
    <div className="flex items-end justify-between gap-2 h-40 px-2">
      {items.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          No chart data available.
        </div>
      ) : items.map((item) => (
        <div key={item.label} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="relative w-full flex items-end justify-center" style={{ height: '120px' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="absolute bottom-0 w-full bg-primary-200 dark:bg-primary-900/40 rounded-t-md"
            />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-[60%] bg-primary-500 dark:bg-primary-600 rounded-t-md"
            />
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function BreakdownList({ items }) {
  return (
    <div className="space-y-3">
      {(items || []).map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Number(item.value) || 0)}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full bg-primary-500" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white leading-none">{value}</p>
    </div>
  );
}

function formatMetricValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return formatCount(value);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function HiBookOpenAction(props) {
  return <HiClipboardDocumentList {...props} />;
}
