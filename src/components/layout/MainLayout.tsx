import { type ReactNode, useState, Suspense } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/context/auth-context";

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Breadcrumb from '@/components/breadcrumb/Breadcrumb';

interface MainLayoutProps {
    children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Fixed Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Right content area */}
            <div
                className={`flex flex-col flex-1 min-w-0 transition-[margin] duration-300 ${
                    isSidebarOpen ? 'ml-[280px]' : 'ml-0'
                }`}
            >
                {/* Sticky Topbar */}
                <Topbar
                    onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
                    isSidebarOpen={isSidebarOpen}
                />

                {/* Optional: sticky breadcrumb */}
                <div className="sticky top-16 z-30 bg-gray-100/80 backdrop-blur">
                    <Breadcrumb />
                </div>

                {/* Scrollable main */}
                <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                    <Suspense fallback={<div className="flex items-center justify-center h-40 text-gray-500">Yuklanmoqda...</div>}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
