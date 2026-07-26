/**
 * ToastContext.jsx
 *
 * Global toast / notification system.
 * Renders a portal-based stack of toasts in the top-right corner.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success('Saved!');
 *   toast.error('Something went wrong.');
 *   toast.info('Did you know…');
 *   toast.warning('Low disk space.');
 *
 * Exports:
 *  - ToastProvider — wraps the app
 *  - useToast      — hook returning { toast }
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiCheckCircle,
  HiXCircle,
  HiInformationCircle,
  HiExclamationTriangle,
  HiXMark,
} from 'react-icons/hi2';

// ── Types ─────────────────────────────────────────────────────
const VARIANTS = {
  success: {
    icon:  HiCheckCircle,
    base:  'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
    icon_: 'text-green-500',
  },
  error: {
    icon:  HiXCircle,
    base:  'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
    icon_: 'text-red-500',
  },
  info: {
    icon:  HiInformationCircle,
    base:  'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
    icon_: 'text-blue-500',
  },
  warning: {
    icon:  HiExclamationTriangle,
    base:  'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300',
    icon_: 'text-yellow-500',
  },
};

let nextId = 0;

// ── Context ──────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Single Toast item ────────────────────────────────────────
function ToastItem({ id, type = 'info', message, onRemove }) {
  const v = VARIANTS[type] || VARIANTS.info;
  const Icon = v.icon;

  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(t);
  }, [id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{    opacity: 0, y: -10, scale: 0.95  }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 min-w-[280px] max-w-sm w-full
                  px-4 py-3 rounded-xl border shadow-soft text-sm font-medium
                  ${v.base}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${v.icon_}`} />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <HiXMark className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Provider ─────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error',   msg),
    info:    (msg) => addToast('info',    msg),
    warning: (msg) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast portal — renders outside the normal DOM tree */}
      {createPortal(
        <div
          aria-live="polite"
          className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        >
          <AnimatePresence mode="popLayout">
            {toasts.map((t) => (
              <div key={t.id} className="pointer-events-auto">
                <ToastItem {...t} onRemove={removeToast} />
              </div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export default ToastContext;
