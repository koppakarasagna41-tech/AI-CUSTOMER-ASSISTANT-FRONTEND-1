/**
 * ProtectedRoute.jsx
 *
 * Guards routes that require authentication.
 * - Shows a full-page spinner while auth state is hydrating from localStorage.
 * - Redirects unauthenticated users to /login, preserving the intended URL
 *   via React Router's `state.from` so we can redirect back after login.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/utils/constants';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  function getLoginRoute(pathname) {
    if (pathname.startsWith(ROUTES.ADMIN)) return ROUTES.ADMIN_LOGIN;
    if (pathname.startsWith(ROUTES.AGENT)) return ROUTES.AGENT_LOGIN;
    return ROUTES.LOGIN;
  }

  // Still hydrating auth state — show full-page spinner
  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  // Not authenticated — bounce to portal-specific login, remember where they were going
  if (!isAuthenticated) {
    return (
      <Navigate
        to={getLoginRoute(location.pathname)}
        state={{ from: location }}
        replace
      />
    );
  }

  // Authenticated — render child routes
  return <Outlet />;
}
