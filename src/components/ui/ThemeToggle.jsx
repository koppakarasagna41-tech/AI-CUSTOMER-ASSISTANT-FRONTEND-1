/**
 * ThemeToggle.jsx
 *
 * Animated sun/moon toggle button.
 * Reads and writes theme via ThemeContext.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi2';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative inline-flex items-center justify-center w-9 h-9 rounded-lg
        text-gray-500 hover:text-gray-700 hover:bg-gray-100
        dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary-500
        ${className}
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <HiMoon className="w-5 h-5" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90,  opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <HiSun className="w-5 h-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
