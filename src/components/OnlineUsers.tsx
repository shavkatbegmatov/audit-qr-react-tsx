// src/components/OnlineUsers.tsx
import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from '@/context/WebSocketEventContext';
import { formatDate } from '@/utils/dateUtils';

const OnlineUsers: React.FC = () => {
    const {
        onlineUsers,
        onlineCount,
        isConnected,
        error,
        requestOnlineUsers,
        clearError
    } = useWebSocketContext();

    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // Initial data request and loading state management
    useEffect(() => {
        if (isConnected && onlineUsers.length === 0 && retryCount < 3) {
            const timer = setTimeout(() => {
                requestOnlineUsers();
                setRetryCount(prev => prev + 1);
            }, 1000);

            return () => clearTimeout(timer);
        } else if (onlineUsers.length > 0 || !isConnected) {
            setIsLoading(false);
        }
    }, [isConnected, onlineUsers.length, requestOnlineUsers, retryCount]);

    // Reset retry count on successful connection
    useEffect(() => {
        if (isConnected && onlineUsers.length > 0) {
            setRetryCount(0);
            setIsLoading(false);
        }
    }, [isConnected, onlineUsers.length]);

    // Connection status indicator
    const getConnectionStatus = () => {
        if (!isConnected) return { color: 'bg-red-500', text: 'Disconnected' };
        if (isLoading) return { color: 'bg-yellow-500', text: 'Loading...' };
        return { color: 'bg-green-500', text: 'Live' };
    };

    const connectionStatus = getConnectionStatus();

    // Error handling
    if (error && !isConnected) {
        return (
            <div className="h-full flex flex-col">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 text-sm">{error}</span>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-700 text-xs"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Online Users</h3>
                    <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-yellow-600">Loading...</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 text-sm">Fetching online users...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with connection status */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Online Users
                </h3>
                <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 ${connectionStatus.color} rounded-full ${isConnected ? 'animate-pulse' : ''}`}></div>
                    <span className={`text-sm font-medium ${
                        isConnected ? 'text-green-600' : 'text-red-600'
                    }`}>
            ({onlineCount}) {connectionStatus.text}
          </span>
                </div>
            </div>

            {/* Users list */}
            <div className="flex-1 overflow-auto">
                {onlineCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm mb-1">No users online</p>
                        <p className="text-gray-400 text-xs">
                            {isConnected ? 'Waiting for connections...' : 'Connection required'}
                        </p>
                        {isConnected && (
                            <button
                                onClick={requestOnlineUsers}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                                Refresh
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {onlineUsers.map((user, index) => (
                            <div
                                key={`${user.username}-${index}`}
                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-100 group"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user.username}
                                            </p>
                                            {user.sessionCount && user.sessionCount > 1 && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.sessionCount} tabs
                        </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.currentPage || 'Unknown page'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                    <p className="text-xs text-gray-400">
                                        {formatDate(user.onlineSince, true)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with refresh button */}
            {isConnected && onlineCount > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                        onClick={requestOnlineUsers}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                    >
                        Last updated: {new Date().toLocaleTimeString()}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OnlineUsers;