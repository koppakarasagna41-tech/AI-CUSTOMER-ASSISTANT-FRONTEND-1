/**
 * PublicRoute.jsx
 *
 * Guards auth pages (Login / Register) so already-authenticated
 * users are not shown them — they get redirected to the dashboard
 * or back to wherever they came from.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES, USER_ROLE } from '@/utils/constants';

export default function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (isAuthenticated) {
    const destination =
      location.state?.from?.pathname ||
      (user?.role === USER_ROLE.ADMIN
        ? ROUTES.ADMIN_DASHBOARD
        : user?.role === USER_ROLE.AGENT
          ? ROUTES.AGENT_DASHBOARD
          : ROUTES.DASHBOARD);
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
