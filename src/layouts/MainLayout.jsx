/**
 * MainLayout.jsx
 *
 * Shell for all authenticated pages.
 * Structure:
 *   ┌──────────────────────────────────┐
 *   │  Sidebar (desktop, sticky)       │
 *   │  ┌────────────────────────────┐  │
 *   │  │  Navbar (sticky top)       │  │
 *   │  │  <Outlet /> (page content) │  │
 *   │  └────────────────────────────┘  │
 *   └──────────────────────────────────┘
 *   MobileNav drawer (off-canvas, mobile only)
 */

import { useState } from 'react';
import { Outlet }   from 'react-router-dom';
import { motion }   from 'framer-motion';

import Navbar    from '@/components/Navbar';
import Sidebar   from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export default function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setMobileNavOpen(true)} />

        {/* Page area */}
        <motion.main
          key="main-content"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
