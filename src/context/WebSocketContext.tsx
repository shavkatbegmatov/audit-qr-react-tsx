import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/utils/constants';
import type { AuditLog } from '@/types/LogEntry';

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

        if (clientRef.current && clientRef.current.active) {
            return;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}${API_ENDPOINTS.WS_LOGS}?access_token=${token}`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                if (!subscribedRef.current) {
                    stompClient.subscribe('/topic/online-users', (message) => {
                        const users: OnlineUser[] = JSON.parse(message.body);
                        setOnlineUsers(users);
                    });
                    stompClient.subscribe('/topic/logs', (message) => {
                        const log: AuditLog = JSON.parse(message.body);
                        setLogs((prevLogs) => [...prevLogs, log]);
                    });
                    subscribedRef.current = true;
                }

                const storedUsername = localStorage.getItem('username');
                if (storedUsername) {
                    stompClient.publish({
                        destination: '/app/update-page',
                        body: JSON.stringify({username: storedUsername, page: location.pathname}),
                    });
                }
            },
            onStompError: (frame) => {
                setError(`Xato: ${frame.body}`);
                if (clientRef.current) {
                    clientRef.current.deactivate();
                    clientRef.current = null;
                    subscribedRef.current = false;
                }
            },
            onDisconnect: () => {
                subscribedRef.current = false;
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;
    }, [isAuthenticated, location.pathname]);

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

    useEffect(() => {
        const handleTokenChange = (event: StorageEvent) => {
            if (event.key === STORAGE_KEYS.ACCESS_TOKEN || event.key === STORAGE_KEYS.REFRESH_TOKEN) {
                if (clientRef.current) {
                    clientRef.current.deactivate();
                    clientRef.current = null;
                    subscribedRef.current = false;
                }
                if (isAuthenticated) {
                    connectWebSocket();
                } else {
                    setError('Token yo\'qolgan – ulanish uzildi');
                }
            }
        };
        window.addEventListener('storage', handleTokenChange);

        const tokenCheckInterval = setInterval(() => {
            if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
                if (clientRef.current) {
                    clientRef.current.deactivate();
                    clientRef.current = null;
                    subscribedRef.current = false;
                }
                setError('Token yo\'qolgan – ulanish uzildi');
            }
        }, 5000);

        // Yangi: Tab visibility change da token tekshirish
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
                    setError('Token yo\'qolgan – ulanish uzildi');
                } else if (isAuthenticated) {
                    connectWebSocket();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('storage', handleTokenChange);
            clearInterval(tokenCheckInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, connectWebSocket]);

    const value = { onlineUsers, logs, error };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};