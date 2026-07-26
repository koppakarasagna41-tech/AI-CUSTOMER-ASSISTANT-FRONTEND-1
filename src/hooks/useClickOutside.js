/**
 * useClickOutside.js
 *
 * Fires `handler` when a click occurs outside the referenced element.
 * Useful for closing dropdowns, modals, and sidebars.
 *
 * Usage:
 *   const ref = useClickOutside(() => setOpen(false));
 *   return <div ref={ref}>...</div>;
 */

import { useEffect, useRef, useCallback } from 'react';

export function useClickOutside(handler) {
  const ref = useRef(null);

  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      stableHandler(event);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [stableHandler]);

  return ref;
}

export default useClickOutside;
