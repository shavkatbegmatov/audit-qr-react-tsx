// src/components/OnlineUsers.tsx
import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { formatDate } from '../utils/dateUtils';

const OnlineUsers: React.FC = () => {
    const { onlineUsers, error } = useWebSocket();

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Online Foydalanuvchilar ({onlineUsers.length})</h1>
            {onlineUsers.length === 0 ? (
                <p className="text-gray-600 italic">Hech qanday online foydalanuvchi yo'q</p>
            ) : (
                <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                        <th className="border px-6 py-3 text-left font-semibold">Foydalanuvchi</th>
                        <th className="border px-6 py-3 text-left font-semibold">Online Bo'lgan Vaqt</th>
                        <th className="border px-6 py-3 text-left font-semibold">Joriy Sahifa</th>
                    </tr>
                    </thead>
                    <tbody>
                    {onlineUsers.map((user, index) => (
                        <tr
                            key={index}
                            className={`hover:bg-gray-100 transition-colors duration-200 ${
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } text-green-700`}
                        >
                            <td className="border px-6 py-3 font-medium">{user.username}</td>
                            <td className="border px-6 py-3">{formatDate(user.onlineSince, true)}</td>
                            <td className="border px-6 py-3">{user.currentPage}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OnlineUsers;