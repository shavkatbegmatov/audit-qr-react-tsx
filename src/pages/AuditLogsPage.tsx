import React, { useState, useMemo } from 'react';
import { useWebSocketContext } from '@/context/WebSocketEventContext';
import {
    FaSearch,
    FaDownload,
    FaCheck,
    FaTimes,
    FaUser,
    FaClock,
    FaNetworkWired,
    FaExclamationCircle,
    FaCheckCircle,
    FaWifi,
} from 'react-icons/fa';
import { IoReload } from 'react-icons/io5'; // FaRefresh o'rniga
import { BsWifiOff } from 'react-icons/bs';   // FaWifiSlash o'rniga

const AuditLogsPage: React.FC = () => {
    const { logs, error, isConnected } = useWebSocketContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 20;

    // Filter and search logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = !searchTerm ||
                log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress.includes(searchTerm) ||
                (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesOutcome = outcomeFilter === 'all' ||
                (outcomeFilter === 'success' && log.outcome) ||
                (outcomeFilter === 'failed' && !log.outcome);

            return matchesSearch && matchesOutcome;
        });
    }, [logs, searchTerm, outcomeFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const currentLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        return filteredLogs.slice(startIndex, startIndex + logsPerPage);
    }, [filteredLogs, currentPage, logsPerPage]);

    // Statistics
    const stats = useMemo(() => {
        const total = logs.length;
        const successful = logs.filter(log => log.outcome).length;
        const failed = total - successful;
        const uniqueUsers = new Set(logs.map(log => log.username)).size;

        return { total, successful, failed, uniqueUsers };
    }, [logs]);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('uz-UZ'),
            time: date.toLocaleTimeString('uz-UZ'),
            relative: getRelativeTime(date)
        };
    };

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Hozir';
        if (diffInMinutes < 60) return `${diffInMinutes} daqiqa oldin`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} soat oldin`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} kun oldin`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setOutcomeFilter('all');
        setCurrentPage(1);
    };

    const exportLogs = () => {
        const csvContent = [
            ['Vaqt', 'Foydalanuvchi', 'Harakat', 'Natija', 'IP Address', "Qo'shimcha"],
            ...filteredLogs.map(log => [
                formatTimestamp(log.timestamp).date + ' ' + formatTimestamp(log.timestamp).time,
                log.username,
                log.action,
                log.outcome ? 'Muvaffaqiyatli' : 'Muvaffaqiyatsiz',
                log.ipAddress,
                log.details || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center">
                            <FaExclamationCircle className="w-6 h-6 text-red-500 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-900">Connection Error</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                            <p className="mt-1 text-gray-600">System activity monitoring and security audit trail</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isConnected ? (
                                <div className="flex items-center text-green-600">
                                    <FaWifi className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">Live</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <BsWifiOff className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">Offline</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaClock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Events</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaCheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Successful</p>
                                <p className="text-2xl font-bold text-green-700">{stats.successful}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <FaExclamationCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FaUser className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                                <p className="text-2xl font-bold text-purple-700">{stats.uniqueUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                {/* Search */}
                                <div className="relative flex-1 max-w-md">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Outcome Filter */}
                                <select
                                    value={outcomeFilter}
                                    onChange={(e) => setOutcomeFilter(e.target.value as 'all' | 'success' | 'failed')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Results</option>
                                    <option value="success">Successful</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <IoReload className="w-4 h-4" />
                                    Clear
                                </button>
                                <button
                                    onClick={exportLogs}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <FaDownload className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {currentLogs.length === 0 ? (
                        <div className="p-12 text-center">
                            <FaClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                            <p className="text-gray-500">
                                {logs.length === 0 ? 'Waiting for audit events...' : 'Try adjusting your search criteria'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentLogs.map((log, index) => {
                                        const timeData = formatTimestamp(log.timestamp);
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{timeData.time}</div>
                                                    <div className="text-xs text-gray-500">{timeData.date}</div>
                                                    <div className="text-xs text-blue-600">{timeData.relative}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <FaUser className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">{log.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{log.action}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                log.outcome
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {log.outcome ? (
                                  <FaCheck className="w-3 h-3 mr-1" />
                              ) : (
                                  <FaTimes className="w-3 h-3 mr-1" />
                              )}
                                {log.outcome ? 'Success' : 'Failed'}
                            </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <FaNetworkWired className="w-4 h-4 text-gray-400 mr-2" />
                                                        {log.ipAddress}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                                                        {log.details || '-'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length} results
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                            >
                                                Previous
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page =>
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    Math.abs(page - currentPage) <= 1
                                                )
                                                .map((page, index, array) => (
                                                    <React.Fragment key={page}>
                                                        {index > 0 && array[index - 1] < page - 1 && (
                                                            <span className="px-3 py-1 text-sm text-gray-500">...</span>
                                                        )}
                                                        <button
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-1 text-sm border rounded-md ${
                                                                currentPage === page
                                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                                    : 'border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                ))
                                            }
                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;