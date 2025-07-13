import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Audit Object Types</h2>
                        <p className="text-gray-600 text-sm">Barcha obyekt turlari ro‘yxati</p>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Audit Logs</h2>
                        <p className="text-gray-600 text-sm">Kundalik harakatlar protokoli</p>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">User Management</h2>
                        <p className="text-gray-600 text-sm">Foydalanuvchilarni boshqarish</p>
                    </div>
                </div>
            </div>
        </div>
    );
}