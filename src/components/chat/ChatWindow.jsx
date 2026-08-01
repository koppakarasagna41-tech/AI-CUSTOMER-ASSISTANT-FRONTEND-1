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

import { useRef, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HiSparkles, HiArrowPath, HiTicket, HiChatBubbleLeftRight, HiArrowRight } from 'react-icons/hi2';

import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInputBox from './ChatInputBox';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

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
  const { messages, isTyping, sendMessage, clearConversation, conversationTitle } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [dismissedLowConfidence, setDismissedLowConfidence] = useState(false);

  // Scroll to bottom on new messages or when AI starts/stops typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const latestAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((message) => message.role === 'assistant');
  }, [messages]);

  const lowConfidence = !dismissedLowConfidence
    && typeof latestAssistantMessage?.confidence === 'number'
    && latestAssistantMessage.confidence < 0.6;

  const suggestedQuestions = latestAssistantMessage?.suggestedQuestions || [];
  const providerLabel = latestAssistantMessage?.provider ? String(latestAssistantMessage.provider).replace(/_/g, ' ') : 'RAG';

  function handleCreateTicket() {
    navigate(ROUTES.TICKETS);
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 dark:bg-gray-950 ${className}`}>

      {/* Chat header */}
      <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b
                      border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center shadow-sm">
            <HiSparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{conversationTitle || 'AI Assistant'}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isTyping ? 'Typing…' : providerLabel}
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

            {!isTyping && suggestedQuestions.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-300"
                  >
                    <HiArrowRight className="w-3.5 h-3.5" />
                    {question}
                  </button>
                ))}
              </div>
            )}

            {lowConfidence && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">AI is not fully confident.</p>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/80">
                      The assistant may be missing context. You can continue the conversation or create a support ticket.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<HiChatBubbleLeftRight className="w-4 h-4" />} onClick={() => setDismissedLowConfidence(true)}>
                      Continue Chat
                    </Button>
                    <Button variant="primary" size="sm" leftIcon={<HiTicket className="w-4 h-4" />} onClick={handleCreateTicket}>
                      Create Support Ticket
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
