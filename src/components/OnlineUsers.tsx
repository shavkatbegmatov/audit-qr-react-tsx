import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';

interface OnlineUser {
    username: string;
    onlineSince: string; // LocalDateTime string
    currentPage: string;
    // Tarix uchun: pageHistory: string[];
}

const OnlineUsers: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        if (!clientRef.current) {
            const stompClient = new Client({
                webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}/ws-logs?access_token=${token}`),
                connectHeaders: { Authorization: `Bearer ${token}` },
                onConnect: () => {
                    stompClient.subscribe('/topic/online-users', (message) => {
                        const users: OnlineUser[] = JSON.parse(message.body);
                        setOnlineUsers(users);
                    });
                },
            });
            stompClient.activate();
            clientRef.current = stompClient;
        }

        return () => {
            if (clientRef.current) clientRef.current.deactivate();
        };
    }, [isAuthenticated]);

    // Sahifa o'zgarishini yuborish (masalan, useLocation bilan)
    // useLocation ishlatib, page change ni backendga yuboring

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="font-bold">Online Foydalanuvchilar ({onlineUsers.length})</h2>
            <ul>
                {onlineUsers.map((user, idx) => (
                    <li key={idx}>
                        {user.username} - {user.onlineSince} dan beri online, sahifa: {user.currentPage}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OnlineUsers;