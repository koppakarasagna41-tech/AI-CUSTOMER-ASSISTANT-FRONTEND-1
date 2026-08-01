import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/utils/constants';

export default function AdminRoute() {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner fullPage />;
    }

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <Outlet />;
}
