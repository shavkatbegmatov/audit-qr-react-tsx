import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import React, { useState, useEffect, useRef } from 'react';
import ConfirmModal from '@/components/layout/ConfirmModal';
import { FaBars, FaTimes, FaUserCircle, FaCog, FaQuestionCircle, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login', { replace: true });
            onLogoutSuccess?.();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            setIsLoggingOut(false);
            setShowConfirmModal(false);
        }
    };

    return (
        <div className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur border-b border-gray-200">
            <div className="h-full flex items-center justify-between px-4">
                {/* Left: menu toggle */}
                <button
                    onClick={onMenuClick}
                    className="text-gray-600 text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Toggle sidebar"
                    title="Sidebar"
                >
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Right: user dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen((p) => !p)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                    >
                        <FaUserCircle className="text-2xl text-gray-700" />
                        <span className="font-semibold text-gray-800 hidden md:block">{userName}</span>
                        <FaChevronDown className={`text-xs text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-50 ring-1 ring-black ring-opacity-5 origin-top-right animate-scale-in">
                            <div className="py-1">
                                <div className="px-4 py-2 border-b">
                                    <p className="text-sm text-gray-900 font-semibold">{userName}</p>
                                    <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                                </div>
                                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FaCog className="text-gray-500" /> Sozlamalar
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FaQuestionCircle className="text-gray-500" /> Yordam markazi
                                </a>
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                    onClick={() => { setShowConfirmModal(true); setIsDropdownOpen(false); }}
                                    disabled={isLoggingOut}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <FaSignOutAlt />
                                    {isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onConfirm={handleLogout}
                onCancel={() => setShowConfirmModal(false)}
                isLoading={isLoggingOut}
                title="Chiqishni tasdiqlang"
                message="Haqiqatan ham tizimdan chiqmoqchimisiz?"
            />
        </div>
    );
};

export default Topbar;
