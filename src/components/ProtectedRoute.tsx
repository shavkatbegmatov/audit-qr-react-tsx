import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingFallback from './LoadingFallback';
import { ROUTES } from '../App';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <LoadingFallback />;
    return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;