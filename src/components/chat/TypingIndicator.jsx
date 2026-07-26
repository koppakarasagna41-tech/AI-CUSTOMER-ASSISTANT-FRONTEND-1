/**
 * TypingIndicator.jsx
 *
 * Animated three-dot "AI is typing" indicator.
 * Shown below the message list while isTyping === true.
 */

import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';

const DOT_VARIANTS = {
  initial: { y: 0  },
  animate: { y: -6 },
};

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-2 mb-4"
      aria-live="polite"
      aria-label="AI is typing"
    >
      {/* AI avatar chip */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                      flex items-center justify-center flex-shrink-0 shadow-sm">
        <HiSparkles className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Bubble */}
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md
                      bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                      shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            variants={DOT_VARIANTS}
            initial="initial"
            animate="animate"
            transition={{
              duration:   0.5,
              repeat:     Infinity,
              repeatType: 'reverse',
              delay:      i * 0.15,
              ease:       'easeInOut',
            }}
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 inline-block"
          />
        ))}
      </div>
    </motion.div>
  );
}
