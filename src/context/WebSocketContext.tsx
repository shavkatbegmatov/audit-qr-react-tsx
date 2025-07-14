import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/utils/constants';
import type { AuditLog } from '@/types/LogEntry'; // LogEntry.ts dan import qiling

interface OnlineUser {
    username: string;
    onlineSince: string;
    currentPage: string;
}

interface WebSocketContextType {
    onlineUsers: OnlineUser[];
    logs: AuditLog[];
    error: string | null;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = React.useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<Client | null>(null);
    const subscribedRef = useRef<boolean>(false);

    const connectWebSocket = useCallback(() => {
        if (!isAuthenticated) {
            setError('Autentikatsiya talab qilinadi');
            return;
        }

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            setError('Token topilmadi');
            return;
        }

        if (!clientRef.current) {
            const stompClient = new Client({
                webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}${API_ENDPOINTS.WS_LOGS}?access_token=${token}`),
                connectHeaders: { Authorization: `Bearer ${token}` },
                reconnectDelay: 5000,
                onConnect: () => {
                    if (!subscribedRef.current) {
                        // Online users subscribe
                        stompClient.subscribe('/topic/online-users', (message) => {
                            const users: OnlineUser[] = JSON.parse(message.body);
                            setOnlineUsers(users);
                        });
                        // Logs subscribe
                        stompClient.subscribe('/topic/logs', (message) => {
                            const log: AuditLog = JSON.parse(message.body);
                            setLogs((prevLogs) => [...prevLogs, log]);
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
    }, [isAuthenticated]);

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                subscribedRef.current = false;
            }
        };
    }, [connectWebSocket]);

    // Sahifa o'zgarishini backendga yuborish
    useEffect(() => {
        if (clientRef.current && clientRef.current.active && subscribedRef.current) {
            const username = localStorage.getItem('username');
            if (username) {
                clientRef.current.publish({
                    destination: '/app/update-page',
                    body: JSON.stringify({ username, page: location.pathname }),
                });
            }
        }
    }, [location.pathname]);

    // Token refresh bo'lganda reconnect (storage o'zgarganda)
    useEffect(() => {
        const handleTokenChange = () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                subscribedRef.current = false;
                connectWebSocket(); // Yangi token bilan reconnect
            }
        };
        window.addEventListener('storage', handleTokenChange);
        return () => window.removeEventListener('storage', handleTokenChange);
    }, [connectWebSocket]);

    const value = { onlineUsers, logs, error };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};