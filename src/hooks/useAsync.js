/**
 * useAsync.js
 *
 * Wraps an async function and tracks its loading / error / data states.
 * Prevents state updates on unmounted components.
 *
 * Usage:
 *   const { execute, data, isLoading, error } = useAsync(myAsyncFn);
 *   useEffect(() => { execute(arg1, arg2); }, []);
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useAsync(asyncFunction) {
  const [state, setState] = useState({
    data:      null,
    isLoading: false,
    error:     null,
  });

  // Track whether the component is still mounted
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setState({ data: null, isLoading: true, error: null });
      try {
        const result = await asyncFunction(...args);
        if (mountedRef.current) {
          setState({ data: result, isLoading: false, error: null });
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setState({ data: null, isLoading: false, error: err });
        }
        throw err;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export default useAsync;
