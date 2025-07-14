import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom'; // Sahifa o'zgarishini kuzatish uchun

interface OnlineUser {
    username: string;
    onlineSince: string; // LocalDateTime string
    currentPage: string;
    // Tarix uchun: pageHistory: string[]; agar kerak bo'lsa qo'shing
}

const OnlineUsers: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation(); // Joriy sahifani olish uchun
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<Client | null>(null);  // Client ni saqlash uchun ref
    const subscribedRef = useRef<boolean>(false);  // Subscribe holatini saqlash uchun ref

    useEffect(() => {
        if (!isAuthenticated) {
            setError('Autentikatsiya talab qilinadi');
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Token topilmadi');
            return;
        }

        // Client ni faqat bir marta yarating
        if (!clientRef.current) {
            const stompClient = new Client({
                webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}/ws-logs?access_token=${token}`),
                connectHeaders: { Authorization: `Bearer ${token}` },
                reconnectDelay: 5000,
                onConnect: () => {
                    // Subscribe ni faqat bir marta qiling
                    if (!subscribedRef.current) {
                        stompClient.subscribe('/topic/online-users', (message) => {
                            const users: OnlineUser[] = JSON.parse(message.body);
                            setOnlineUsers(users);
                        });
                        subscribedRef.current = true;
                    }
                },
                onStompError: (frame) => {
                    setError(`Xato: ${frame.body}`);
                },
            });

            stompClient.activate();
            clientRef.current = stompClient;
        }

        return () => {
            // Cleanup: Component unmount bo'lganda client ni deactivate qiling
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                subscribedRef.current = false;
            }
        };
    }, [isAuthenticated]);

    // Sahifa o'zgarishini backendga yuborish
    useEffect(() => {
        if (clientRef.current && clientRef.current.active && subscribedRef.current) {
            const username = localStorage.getItem('username'); // Username ni AuthContext yoki localStorage dan oling (loyihangizga moslang)
            if (username) {
                clientRef.current.publish({
                    destination: '/app/update-page',
                    body: JSON.stringify({ username, page: location.pathname }),
                });
            }
        }
    }, [location.pathname]); // Sahifa o'zgarganda ishga tushadi

    // Vaqtni "DD.MM.YYYY HH:MM:SS" formatga o'zgartirish funksiyasi
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    };

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Online Foydalanuvchilar ({onlineUsers.length})</h1>
            {onlineUsers.length === 0 ? (
                <p className="text-gray-600 italic">Hech qanday online foydalanuvchi yo'q</p>
            ) : (
                <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                        <th className="border px-6 py-3 text-left font-semibold">Foydalanuvchi</th>
                        <th className="border px-6 py-3 text-left font-semibold">Online Bo'lgan Vaqt</th>
                        <th className="border px-6 py-3 text-left font-semibold">Joriy Sahifa</th>
                    </tr>
                    </thead>
                    <tbody>
                    {onlineUsers.map((user, index) => (
                        <tr
                            key={index}
                            className={`hover:bg-gray-100 transition-colors duration-200 ${
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } text-green-700`}
                        >
                            <td className="border px-6 py-3 font-medium">{user.username}</td>
                            <td className="border px-6 py-3">{formatTimestamp(user.onlineSince)}</td>
                            <td className="border px-6 py-3">{user.currentPage}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OnlineUsers;