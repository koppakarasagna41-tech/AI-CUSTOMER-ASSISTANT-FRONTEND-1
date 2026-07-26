/**
 * Avatar.jsx
 *
 * User avatar with image + initials fallback.
 * Props:
 *  - src     : image URL (optional)
 *  - name    : used to generate initials if no src
 *  - size    : 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *  - className: extra classes
 */

import { getInitials } from '@/utils/helpers';

const SIZES = {
  xs: 'w-6  h-6  text-[10px]',
  sm: 'w-8  h-8  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const BG_COLORS = [
  'bg-blue-500',  'bg-purple-500', 'bg-green-500',
  'bg-yellow-500','bg-red-500',    'bg-pink-500',
  'bg-indigo-500','bg-teal-500',
];

function pickColor(name = '') {
  const code = name.charCodeAt(0) || 0;
  return BG_COLORS[code % BG_COLORS.length];
}

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const sizeClass = SIZES[size] ?? SIZES.md;
  const base      = `inline-flex items-center justify-center rounded-full
                     flex-shrink-0 font-semibold text-white select-none overflow-hidden
                     ${sizeClass} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span className={`${base} ${pickColor(name)}`} aria-label={name}>
      {getInitials(name) || '?'}
    </span>
  );
}
