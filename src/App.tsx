// src/App.tsx
// Bu fayl ilovaning asosiy komponentidir va barcha marshrutlarni (routes) boshqaradi.
// Lazy loading bilan sahifalar optimallashtirilgan, Auth va WebSocket kontekstlari qo'llanilgan.
// <Toaster /> qo'shildi: react-hot-toast uchun global notificatsiya komponenti.
// Toaster pozitsiyasi: top-center, va custom stillar qo'llanilgan.

import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';  // Toaster import qilindi
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
                        {/* Toaster komponenti: Global notificatsiyalar uchun */}
                        <Toaster
                            position="top-center"  // Toaster ekranning yuqori o'rtasida chiqadi
                            reverseOrder={false}  // Yangi toasts yuqoridan qo'shiladi
                            toastOptions={{
                                duration: 4000,  // 4 soniya davom etadi
                                style: {
                                    background: '#fff',  // Oq fon
                                    color: '#333',  // Qora matn
                                    border: '1px solid #e5e7eb',  // Kulrang chegara
                                    borderRadius: '8px',  // Yumaloq burchaklar
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',  // Engil soya
                                },
                                success: {
                                    style: {
                                        borderLeft: '4px solid #10b981',  // Yashil chegara (success)
                                    },
                                },
                                error: {
                                    style: {
                                        borderLeft: '4px solid #ef4444',  // Qizil chegara (error)
                                    },
                                },
                            }}
                        />
                    </Suspense>
                </WebSocketProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;