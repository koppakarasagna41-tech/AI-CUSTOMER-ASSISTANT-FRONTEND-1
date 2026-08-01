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
import { HiSparkles, HiCheck, HiCheckCircle, HiTicket, HiBookOpen, HiInformationCircle } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import { formatTime } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import MarkdownContent from './MarkdownContent';

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
  const hasConfidence = typeof message.confidence === 'number';
  const confidencePct = hasConfidence ? Math.round(message.confidence * 100) : null;
  const providerLabel = message.provider ? String(message.provider).replace(/_/g, ' ') : null;

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
          <MarkdownContent content={message.content} />
        </div>

        {isAssistant && (providerLabel || hasConfidence) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            {providerLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">
                <HiSparkles className="w-3 h-3" />
                {providerLabel}
              </span>
            )}
            {hasConfidence && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${confidencePct < 60 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <HiInformationCircle className="w-3 h-3" />
                Confidence {confidencePct}%
              </span>
            )}
          </div>
        )}

        {sourceCount > 0 ? (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
            <div className="inline-flex items-center gap-2">
              <HiBookOpen className="w-4 h-4" />
              Grounded in {sourceCount} reference{sourceCount === 1 ? '' : 's'}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-normal">
              {(message.sources || []).map((source, index) => {
                const label = typeof source === 'string'
                  ? source
                  : source.title || source.document_name || source.filename || source.source || source.url || `Source ${index + 1}`;
                const href = typeof source === 'object' && source.url ? source.url : null;

                return href ? (
                  <a key={`${label}-${index}`} href={href} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-gray-900 dark:text-emerald-300 dark:hover:bg-gray-800">
                    {label}
                  </a>
                ) : (
                  <span key={`${label}-${index}`} className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-emerald-700 dark:border-emerald-800 dark:bg-gray-900 dark:text-emerald-300">
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {isAssistant && Array.isArray(message.suggestedQuestions) && message.suggestedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggestedQuestions.slice(0, 4).map((question) => (
              <span key={question} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {question}
              </span>
            ))}
          </div>
        )}

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
