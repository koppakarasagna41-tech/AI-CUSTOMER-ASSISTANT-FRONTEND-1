/**
 * NotFoundPage.jsx
 *
 * 404 page — shown for any unmatched route.
 * Includes animated illustration and navigation shortcuts.
 */

import { Link, useNavigate } from 'react-router-dom';
import { motion }            from 'framer-motion';
import { HiHome, HiArrowLeft, HiChatBubbleLeftRight } from 'react-icons/hi2';
import { ROUTES } from '@/utils/constants';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50
                    dark:bg-gray-950 px-6">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          className="relative select-none"
        >
          <p className="text-[9rem] font-black text-gray-100 dark:text-gray-800 leading-none">
            404
          </p>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center shadow-glow">
              <HiChatBubbleLeftRight className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist, was moved, or the URL
            is incorrect.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary w-full sm:w-auto"
          >
            <HiArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <Link to={ROUTES.HOME} className="btn-primary w-full sm:w-auto">
            <HiHome className="w-4 h-4" />
            Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
