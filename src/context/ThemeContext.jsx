/**
 * ThemeContext.jsx
 *
 * Controls light / dark mode.
 * - Reads the user's OS preference on first visit (prefers-color-scheme).
 * - Persists the explicit choice to localStorage.
 * - Toggles the 'dark' class on <html> so Tailwind's darkMode:'class' works.
 *
 * Exports:
 *  - ThemeProvider — wraps the app tree
 *  - useTheme      — hook for consuming theme state/actions
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

// ── Helper: detect system preference ────────────────────────
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ── Provider ─────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || getSystemTheme();
  });

  // Apply / remove 'dark' class on <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setLightTheme = useCallback(() => setTheme('light'), []);
  const setDarkTheme  = useCallback(() => setTheme('dark'),  []);

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export default ThemeContext;
