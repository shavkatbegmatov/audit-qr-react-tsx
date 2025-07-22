import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import ConfirmModal from '@/components/layout/ConfirmModal';
import Button from '@/components/ui/Button';
import { FaBars, FaTimes } from 'react-icons/fa';

interface TopbarProps {
    userName?: string;
    onLogoutSuccess?: () => void;
    onMenuClick: () => void;
    isSidebarOpen: boolean; // Yangi prop
}

const Topbar: React.FC<TopbarProps> = ({ userName = 'Shavkat Begmatov', onLogoutSuccess, onMenuClick, isSidebarOpen }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login', { replace: true });
            if (onLogoutSuccess) onLogoutSuccess();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
            setShowConfirmModal(false);
        }
    };

    const handleLogoutClick = () => {
        setShowConfirmModal(true);
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
    };

    return (
        <div className="flex justify-between items-center p-4 bg-white shadow-lg border-b border-gray-300 transition-shadow duration-300 hover:shadow-xl">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="text-black text-[35px] cursor-pointer hover:rotate-90 transition-transform duration-300">
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
                <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
          👤 {userName}
        </span>
            </div>
            <div>
                <Button
                    variant="danger"
                    isLoading={isLoggingOut}
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut}
                    aria-label="Initiate log out of the application"
                    className="px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </Button>
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onConfirm={handleLogout}
                    onCancel={handleCancel}
                    isLoading={isLoggingOut}
                    title="Confirm Logout"
                    message="Are you sure you want to log out?"
                />
            </div>
        </div>
    );
};

export default Topbar;