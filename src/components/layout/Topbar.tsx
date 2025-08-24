// src/components/layout/Topbar.tsx

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import React, { useState, useEffect, useRef } from 'react';
import ConfirmModal from '@/components/layout/ConfirmModal';
import {
    FaBars,
    FaTimes,
    FaUserCircle,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
    FaChevronDown
} from 'react-icons/fa';

interface TopbarProps {
    userName?: string;
    onLogoutSuccess?: () => void;
    onMenuClick: () => void;
    isSidebarOpen: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ userName = 'Shavkat Begmatov', onLogoutSuccess, onMenuClick, isSidebarOpen }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Dropdown'dan tashqariga bosilganda uni yopish uchun
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        setIsDropdownOpen(false); // Modal ochilganda dropdownni yopish
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
    };

    return (
        <div className="flex justify-between items-center p-4 bg-white shadow-lg border-b border-gray-200">
            {/* Chap taraf: Menyu ochish tugmasi */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="text-gray-600 text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
                    aria-label="Toggle sidebar"
                >
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* O'ng taraf: Foydalanuvchi Dropdown Menyusi */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                    <FaUserCircle className="text-2xl text-gray-700" />
                    <span className="font-semibold text-gray-800 hidden md:block">{userName}</span>
                    <FaChevronDown className={`text-xs text-gray-600 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menyu kontenti */}
                {isDropdownOpen && (
                    <div
                        className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-50 ring-1 ring-black ring-opacity-5 origin-top-right animate-scale-in"
                        // `animate-scale-in` uchun `tailwind.config.js` ga kichik o'zgartirish kerak bo'lishi mumkin
                    >
                        <div className="py-1">
                            <div className="px-4 py-2 border-b">
                                <p className="text-sm text-gray-900 font-semibold">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                            </div>
                            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                <FaCog className="text-gray-500" /> Sozlamalar
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                <FaQuestionCircle className="text-gray-500" /> Yordam markazi
                            </a>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={handleLogoutClick}
                                disabled={isLoggingOut}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <FaSignOutAlt />
                                {isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Chiqishni tasdiqlash uchun Modal oynasi (joyi o'zgarmaydi) */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onConfirm={handleLogout}
                onCancel={handleCancel}
                isLoading={isLoggingOut}
                title="Chiqishni tasdiqlang"
                message="Haqiqatan ham tizimdan chiqmoqchimisiz?"
            />
        </div>
    );
};

export default Topbar;

// CSS animatsiyasi uchun (ixtiyoriy)
// globals.css yoki asosiy css faylingizga qo'shing:
/*
@keyframes scale-in {
    0% {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
.animate-scale-in {
    animation: scale-in 0.1s ease-out forwards;
}
*/