import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { WebSocketProvider } from '@/context/WebSocketProvider';
import { SidebarProvider } from '@/context/SidebarContext';
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
                    <SidebarProvider>
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
                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#fff',
                                        color: '#333',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    },
                                    success: {
                                        style: {
                                            borderLeft: '4px solid #10b981',
                                        },
                                    },
                                    error: {
                                        style: {
                                            borderLeft: '4px solid #ef4444',
                                        },
                                    },
                                }}
                            />
                        </Suspense>
                    </SidebarProvider>
                </WebSocketProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;