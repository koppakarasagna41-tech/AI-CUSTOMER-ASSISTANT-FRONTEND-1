/**
 * Sidebar.jsx
 *
 * Desktop sidebar navigation.
 * On mobile it is hidden and replaced by MobileNav.
 *
 * Nav items are driven by the NAV_ITEMS array below —
 * add a new route here and it appears automatically.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';

import { ROUTES } from '@/utils/constants';
import { getNavigationItems, isStaffRole } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Avatar from '@/components/ui/Avatar';

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-150 group min-h-11
        ${isActive
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-900/30"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <Icon className={`relative w-5 h-5 flex-shrink-0 transition-colors
                            ${isActive ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
          <span className="relative">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const visibleNavItems = getNavigationItems(user?.role);
  const staffMode = isStaffRole(user?.role);

  function handleLogout() {
    logout();
    toast.success('You have been signed out.');
    navigate(ROUTES.LOGIN);
  }

  return (
    <aside className="hidden md:flex flex-col w-[17rem] xl:w-64 min-h-screen sticky top-0
                      bg-white dark:bg-gray-900 border-r border-gray-200
                      dark:border-gray-700/60 shrink-0">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-200
                      dark:border-gray-700/60 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700
                        rounded-xl flex items-center justify-center shadow-glow">
          <HiSparkles className="w-4 h-4 text-white" />
        </div>
        <div className="leading-none">
          <p className="font-bold text-gray-900 dark:text-white text-sm">AI Support</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {staffMode ? 'Agent Workspace' : 'Customer Assistant'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
        {visibleNavItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700/60">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                     hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        >
          <Avatar src={user?.avatar} name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
              {user?.name ?? 'Guest'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email ?? ''}</p>
          </div>
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
