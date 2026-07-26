/**
 * Input.jsx
 *
 * Styled text input with optional leading/trailing icon and error message.
 *
 * Props:
 *  - label       : field label string
 *  - error       : validation error string
 *  - leftIcon    : React node rendered inside left edge
 *  - rightIcon   : React node rendered inside right edge
 *  - ...rest     : forwarded to <input>
 */

import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, leftIcon, rightIcon, className = '', id, ...rest },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex
                           items-center pl-3 text-gray-400 dark:text-gray-500">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            input
            ${leftIcon  ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error     ? 'border-red-400 focus:ring-red-400 dark:border-red-500' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3
                           text-gray-400 dark:text-gray-500">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
