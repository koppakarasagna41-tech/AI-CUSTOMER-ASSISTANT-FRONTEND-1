/**
 * Navbar.jsx
 *
 * Top application bar rendered inside MainLayout.
 * Contains:
 *  - Hamburger (mobile sidebar toggle)
 *  - Page title area
 *  - Theme toggle
 *  - Notification bell
 *  - User avatar / dropdown
 */

import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiBars3,
  HiBell,
  HiChevronDown,
  HiArrowRightOnRectangle,
  HiCog6Tooth,
  HiUser,
} from 'react-icons/hi2';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import { ROUTES } from '@/utils/constants';
import { useClickOutside } from '@/hooks/useClickOutside';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropRef = useClickOutside(() => setDropOpen(false));
  const notifRef = useClickOutside(() => setNotifOpen(false));

  async function handleLogout() {
    await logout();
    toast.success('You have been signed out.');
    const destination = user?.role === USER_ROLE.ADMIN
      ? ROUTES.ADMIN_LOGIN
      : user?.role === USER_ROLE.AGENT
        ? ROUTES.AGENT_LOGIN
        : ROUTES.LOGIN;
    navigate(destination, { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6
                       bg-white/95 backdrop-blur dark:bg-gray-900/95 border-b border-gray-200
                       dark:border-gray-700/60 shadow-sm min-w-0">

      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="btn-ghost p-2 md:hidden rounded-lg w-10 h-10"
      >
        <HiBars3 className="w-5 h-5" />
      </button>

      {/* Logo — visible on mobile when sidebar is hidden */}
      <Link to={ROUTES.HOME} className="md:hidden flex items-center gap-2 font-bold
                                         text-primary-600 dark:text-primary-400 text-lg">
        <span className="w-7 h-7 bg-primary-600 rounded-lg flex items-center
                         justify-center text-white text-xs font-black">AI</span>
        Support
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right-side actions */}
      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((p) => !p); setDropOpen(false); }}
            aria-label="Notifications"
            className="relative btn-ghost p-2 rounded-lg w-10 h-10"
          >
            <HiBell className="w-5 h-5" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                             bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 card shadow-soft py-2 z-50"
              >
                <p className="px-4 pb-2 text-xs font-semibold text-gray-500
                              dark:text-gray-400 uppercase tracking-wide border-b
                              border-gray-100 dark:border-gray-700">
                  Notifications
                </p>
                {[
                  { id: 1, text: 'New conversation assigned to you.', time: '2 min ago' },
                  { id: 2, text: 'Customer rated your response ⭐⭐⭐⭐⭐', time: '18 min ago' },
                  { id: 3, text: 'Weekly analytics report is ready.', time: '1 hr ago' },
                ].map((n) => (
                  <button
                    key={n.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50
                               dark:hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User dropdown */}
        <div ref={dropRef} className="relative ml-1">
          <button
            onClick={() => { setDropOpen((p) => !p); setNotifOpen(false); }}
            aria-label="User menu"
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg min-h-10
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-gray-700
                             dark:text-gray-200 max-w-[120px] truncate">
              {user?.name ?? 'Guest'}
            </span>
            <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform
                                       duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 card shadow-soft py-1 z-50"
              >
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>

                <Link
                  to={ROUTES.SETTINGS}
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                             dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                             transition-colors"
                >
                  <HiUser className="w-4 h-4" /> Profile
                </Link>

                <Link
                  to={ROUTES.SETTINGS}
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                             dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                             transition-colors"
                >
                  <HiCog6Tooth className="w-4 h-4" /> Settings
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-700 mt-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                             text-red-600 dark:text-red-400 hover:bg-red-50
                             dark:hover:bg-red-900/20 transition-colors"
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
