/**
 * Badge.jsx
 *
 * Small status / label pill.
 * Props:
 *  - variant : 'blue' | 'green' | 'yellow' | 'red' | 'gray'
 *  - dot     : boolean — show a colored dot prefix
 *  - children
 */

const VARIANTS = {
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  red:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  gray:   'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const DOT_COLORS = {
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  yellow: 'bg-yellow-500',
  red:    'bg-red-500',
  gray:   'bg-gray-400',
  purple: 'bg-purple-500',
};

/** Map a conversation / ticket status to a badge variant */
export function statusVariant(status) {
  const map = { open: 'blue', resolved: 'green', pending: 'yellow', closed: 'gray' };
  return map[status] ?? 'gray';
}

export default function Badge({ variant = 'gray', dot = false, children, className = '' }) {
  const cls = VARIANTS[variant] ?? VARIANTS.gray;
  const dotCls = DOT_COLORS[variant] ?? DOT_COLORS.gray;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                      text-xs font-medium ${cls} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCls}`} />}
      {children}
    </span>
  );
}
