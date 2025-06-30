import { useNavigate } from 'react-router-dom';

export default function Topbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex justify-between items-center p-4 bg-white shadow">
            <span>👤 Shavkat Begmatov</span>
            <button onClick={handleLogout} className="text-red-500 hover:underline">
                Log out
            </button>
        </div>
    );
}