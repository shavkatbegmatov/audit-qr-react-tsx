// App.tsx
import {Routes, Route, Navigate} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import AuditObjectTypesPage from './pages/AuditObjectTypesPage';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="audit-object-types" element={<AuditObjectTypesPage />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} /> {/* Catch-all route */}
            </Routes>
        </AuthProvider>
    );
}