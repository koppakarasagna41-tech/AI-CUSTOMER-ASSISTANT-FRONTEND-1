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
import { HiSparkles, HiCheck, HiCheckCircle } from 'react-icons/hi2';
import Avatar    from '@/components/ui/Avatar';
import { formatTime } from '@/utils/helpers';

function StatusIcon({ status }) {
  if (status === 'sending') return <HiCheck className="w-3 h-3 text-gray-400" />;
  if (status === 'sent')    return <HiCheck className="w-3 h-3 text-blue-400" />;
  if (status === 'delivered') return <HiCheckCircle className="w-3 h-3 text-blue-500" />;
  return null;
}

export default function MessageBubble({ message, user }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
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
      <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[65%]
                       ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-md'
            }
          `}
        >
          {message.content}
        </div>

        {/* Timestamp + status */}
        <div className={`flex items-center gap-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {isUser && <StatusIcon status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
}
