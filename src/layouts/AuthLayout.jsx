/**
 * AuthLayout.jsx
 *
 * Centered two-column layout for Login / Register pages.
 *
 * Left column  — decorative brand panel (hidden on mobile)
 * Right column — <Outlet /> (the auth form)
 */

import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/utils/constants';

// Testimonials shown in the left brand panel
const TESTIMONIALS = [
  {
    quote: 'Response times dropped by 60% after deploying the AI assistant.',
    author: 'Sarah K., Head of Support @ TechFlow',
  },
  {
    quote: 'Our CSAT score hit 97% — customers love the instant, accurate answers.',
    author: 'Marcus L., CX Director @ Shopwave',
  },
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-950">

      {/* ── Left brand panel ────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[560px]
                      bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800
                      p-12 shrink-0 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full
                        bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-0 w-96 h-96 rounded-full
                        bg-primary-900/40 blur-3xl pointer-events-none" />

        {/* Brand mark */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center
                          justify-center backdrop-blur-sm">
            <HiSparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">AI Support</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight text-balance">
            Smarter support,<br />delivered instantly.
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            Our AI assistant handles thousands of conversations simultaneously —
            so your team can focus on what matters most.
          </p>

          {/* Testimonials */}
          <div className="space-y-4 pt-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border
                           border-white/15"
              >
                <p className="text-white text-sm leading-relaxed">"{t.quote}"</p>
                <p className="text-primary-300 text-xs mt-2 font-medium">{t.author}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-primary-300/70 text-xs">
          © {new Date().getFullYear()} AI Support. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Mobile brand (only visible on small screens) */}
          <Link to={ROUTES.HOME}
            className="lg:hidden flex items-center gap-2 font-bold
                           text-primary-600 dark:text-primary-400">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center
                            justify-center text-white text-xs font-black">AI</div>
            Support
          </Link>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </div>

        {/* Auth form outlet — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
