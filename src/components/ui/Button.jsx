/**
 * Button.jsx
 *
 * Polymorphic button — renders as <button> by default,
 * or wraps a React Router <Link> when `to` prop is provided.
 *
 * Props:
 *  - variant : 'primary' | 'secondary' | 'ghost' | 'danger'
 *  - size    : 'sm' | 'md' | 'lg'
 *  - loading : boolean — shows spinner, disables interaction
 *  - leftIcon / rightIcon : React node
 *  - to      : route path (renders as <Link>)
 *  - ...rest : forwarded to the element
 */

import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const VARIANTS = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 shadow-sm',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-primary-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700',
  ghost:     'text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2   text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2',
};

export default function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  leftIcon  = null,
  rightIcon = null,
  to        = null,
  children,
  className = '',
  disabled,
  ...rest
}) {
  const base = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none select-none
    ${VARIANTS[variant] ?? VARIANTS.primary}
    ${SIZES[size] ?? SIZES.md}
    ${className}
  `;

  const content = (
    <>
      {loading ? (
        <LoadingSpinner size="sm" color="text-current" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={base} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button disabled={disabled || loading} className={base} {...rest}>
      {content}
    </button>
  );
}
