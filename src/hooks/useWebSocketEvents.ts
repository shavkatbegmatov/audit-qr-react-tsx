// src/hooks/useWebSocketEvents.ts
import { useCallback, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/utils/constants';

export type WebSocketEventType =
    | 'connection-established'
    | 'connection-lost'
    | 'online-users-updated'
    | 'logs-received'
    | 'error-occurred';

export interface WebSocketEvent {
    type: WebSocketEventType;
    data?: any;
    timestamp: Date;
    error?: string;
}

export interface WebSocketEventListeners {
    onConnectionEstablished?: () => void;
    onConnectionLost?: () => void;
    onOnlineUsersUpdated?: (users: any[]) => void;
    onLogsReceived?: (log: any) => void;
    onError?: (error: string) => void;
}

export const useWebSocketEvents = (listeners: WebSocketEventListeners = {}) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const clientRef = useRef<Client | null>(null);
    const listenersRef = useRef(listeners);
    const mountedRef = useRef(true);

    // Update listeners when they change
    useEffect(() => {
        listenersRef.current = listeners;
    }, [listeners]);

    // Event dispatcher
    const dispatchEvent = useCallback((type: WebSocketEventType, data?: any, error?: string) => {
        if (!mountedRef.current) return;

        const event: WebSocketEvent = {
            type,
            data,
            timestamp: new Date(),
            error
        };

        console.debug('[WebSocket Event]', event);

        // Call appropriate listener
        switch (type) {
            case 'connection-established':
                listenersRef.current.onConnectionEstablished?.();
                break;
            case 'connection-lost':
                listenersRef.current.onConnectionLost?.();
                break;
            case 'online-users-updated':
                listenersRef.current.onOnlineUsersUpdated?.(data);
                break;
            case 'logs-received':
                listenersRef.current.onLogsReceived?.(data);
                break;
            case 'error-occurred':
                listenersRef.current.onError?.(error || 'Unknown error');
                break;
        }
    }, []);

    const connectWebSocket = useCallback(() => {
        if (!isAuthenticated || !mountedRef.current) return;

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            dispatchEvent('error-occurred', null, 'No authentication token available');
            return;
        }

        // Cleanup existing connection
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}${API_ENDPOINTS.WS_LOGS}?access_token=${token}`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 10000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.debug('[WebSocket Debug]', str);
                }
            },
            onConnect: () => {
                if (!mountedRef.current) return;

                dispatchEvent('connection-established');

                try {
                    // Subscribe to online users updates
                    stompClient.subscribe('/topic/online-users', (message) => {
                        if (!mountedRef.current) return;

                        try {
                            const users = JSON.parse(message.body);
                            dispatchEvent('online-users-updated', users);
                        } catch (parseError) {
                            console.error('[WebSocket] Failed to parse online users:', parseError);
                            dispatchEvent('error-occurred', null, 'Failed to parse online users data');
                        }
                    });

                    // Subscribe to logs
                    stompClient.subscribe('/topic/logs', (message) => {
                        if (!mountedRef.current) return;

                        try {
                            const log = JSON.parse(message.body);
                            dispatchEvent('logs-received', log);
                        } catch (parseError) {
                            console.error('[WebSocket] Failed to parse log:', parseError);
                            dispatchEvent('error-occurred', null, 'Failed to parse log data');
                        }
                    });

                    // Send initial page update
                    const username = localStorage.getItem('username');
                    if (username) {
                        sendPageUpdate(username, location.pathname);
                    }

                } catch (subscriptionError) {
                    console.error('[WebSocket] Subscription error:', subscriptionError);
                    dispatchEvent('error-occurred', null, 'Failed to subscribe to channels');
                }
            },
            onDisconnect: () => {
                if (mountedRef.current) {
                    dispatchEvent('connection-lost');
                }
            },
            onStompError: (frame) => {
                console.error('[WebSocket] STOMP error:', frame.body);
                dispatchEvent('error-occurred', null, `Connection error: ${frame.body}`);
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;
    }, [isAuthenticated, location.pathname, dispatchEvent]);

    const sendPageUpdate = useCallback((username: string, page: string) => {
        if (!clientRef.current?.active || !mountedRef.current) return;

        try {
            clientRef.current.publish({
                destination: '/app/update-page',
                body: JSON.stringify({ username, page }),
            });
        } catch (error) {
            console.error('[WebSocket] Failed to send page update:', error);
            dispatchEvent('error-occurred', null, 'Failed to send page update');
        }
    }, [dispatchEvent]);

    const requestOnlineUsers = useCallback(() => {
        if (!clientRef.current?.active || !mountedRef.current) return;

        try {
            clientRef.current.publish({
                destination: '/app/get-online-users',
                body: JSON.stringify({}),
            });
        } catch (error) {
            console.error('[WebSocket] Failed to request online users:', error);
            dispatchEvent('error-occurred', null, 'Failed to request online users');
        }
    }, [dispatchEvent]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }
    }, []);

    // Main connection effect
    useEffect(() => {
        mountedRef.current = true;

        if (isAuthenticated) {
            connectWebSocket();
        } else {
            disconnect();
        }

        return () => {
            mountedRef.current = false;
            disconnect();
        };
    }, [isAuthenticated, connectWebSocket, disconnect]);

    // Page change effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (clientRef.current?.active && mountedRef.current) {
                const username = localStorage.getItem('username');
                if (username) {
                    sendPageUpdate(username, location.pathname);
                }
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [location.pathname, sendPageUpdate]);

    return {
        isConnected: clientRef.current?.active ?? false,
        sendPageUpdate,
        requestOnlineUsers,
        disconnect
    };
};