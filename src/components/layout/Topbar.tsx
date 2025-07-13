import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import ConfirmModal from '@/components/layout/ConfirmModal';

interface TopbarProps {
    userName?: string;
    onLogoutSuccess?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ userName = 'Shavkat Begmatov', onLogoutSuccess }) => {
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
        <div className="flex justify-between items-center p-4 bg-white shadow-md border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-800 flex items-center">
                👤 {userName}
            </span>
            <div>
                <button
                    onClick={handleLogoutClick}
                    className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer ${
                        isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Initiate log out of the application"
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
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