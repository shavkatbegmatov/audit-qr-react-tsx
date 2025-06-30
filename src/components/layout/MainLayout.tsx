import {type ReactNode, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
    children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const token = localStorage.getItem('token');
    const location = useLocation();

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-52">
                <Topbar />
                <main className="p-6 bg-gray-50 flex-1">
                    {children}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}