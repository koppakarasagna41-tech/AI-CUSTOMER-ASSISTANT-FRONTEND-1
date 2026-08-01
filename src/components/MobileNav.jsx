/**
 * MobileNav.jsx
 *
 * Slide-in drawer navigation for mobile screens.
 * Triggered by the hamburger in Navbar.
 *
 * Props:
 *  - isOpen   : boolean
 *  - onClose  : () => void
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiXMark,
  HiSparkles,
} from 'react-icons/hi2';

import { ROUTES, USER_ROLE } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { getNavigationItems, isStaffRole } from '@/utils/navigation';

export default function MobileNav({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const visibleNavItems = getNavigationItems(user?.role);
  const staffMode = isStaffRole(user?.role);
  const workspaceLabel = user?.role === USER_ROLE.ADMIN
    ? 'Admin Workspace'
    : staffMode
      ? 'Agent Workspace'
      : 'Customer Assistant';

  function handleLogout() {
    logout();
    toast.success('You have been signed out.');
    onClose();
    navigate(ROUTES.LOGIN);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-[min(88vw,20rem)] max-w-[20rem] flex flex-col
                       bg-white dark:bg-gray-900 shadow-xl md:hidden"
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b
                            border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700
                                rounded-xl flex items-center justify-center">
                  <HiSparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block font-bold text-gray-900 dark:text-white">AI Support</span>
                  <span className="block text-[10px] text-gray-400">
                    {workspaceLabel}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="btn-ghost p-2 rounded-lg w-10 h-10"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {visibleNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-h-11
                    transition-colors
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User footer */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {user?.name ?? 'Guest'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email ?? ''}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full btn-secondary justify-center"
              >
                Sign out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
