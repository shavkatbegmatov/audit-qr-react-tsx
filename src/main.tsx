import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/dashboard';
import AuditObjectTypesPage from './pages/audit-object-types';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="audit-object-types" element={<AuditObjectTypesPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
