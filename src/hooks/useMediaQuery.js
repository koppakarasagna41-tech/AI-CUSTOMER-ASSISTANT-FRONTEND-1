/**
 * useMediaQuery.js
 *
 * Returns true when the given CSS media query matches.
 * Updates reactively as the viewport resizes.
 *
 * Usage:
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    // Modern API
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Convenience shortcuts
export function useIsMobile()  { return useMediaQuery('(max-width: 767px)');  }
export function useIsTablet()  { return useMediaQuery('(max-width: 1023px)'); }
export function useIsDesktop() { return useMediaQuery('(min-width: 1024px)'); }

export default useMediaQuery;
