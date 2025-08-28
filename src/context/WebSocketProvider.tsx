// src/context/WebSocketProvider.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/utils/constants';
import type { AuditLog } from '@/types/LogEntry';
import api from '@/services/api';
import { WebSocketContext } from './WebSocketContext';

interface WebSocketProviderProps {
    children: React.ReactNode;
}

interface OnlineUser {
    username: string;
    onlineSince: string;
    currentPage: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<Client | null>(null);
    const reconnectAttemptRef = useRef<number>(0);
    const maxReconnectAttempts = 5; // Qayta ulanish urinishlarini biroz ko'paytirish
    const mountedRef = useRef<boolean>(true);

    const fetchInitialLogs = useCallback(async () => {
        if (!isAuthenticated || !mountedRef.current) return;
        try {
            const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (!token) return;

            const response = await api.get('audit-logs', {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 0, size: 50, sort: 'timestamp,desc' },
            });

            if (response.data.success && Array.isArray(response.data.data.content) && mountedRef.current) {
                setLogs(response.data.data.content);
            }
        } catch (err) {
            console.error('[Dev] Loglarni yuklashda xato:', err);
            if ((err as any)?.response?.status === 401 && mountedRef.current) {
                setError('Sessiya tugadi - qayta kiring');
            }
        }
    }, [isAuthenticated]);

    // IZOH: Ulanish va obuna mantig'ini alohida funksiyaga ajratdik, bu kodni toza saqlaydi.
    const subscribeToTopics = (client: Client) => {
        // Online users uchun obuna
        client.subscribe('/topic/online-users', (message) => {
            if (!mountedRef.current) return;
            try {
                const users: OnlineUser[] = JSON.parse(message.body);
                setOnlineUsers(users);
            } catch (parseError) {
                console.error('[Dev] Online users parse error:', parseError);
            }
        });

        // Loglar uchun obuna
        client.subscribe('/topic/logs', (message) => {
            if (!mountedRef.current) return;
            try {
                const log: AuditLog = JSON.parse(message.body);
                setLogs((prevLogs) => [log, ...prevLogs.slice(0, 49)]);
            } catch (parseError) {
                console.error('[Dev] Logs parse error:', parseError);
            }
        });

        // IZOH: Ulanish o'rnatilgach, back-end'dan joriy online foydalanuvchilar ro'yxatini so'raymiz.
        // Bu foydalanuvchi birinchi marta kirganda to'liq ro'yxatni olishini kafolatlaydi.
        client.publish({ destination: '/app/get-online-users' });

        // IZOH: Shuningdek, o'zining joriy sahifasi haqida darhol xabar beradi.
        // Bu uning o'zini ham ro'yxatda to'g'ri ko'rinishini ta'minlaydi.
        const username = localStorage.getItem('username');
        if (username) {
            client.publish({
                destination: '/app/update-page',
                body: JSON.stringify({ username, page: location.pathname }),
            });
        }
    };

    const connectWebSocket = useCallback(() => {
        if (!isAuthenticated || (clientRef.current && clientRef.current.active)) {
            return;
        }

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[Dev] Token mavjud emas - WebSocket ulanishi mumkin emas');
            }
            return;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}${API_ENDPOINTS.WS_LOGS}`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                if (!mountedRef.current) return;
                console.log('[Dev] WebSocket muvaffaqiyatli ulandi');
                setError(null);
                reconnectAttemptRef.current = 0;
                subscribeToTopics(stompClient);
            },
            onStompError: (frame) => {
                if (!mountedRef.current) return;
                console.error('[Dev] WebSocket STOMP xatosi:', frame.body);
                setError('Ulanishda muammo yuz berdi. Qayta urinilmoqda...');

                reconnectAttemptRef.current++;
                if (reconnectAttemptRef.current >= maxReconnectAttempts) {
                    setError('Ulanishda jiddiy muammo. Iltimos, sahifani yangilang.');
                    stompClient.deactivate();
                }
            },
            onDisconnect: () => {
                if (!mountedRef.current) return;
                console.log('[Dev] WebSocket uzildi');
                setOnlineUsers([]); // Ulanish uzilganda ro'yxatni tozalash
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;
    }, [isAuthenticated, location.pathname]);

    // Component mount/unmount holatini kuzatish
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Asosiy ulanish effekti
    useEffect(() => {
        if (isAuthenticated) {
            fetchInitialLogs();
            connectWebSocket();
        } else {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            if (mountedRef.current) {
                setOnlineUsers([]);
                setLogs([]);
                setError(null);
            }
        }

        return () => {
            if (clientRef.current?.active) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [isAuthenticated, connectWebSocket, fetchInitialLogs]);

    // Sahifa o'zgarishini kuzatish effekti
    useEffect(() => {
        // IZOH: Sahifa o'zgarishi endi faqat ulanish aktiv bo'lganda yuboriladi.
        if (clientRef.current?.active && isAuthenticated) {
            const username = localStorage.getItem('username');
            if (username) {
                clientRef.current.publish({
                    destination: '/app/update-page',
                    body: JSON.stringify({ username, page: location.pathname }),
                });
            }
        }
    }, [location.pathname, isAuthenticated]); // isAuthenticated'ni dependency'ga qo'shdik

    const value = { onlineUsers, logs, error };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};