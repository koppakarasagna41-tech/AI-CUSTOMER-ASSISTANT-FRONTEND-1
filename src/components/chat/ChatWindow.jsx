/**
 * ChatWindow.jsx
 *
 * The main chat panel — message list + input box.
 * Consumes ChatContext for messages / sendMessage / isTyping.
 * Consumes AuthContext for the user avatar.
 *
 * Props:
 *  - className : extra classes for the outer wrapper
 */

import { useRef, useEffect } from 'react';
import { AnimatePresence }   from 'framer-motion';
import { HiSparkles, HiArrowPath } from 'react-icons/hi2';

import { useChat }       from '@/context/ChatContext';
import { useAuth }       from '@/context/AuthContext';
import MessageBubble     from './MessageBubble';
import TypingIndicator   from './TypingIndicator';
import ChatInputBox      from './ChatInputBox';
import LoadingSpinner    from '@/components/ui/LoadingSpinner';

// Empty-state illustration
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center
                    select-none">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                      flex items-center justify-center shadow-glow">
        <HiSparkles className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          How can I help you today?
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          I&apos;m your AI support assistant. Ask me anything about your account,
          orders, billing, or technical issues.
        </p>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {[
          'Track my order',
          'Billing question',
          'Reset my password',
          'Request a refund',
        ].map((prompt) => (
          <span
            key={prompt}
            className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700
                       text-sm text-gray-600 dark:text-gray-400 cursor-default
                       hover:border-primary-400 hover:text-primary-600
                       dark:hover:border-primary-500 dark:hover:text-primary-400
                       transition-colors"
          >
            {prompt}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ className = '' }) {
  const { messages, isTyping, sendMessage, clearConversation } = useChat();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  // Scroll to bottom on new messages or when AI starts/stops typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 dark:bg-gray-950 ${className}`}>

      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b
                      border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center shadow-sm">
            <HiSparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">AI Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isTyping ? 'Typing…' : 'Online'}
              </span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            aria-label="Clear conversation"
            className="btn-ghost p-2 rounded-lg text-gray-400 hover:text-gray-600
                       dark:hover:text-gray-300"
            title="Clear conversation"
          >
            <HiArrowPath className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} user={user} />
            ))}

            <AnimatePresence>
              {isTyping && <TypingIndicator />}
            </AnimatePresence>

            {/* Invisible scroll anchor */}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInputBox onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
