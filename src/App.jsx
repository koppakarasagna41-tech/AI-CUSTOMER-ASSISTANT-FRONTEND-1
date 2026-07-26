/**
 * App.jsx — Root application component
 *
 * Responsibilities:
 *  1. Provides global context (Auth, Theme, Toast)
 *  2. Renders the route tree defined in src/routes/index.jsx
 *
 * Keep this file thin — all routing logic lives in routes/index.jsx
 * and all business logic lives in context providers.
 */

import { AuthProvider }  from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import AppRoutes         from '@/routes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
