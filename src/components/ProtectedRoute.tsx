// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { ROUTES } from '@/utils/constants';

type Props = {
    requireAdmin?: boolean;
    fallback?: React.ReactNode; // ixtiyoriy loader
};

const ProtectedRoute: React.FC<Props> = ({ requireAdmin = false, fallback }) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            fallback ?? (
                <div className="flex items-center justify-center min-h-screen">Loading...</div>
            )
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
