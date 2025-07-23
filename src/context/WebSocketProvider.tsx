// src/context/WebSocketProvider.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/utils/constants';
import type { AuditLog } from '@/types/LogEntry';
import api from '@/services/api';
import { WebSocketContext } from './WebSocketContext'; // Import from new file

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [onlineUsers, setOnlineUsers] = useState<{ username: string; onlineSince: string; currentPage: string; }[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<Client | null>(null);
    const subscribedRef = useRef<boolean>(false);

    const fetchInitialLogs = useCallback(async () => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            setError('Token topilmadi');
            return;
        }

        try {
            const response = await api.get('/api/v1/audit-logs', { // Updated to match backend path
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: 0,
                    size: 50,
                    sort: 'timestamp,desc',
                },
            });

            if (response.data.success && Array.isArray(response.data.data.content)) {
                setLogs(response.data.data.content);
            } else {
                console.warn('Initial logs fetch failed: invalid response');
                setError('Loglarni yuklashda xato: Noto‘g‘ri javob formati');
            }
        } catch (err) {
            console.error('Failed to fetch initial logs:', err);
            setError('Initial loglarni yuklashda xato: ' + (err as Error).message);
        }
    }, [isAuthenticated]);

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

        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            subscribedRef.current = false;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}${API_ENDPOINTS.WS_LOGS}?access_token=${token}`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('WebSocket ulandi');
                subscribedRef.current = false;
                stompClient.subscribe('/topic/online-users', (message) => {
                    const users: { username: string; onlineSince: string; currentPage: string; }[] = JSON.parse(message.body);
                    console.log('Online users received:', users);
                    setOnlineUsers(users);
                });
                stompClient.subscribe('/topic/logs', (message) => {
                    const log: AuditLog = JSON.parse(message.body);
                    setLogs((prevLogs) => [...prevLogs, log]);
                });
                subscribedRef.current = true;

                const storedUsername = localStorage.getItem('username');
                if (storedUsername) {
                    stompClient.publish({
                        destination: '/app/update-page',
                        body: JSON.stringify({ username: storedUsername, page: location.pathname }),
                    });
                    console.log('Update page published after connect:', location.pathname);
                }
            },
            onStompError: (frame) => {
                setError(`Xato: ${frame.body}`);
                console.error('WebSocket error:', frame.body);
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
        if (isAuthenticated) {
            fetchInitialLogs();
            connectWebSocket();
        } else if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            subscribedRef.current = false;
            setOnlineUsers([]);
            setLogs([]);
            setError(null);
        }

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                subscribedRef.current = false;
            }
        };
    }, [isAuthenticated, connectWebSocket, fetchInitialLogs]);

    useEffect(() => {
        if (clientRef.current && clientRef.current.active && subscribedRef.current) {
            const username = localStorage.getItem('username');
            if (username) {
                clientRef.current.publish({
                    destination: '/app/update-page',
                    body: JSON.stringify({ username, page: location.pathname }),
                });
                console.log('Page changed, update published:', location.pathname);
            }
        } else {
            connectWebSocket();
        }
    }, [location.pathname, connectWebSocket]);

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
                    setError('Token yo‘qolgan – ulanish uzildi');
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
                setError('Token yo‘qolgan – ulanish uzildi');
            }
        }, 5000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
                    setError('Token yo‘qolgan – ulanish uzildi');
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