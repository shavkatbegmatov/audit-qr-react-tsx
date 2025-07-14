import React from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

const AuditLogsPage: React.FC = () => {
    const { logs, error } = useWebSocket();

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Audit Logs</h1>
            {logs.length === 0 ? (
                <p className="text-gray-600 italic">Hech qanday log yo'q</p>
            ) : (
                <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <th className="border px-6 py-3 text-left font-semibold">Vaqt</th>
                        <th className="border px-6 py-3 text-left font-semibold">Foydalanuvchi</th>
                        <th className="border px-6 py-3 text-left font-semibold">Harakat</th>
                        <th className="border px-6 py-3 text-left font-semibold">Natija</th>
                        <th className="border px-6 py-3 text-left font-semibold">IP</th>
                        <th className="border px-6 py-3 text-left font-semibold">Qo'shimcha</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map((log, index) => (
                        <tr
                            key={index}
                            className={`hover:bg-gray-100 transition-colors duration-200 ${
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } ${log.outcome ? 'text-green-700' : 'text-red-700'}`}
                        >
                            <td className="border px-6 py-3">{formatTimestamp(log.timestamp)}</td>
                            <td className="border px-6 py-3 font-medium">{log.username}</td>
                            <td className="border px-6 py-3">{log.action}</td>
                            <td className="border px-6 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                                        log.outcome ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                    }`}>
                                        {log.outcome ? '✅ Muvaffaqiyatli' : '❌ Muvaffaqiyatsiz'}
                                    </span>
                            </td>
                            <td className="border px-6 py-3">{log.ipAddress}</td>
                            <td className="border px-6 py-3 italic text-gray-600">
                                {log.details || '-'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AuditLogsPage;