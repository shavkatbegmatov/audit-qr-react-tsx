// src/context/WebSocketEventContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWebSocketEvents, type WebSocketEventListeners } from '@/hooks/useWebSocketEvents';
import type { AuditLog } from '@/types/LogEntry';

interface OnlineUser {
    username: string;
    onlineSince: string;
    currentPage: string;
    sessionCount?: number;
}

interface WebSocketContextValue {
    // State
    onlineUsers: OnlineUser[];
    logs: AuditLog[];
    isConnected: boolean;
    error: string | null;

    // Actions
    requestOnlineUsers: () => void;
    sendPageUpdate: (username: string, page: string) => void;
    clearError: () => void;

    // Stats
    onlineCount: number;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within WebSocketEventProvider');
    }
    return context;
};

interface WebSocketEventProviderProps {
    children: React.ReactNode;
}

export const WebSocketEventProvider: React.FC<WebSocketEventProviderProps> = ({ children }) => {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const eventListeners: WebSocketEventListeners = {
        onConnectionEstablished: useCallback(() => {
            console.info('[WebSocket] Connection established');
            setError(null);
        }, []),

        onConnectionLost: useCallback(() => {
            console.warn('[WebSocket] Connection lost');
            setError('Connection lost - attempting to reconnect...');
            setOnlineUsers([]); // Clear online users when disconnected
        }, []),

        onOnlineUsersUpdated: useCallback((users: OnlineUser[]) => {
            console.debug('[WebSocket] Online users updated:', users?.length || 0);
            setOnlineUsers(users || []);
            setError(null); // Clear any previous errors on successful data
        }, []),

        onLogsReceived: useCallback((log: AuditLog) => {
            console.debug('[WebSocket] New log received:', log);
            setLogs(prevLogs => {
                const newLogs = [log, ...prevLogs];
                return newLogs.slice(0, 50); // Keep only last 50 logs
            });
        }, []),

        onError: useCallback((errorMessage: string) => {
            console.error('[WebSocket] Error:', errorMessage);
            setError(errorMessage);
        }, []),
    };

    const { isConnected, sendPageUpdate, requestOnlineUsers } = useWebSocketEvents(eventListeners);

    const contextValue: WebSocketContextValue = {
        // State
        onlineUsers,
        logs,
        isConnected,
        error,

        // Actions
        requestOnlineUsers,
        sendPageUpdate,
        clearError,

        // Computed
        onlineCount: onlineUsers.length,
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};