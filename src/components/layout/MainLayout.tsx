// src/components/layout/MainLayout.tsx
import { type ReactNode, useState, Suspense } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'; // New import for breadcrumb

interface MainLayoutProps {
    children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} />
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
                <Topbar
                    onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
                    isSidebarOpen={isSidebarOpen}
                />
                <Breadcrumb /> {/* Added breadcrumb here, below topbar */}
                <main className="p-8 bg-white flex-1 shadow-inner transition-all duration-300 hover:shadow-md">
                    {children}
                    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-100">Loading...</div>}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}