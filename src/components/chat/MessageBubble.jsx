/**
 * MessageBubble.jsx
 *
 * Renders a single chat message.
 * - User messages: right-aligned, primary color
 * - AI messages:   left-aligned, white/gray
 *
 * Props:
 *  - message: { id, role, content, timestamp, status }
 *  - user:    auth user object (for avatar)
 */

import { motion } from 'framer-motion';
import { HiSparkles, HiCheck, HiCheckCircle, HiTicket, HiBookOpen } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import { formatTime } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

function StatusIcon({ status }) {
  if (status === 'sending') return <HiCheck className="w-3 h-3 text-gray-400" />;
  if (status === 'sent') return <HiCheck className="w-3 h-3 text-blue-400" />;
  if (status === 'delivered') return <HiCheckCircle className="w-3 h-3 text-blue-500" />;
  return null;
}

export default function MessageBubble({ message, user }) {
  const navigate = useNavigate();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const shouldShowTicketAction = isAssistant && /can|unable|can't|cannot|escalat|ticket/i.test(message.content || '');
  const sourceCount = message?.sources?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar src={user?.avatar} name={user?.name ?? 'You'} size="xs" className="mb-0.5" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                        flex items-center justify-center flex-shrink-0 mb-0.5 shadow-sm">
          <HiSparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-1 w-full max-w-[88%] sm:max-w-[75%] md:max-w-[65%]
                       ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-2.5 rounded-2xl text-[15px] sm:text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap
            ${isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-md'
            }
          `}
        >
          {message.content}
        </div>

        {sourceCount > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
            <HiBookOpen className="w-4 h-4" />
            Grounded in {sourceCount} reference{sourceCount === 1 ? '' : 's'}
          </div>
        ) : null}

        {shouldShowTicketAction && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.TICKETS)}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-300"
          >
            <HiTicket className="w-4 h-4" />
            Create Ticket
          </button>
        )}

        {/* Timestamp + status */}
        <div className={`flex items-center gap-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {isUser && <StatusIcon status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
}
