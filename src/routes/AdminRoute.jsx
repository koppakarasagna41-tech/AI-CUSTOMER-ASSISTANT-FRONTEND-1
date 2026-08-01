import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES, USER_ROLE } from '@/utils/constants';

export default function AdminRoute() {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingSpinner fullPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    if (user?.role !== USER_ROLE.ADMIN) {
        if (user?.role === USER_ROLE.AGENT) {
            return <Navigate to={ROUTES.HOME} replace />;
        }
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <Outlet />;
}
