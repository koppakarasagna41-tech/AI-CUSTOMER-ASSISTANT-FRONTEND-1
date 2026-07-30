/**
 * ChatInputBox.jsx
 *
 * Multi-line auto-growing text input at the bottom of the chat window.
 * Supports:
 *  - Enter to send (Shift+Enter for new line)
 *  - Emoji suggestions placeholder button
 *  - Attachment placeholder button
 *  - Character count warning
 *  - Disabled state while AI is typing
 *
 * Props:
 *  - onSend    : (content: string) => void
 *  - disabled  : boolean
 */

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HiPaperAirplane,
  HiPaperClip,
  HiFaceSmile,
  HiMicrophone,
} from 'react-icons/hi2';

const MAX_CHARS = 2000;

export default function ChatInputBox({ onSend, disabled = false }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow the textarea
  function handleChange(e) {
    setValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;
  const canSend = value.trim().length > 0 && !disabled && !overLimit;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white
                    dark:bg-gray-900 px-3 py-3 sm:px-4">
      <div className={`flex items-end gap-2 rounded-2xl border px-3 py-2 sm:px-4 transition-colors min-h-[48px]
                       ${disabled
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400'
        }`}>

        {/* Attachment placeholder */}
        <button
          type="button"
          disabled={disabled}
          aria-label="Attach file"
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                     disabled:opacity-40 transition-colors p-1"
        >
          <HiPaperClip className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'AI is responding…' : 'Type a message…'}
          rows={1}
          maxLength={MAX_CHARS + 50}          // allow slight over to show counter
          aria-label="Message input"
          className="flex-1 resize-none bg-transparent text-[15px] sm:text-sm text-gray-900
                     dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none leading-relaxed py-1 max-h-40 no-scrollbar
                     disabled:cursor-not-allowed"
        />

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Emoji placeholder */}
          <button
            type="button"
            disabled={disabled}
            aria-label="Emoji"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       disabled:opacity-40 transition-colors p-1"
          >
            <HiFaceSmile className="w-5 h-5" />
          </button>

          {/* Voice placeholder */}
          {!value && (
            <button
              type="button"
              disabled={disabled}
              aria-label="Voice input"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         disabled:opacity-40 transition-colors p-1"
            >
              <HiMicrophone className="w-5 h-5" />
            </button>
          )}

          {/* Send */}
          {value && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              className={`p-1.5 rounded-xl transition-all duration-200
                         ${canSend
                  ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                  : 'bg-gray-200 text-gray-400 dark:bg-gray-700 cursor-not-allowed'
                }`}
            >
              <HiPaperAirplane className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Footer row: hint + char count */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mt-1.5 px-1">
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Press <kbd className="font-mono">Enter</kbd> to send ·{' '}
          <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
        {nearLimit && (
          <span className={`text-[11px] font-medium
                           ${overLimit ? 'text-red-500' : 'text-yellow-500'}`}>
            {charCount} / {MAX_CHARS}
          </span>
        )}
      </div>
    </div>
  );
}
