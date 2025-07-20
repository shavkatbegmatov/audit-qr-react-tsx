// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { WebSocketProvider } from '@/context/WebSocketContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoadingFallback from '@/components/LoadingFallback';
import ErrorFallback from '@/components/ErrorFallback';
import { ROUTES } from '@/utils/constants';

const LazyLoginPage = lazy(() => import('@/pages/LoginPage'));
const LazyDashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LazyAuditObjectTypesPage = lazy(() => import('@/pages/AuditObjectTypesPage'));
const LazyAuditLogsPage = lazy(() => import('@/pages/AuditLogsPage'));
const LazyRolesPage = lazy(() => import('@/pages/RolesPage'));
const LazyUsersPage = lazy(() => import('@/pages/UsersPage'));

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AuthProvider>
                <WebSocketProvider>
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
                                    <Route
                                        path={ROUTES.AUDIT_LOGS}
                                        element={<LazyAuditLogsPage />}
                                    />
                                    <Route
                                        path={ROUTES.ROLES}
                                        element={<LazyRolesPage />}
                                    />
                                    <Route
                                        path={ROUTES.USERS}
                                        element={<LazyUsersPage />}
                                    />
                                </Route>
                            </Route>
                            <Route
                                path={ROUTES.WILDCARD}
                                element={<Navigate to={ROUTES.LOGIN} replace />}
                            />
                        </Routes>
                    </Suspense>
                </WebSocketProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;