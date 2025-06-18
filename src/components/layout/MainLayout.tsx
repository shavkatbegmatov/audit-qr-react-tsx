import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-52">
                <Topbar />
                <main className="p-6 bg-gray-50 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
