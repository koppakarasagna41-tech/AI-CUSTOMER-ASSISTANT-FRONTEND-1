/**
 * HistoryPage.jsx
 *
 * Lists all past conversations with search, filter, and sort controls.
 * Uses placeholder data; replace with chatService.getConversations() calls.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HiMagnifyingGlass,
  HiChatBubbleLeftRight,
  HiFunnel,
  HiTrash,
  HiArrowTopRightOnSquare,
} from 'react-icons/hi2';

import { useToast }  from '@/context/ToastContext';
import Badge, { statusVariant } from '@/components/ui/Badge';
import { PLACEHOLDER_CONVERSATIONS } from '@/utils/placeholderData';
import { timeAgo, truncate } from '@/utils/helpers';
import { CONVERSATION_STATUS } from '@/utils/constants';

const STATUS_FILTERS = [
  { label: 'All',      value: ''                              },
  { label: 'Open',     value: CONVERSATION_STATUS.OPEN       },
  { label: 'Pending',  value: CONVERSATION_STATUS.PENDING    },
  { label: 'Resolved', value: CONVERSATION_STATUS.RESOLVED   },
];

export default function HistoryPage() {
  const { toast }        = useToast();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');
  const [convs, setConvs]     = useState(PLACEHOLDER_CONVERSATIONS);

  const filtered = useMemo(() => {
    return convs.filter((c) => {
      const matchSearch = !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.preview.toLowerCase().includes(search.toLowerCase());
      const matchFilter = !filter || c.status === filter;
      return matchSearch && matchFilter;
    });
  }, [convs, search, filter]);

  function handleDelete(id) {
    setConvs((prev) => prev.filter((c) => c.id !== id));
    toast.success('Conversation deleted.');
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Conversation History
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {convs.length} total conversations
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2
                                         w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2
                                w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input pl-9 pr-8 cursor-pointer appearance-none min-w-[140px]"
          >
            {STATUS_FILTERS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <HiChatBubbleLeftRight className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No conversations found.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Try a different search term or filter.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="card overflow-hidden"
        >
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((conv, idx) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x:  0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50
                           dark:hover:bg-gray-800/50 transition-colors group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20
                                flex items-center justify-center flex-shrink-0">
                  <HiChatBubbleLeftRight className="w-4 h-4 text-primary-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {truncate(conv.preview, 80)}
                  </p>
                  {conv.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {conv.tags.map((tag) => (
                        <span key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded-md
                                         bg-gray-100 dark:bg-gray-700 text-gray-500
                                         dark:text-gray-400 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <Badge variant={statusVariant(conv.status)} dot>
                    {conv.status}
                  </Badge>
                  <span className="text-[11px] text-gray-400">{timeAgo(conv.updatedAt)}</span>
                  <span className="text-[11px] text-gray-400">{conv.messages} msgs</span>
                </div>

                {/* Actions (visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                                transition-opacity flex-shrink-0">
                  <button
                    aria-label="Open conversation"
                    onClick={() => toast.info('Full conversation view coming soon.')}
                    className="btn-ghost p-1.5 rounded-lg text-gray-400
                               hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    <HiArrowTopRightOnSquare className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Delete conversation"
                    onClick={() => handleDelete(conv.id)}
                    className="btn-ghost p-1.5 rounded-lg text-gray-400
                               hover:text-red-500 dark:hover:text-red-400"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
