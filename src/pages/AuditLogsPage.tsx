import React, { useEffect, useState } from 'react';
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
    const [client, setClient] = useState<Client | null>(null);
    const [error, setError] = useState<string | null>(null);

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

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_BASE_API_URL}/ws-logs?access_token=${token}`),
            connectHeaders: { Authorization: `Bearer ${token}` }, // JWT token
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe('/topic/logs', (message) => {
                    const log: AuditLog = JSON.parse(message.body);
                    setLogs((prevLogs) => [...prevLogs, log]);
                });
            },
            onStompError: (frame) => {
                setError(`Xato: ${frame.body}`);
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            if (client) client.deactivate();
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