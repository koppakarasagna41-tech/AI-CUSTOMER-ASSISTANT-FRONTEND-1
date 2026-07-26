/**
 * StatCard.jsx
 *
 * KPI card used on the Analytics Dashboard.
 * Props:
 *  - title   : metric name
 *  - value   : formatted value string
 *  - icon    : React node
 *  - trend   : { value: number, isPositive: boolean } (optional)
 *  - color   : Tailwind color prefix for icon background
 */

import { motion } from 'framer-motion';
import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

const COLOR_MAP = {
  blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  green:  'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
  red:    'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

export default function StatCard({ title, value, icon, trend, color = 'blue' }) {
  const iconClass = COLOR_MAP[color] ?? COLOR_MAP.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3 }}
      className="card p-5 flex items-start gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                       flex-shrink-0 ${iconClass}`}>
        <span className="w-5 h-5">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white leading-none">
          {value}
        </p>

        {trend && (
          <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium
                          ${trend.isPositive ? 'text-green-600 dark:text-green-400'
                                             : 'text-red-600 dark:text-red-400'}`}>
            {trend.isPositive
              ? <HiArrowTrendingUp className="w-3.5 h-3.5" />
              : <HiArrowTrendingDown className="w-3.5 h-3.5" />
            }
            <span>{Math.abs(trend.value)}% vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
