import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoadingFallback from './components/LoadingFallback';
import ErrorFallback from './components/ErrorFallback'; // AppErrorFallback o'rniga ErrorFallback

// Lazy load pages
const LazyLoginPage = lazy(() => import('./pages/LoginPage'));
const LazyDashboardPage = lazy(() => import('./pages/DashboardPage'));
const LazyAuditObjectTypesPage = lazy(() => import('./pages/AuditObjectTypesPage'));

// Route constants
export const ROUTES = {
    LOGIN: '/login',
    ROOT: '/',
    AUDIT_OBJECT_TYPES: '/audit-object-types',
    WILDCARD: '*',
} as const;

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AuthProvider>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path={ROUTES.LOGIN} element={<LazyLoginPage />} />
                        <Route element={<ProtectedRoute />}>
                            <Route path={ROUTES.ROOT} element={<MainLayout />}>
                                <Route index element={<LazyDashboardPage />} />
                                <Route
                                    path={ROUTES.AUDIT_OBJECT_TYPES}
                                    element={<LazyAuditObjectTypesPage />}
                                />
                            </Route>
                        </Route>
                        <Route
                            path={ROUTES.WILDCARD}
                            element={<Navigate to={ROUTES.LOGIN} replace />}
                        />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;