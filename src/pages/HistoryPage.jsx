/**
 * HistoryPage.jsx
 *
 * Server-backed conversation history with search, filters, and pagination.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiMagnifyingGlass,
  HiChatBubbleLeftRight,
  HiFunnel,
  HiTrash,
  HiArrowTopRightOnSquare,
  HiArrowPath,
  HiChevronLeft,
  HiChevronRight,
  HiCalendarDays,
} from 'react-icons/hi2';

import { useToast } from '@/context/ToastContext';
import Badge, { statusVariant } from '@/components/ui/Badge';
import { timeAgo, truncate } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import chatService from '@/services/chatService';
import historyService from '@/services/historyService';
import useDebounce from '@/hooks/useDebounce';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const SENTIMENT_FILTERS = [
  { label: 'All sentiments', value: '' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
  { label: 'Very negative', value: 'very_negative' },
];

const TICKET_FILTERS = [
  { label: 'All conversations', value: '' },
  { label: 'Has tickets', value: 'true' },
  { label: 'No tickets', value: 'false' },
];

const SORT_OPTIONS = [
  { label: 'Updated newest', value: 'updated_at:desc' },
  { label: 'Created newest', value: 'created_at:desc' },
  { label: 'Most messages', value: 'message_count:desc' },
  { label: 'Sentiment priority', value: 'sentiment_polarity:desc' },
];

export default function HistoryPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [ticketFilter, setTicketFilter] = useState('');
  const [sortValue, setSortValue] = useState('updated_at:desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const pagination = useMemo(() => ({
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    hasPrevious: page > 1,
    hasNext: page < Math.max(1, Math.ceil(total / pageSize)),
  }), [page, pageSize, total]);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        setLoading(true);
        const [sortBy, sortOrder] = sortValue.split(':');
        const response = await historyService.listHistory({
          page,
          page_size: pageSize,
          search: debouncedSearch.trim() || undefined,
          status: statusFilter || undefined,
          sentiment: sentimentFilter || undefined,
          has_tickets: ticketFilter === '' ? undefined : ticketFilter === 'true',
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        if (!mounted) return;

        const items = (response?.items ?? []).map((conversation) => ({
          id: conversation.id || conversation.conversation_id,
          conversationId: conversation.conversation_id || conversation.id,
          title: conversation.title || conversation.summary || 'Untitled conversation',
          preview: conversation.latest_message_preview || conversation.preview || conversation.title || 'No preview available',
          status: conversation.status || 'open',
          sentiment: conversation.sentiment || conversation.dominant_sentiment || '',
          tags: conversation.tags || [],
          updatedAt: conversation.updated_at || conversation.created_at,
          createdAt: conversation.created_at,
          messages: conversation.message_count ?? conversation.messages_total ?? 0,
          hasTickets: Boolean(conversation.has_tickets || (conversation.linked_tickets?.length ?? 0) > 0),
        }));

        setRecords(items);
        setTotal(response?.total ?? 0);
      } catch (err) {
        toast.error(err.message || 'Unable to load conversations.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      mounted = false;
    };
  }, [debouncedSearch, page, pageSize, statusFilter, sentimentFilter, ticketFilter, sortValue, toast]);

  async function handleDelete(id) {
    try {
      await chatService.deleteConversation(id);
      toast.success('Conversation deleted.');
      setPage(1);
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    }
  }

  function handleContinueConversation(conversationId) {
    navigate({
      pathname: ROUTES.CHAT,
      search: `?conversationId=${encodeURIComponent(conversationId)}`,
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversation History</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Loading conversations…' : `${total} total conversations`}
            </p>
          </div>

          <button type="button" onClick={() => setPage(1)} className="btn-secondary w-full lg:w-auto">
            <HiArrowPath className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid gap-3 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]"
      >
        <div className="relative xl:col-span-2">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search conversations or message previews…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input pl-9"
          />
        </div>

        <div className="relative">
          <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input pl-9 pr-8 cursor-pointer appearance-none"
          >
            {STATUS_FILTERS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sentimentFilter}
            onChange={(e) => {
              setSentimentFilter(e.target.value);
              setPage(1);
            }}
            className="input pl-9 pr-8 cursor-pointer appearance-none"
          >
            {SENTIMENT_FILTERS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={ticketFilter}
            onChange={(e) => {
              setTicketFilter(e.target.value);
              setPage(1);
            }}
            className="input pl-9 pr-8 cursor-pointer appearance-none"
          >
            {TICKET_FILTERS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <HiCalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortValue}
            onChange={(e) => {
              setSortValue(e.target.value);
              setPage(1);
            }}
            className="input pl-9 pr-8 cursor-pointer appearance-none"
          >
            {SORT_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16 text-sm text-gray-500 dark:text-gray-400">Loading conversations…</div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 card border-dashed">
          <HiChatBubbleLeftRight className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No conversations found.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Try a different search term or filter.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="card overflow-hidden"
        >
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {records.map((conversation, idx) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="flex flex-col gap-3 px-5 py-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <HiChatBubbleLeftRight className="w-4 h-4 text-primary-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{conversation.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{truncate(conversation.preview, 100)}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {conversation.tags.length > 0 && conversation.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-1.5 sm:flex-col sm:items-end sm:justify-start flex-shrink-0">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Badge variant={statusVariant(conversation.status)} dot>{conversation.status}</Badge>
                    {conversation.sentiment ? <Badge variant="purple">{conversation.sentiment.replace(/_/g, ' ')}</Badge> : null}
                    {conversation.hasTickets ? <Badge variant="yellow">has ticket</Badge> : null}
                  </div>
                  <span className="text-[11px] text-gray-400">{timeAgo(conversation.updatedAt)}</span>
                  <span className="text-[11px] text-gray-400">{conversation.messages} msgs</span>
                </div>

                <div className="flex flex-wrap items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 self-end sm:self-auto">
                  <button aria-label="Continue conversation" onClick={() => handleContinueConversation(conversation.conversationId)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <HiArrowTopRightOnSquare className="w-4 h-4" />
                  </button>
                  <button aria-label="Open conversation details" onClick={() => navigate(ROUTES.CONVERSATION_DETAIL.replace(':conversationId', conversation.conversationId))} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <HiArrowTopRightOnSquare className="w-4 h-4" />
                  </button>
                  <button aria-label="Delete conversation" onClick={() => handleDelete(conversation.conversationId)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Page {page} of {pagination.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary" disabled={!pagination.hasPrevious || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            <HiChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button type="button" className="btn-secondary" disabled={!pagination.hasNext || loading} onClick={() => setPage((current) => current + 1)}>
            Next
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
