// src/context/WebSocketProvider.ts
import React from 'react';
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

export const WebSocketContext = React.createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = React.useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
};