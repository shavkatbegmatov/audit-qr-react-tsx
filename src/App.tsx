import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { WebSocketProvider } from '@/context/WebSocketProvider';
import SidebarProvider from '@/context/SidebarContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoadingFallback from '@/components/LoadingFallback';
import ErrorFallback from '@/components/ErrorFallback';
import { ROUTES } from '@/utils/constants';
import NotFound from '@/pages/NotFound';

const LazyLoginPage = lazy(() => import('@/pages/LoginPage'));
const LazyDashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LazyReferencePage = lazy(() => import('@/pages/ReferencePage'));
const LazyAuditObjectTypesPage = lazy(() => import('@/pages/AuditObjectTypesPage'));
const LazyAuditObjectPage = lazy(() => import('@/pages/AuditObjectPage'));
const LazyAuditObjectBranchNetworkPage = lazy(() => import('@/pages/AuditObjectBranchNetworkPage'));
const LazyBlockPage = lazy(() => import('@/pages/BlockPage'));
const LazyRiskRegistryPage = lazy(() => import('@/pages/RiskRegistryPage'));
const LazyTier1RiskTypesPage = lazy(() => import('@/pages/Tier1RiskTypesPage'));
const LazyTier2RiskTypesPage = lazy(() => import('@/pages/Tier2RiskTypesPage'));
const LazyTier3RiskTypesPage = lazy(() => import('@/pages/Tier3RiskTypesPage'));
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
                                    <Route element={<MainLayout />}>
                                        <Route path={ROUTES.ROOT} element={<LazyDashboardPage />} />
                                        <Route
                                            path={ROUTES.REFERENCE}
                                            element={<LazyReferencePage />}
                                        />
                                        <Route
                                            path={ROUTES.AUDIT_OBJECT_TYPES}
                                            element={<LazyAuditObjectTypesPage />}
                                        />
                                        <Route
                                            path={ROUTES.AUDIT_OBJECT_BRANCH_NETWORKS}
                                            element={<LazyAuditObjectBranchNetworkPage />}
                                        />
                                        <Route
                                            path={ROUTES.AUDIT_OBJECTS}
                                            element={<LazyAuditObjectPage />}
                                        />
                                        <Route
                                            path={ROUTES.BLOCK}
                                            element={<LazyBlockPage />}
                                        />
                                        <Route
                                            path={ROUTES.RISK_REGISTRY}
                                            element={<LazyRiskRegistryPage />}
                                        />
                                        <Route
                                            path={ROUTES.TIER_1_RISK_TYPES}
                                            element={<LazyTier1RiskTypesPage />}
                                        />
                                        <Route
                                            path={ROUTES.TIER_2_RISK_TYPES}
                                            element={<LazyTier2RiskTypesPage />}
                                        />
                                        <Route
                                            path={ROUTES.TIER_3_RISK_TYPES}
                                            element={<LazyTier3RiskTypesPage />}
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
                                        {/* Add sub-routes here as needed */}
                                        <Route path="*" element={<NotFound />} />
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