import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext'; // AuthContext'dan token olish uchun

interface AuditLog {
    userId: number | null;
    username: string;
    action: string;
    timestamp: string; // OffsetDateTime string formatida
    ipAddress: string;
    outcome: boolean;
    details: string | null;
}

const AuditLogsPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
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

        return () => {
            // Cleanup: Component unmount bo'lganda client ni deactivate qiling
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                subscribedRef.current = false;
            }
        };
    }, [isAuthenticated]);

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
            <ul className="space-y-4">
                {logs.map((log, index) => (
                    <li key={index} className="border-b pb-2">
                        <p><strong>Vaqt:</strong> {log.timestamp}</p>
                        <p><strong>Foydalanuvchi:</strong> {log.username}</p>
                        <p><strong>Harakat:</strong> {log.action}</p>
                        <p><strong>Natija:</strong> {log.outcome ? 'Muvaffaqiyatli' : 'Muvaffaqiyatsiz'}</p>
                        <p><strong>IP:</strong> {log.ipAddress}</p>
                        {log.details && <p><strong>Qo'shimcha:</strong> {log.details}</p>}
                    </li>
                ))}
            </ul>
            {logs.length === 0 && <p>Hech qanday log yo'q</p>}
        </div>
    );
};

export default AuditLogsPage;