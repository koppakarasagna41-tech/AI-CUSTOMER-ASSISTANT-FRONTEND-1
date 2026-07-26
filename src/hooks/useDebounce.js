/**
 * useDebounce.js
 *
 * Returns a debounced version of `value` that only updates
 * after the component hasn't re-rendered for `delay` ms.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 400);
 */

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
