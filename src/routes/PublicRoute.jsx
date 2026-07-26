/**
 * PublicRoute.jsx
 *
 * Guards auth pages (Login / Register) so already-authenticated
 * users are not shown them — they get redirected to the dashboard
 * or back to wherever they came from.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth }    from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES }     from '@/utils/constants';

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (isAuthenticated) {
    // Redirect to where they were going before, or fall back to home
    const destination = location.state?.from?.pathname || ROUTES.HOME;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
