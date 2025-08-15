import React, { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import useAuthService from '@/services/authService';
import { useAuth } from '@/context/auth-context';
import { ROUTES } from '@/utils/constants';

interface LoginPageProps {
    initialUsername?: string;
    onLoginSuccess?: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ initialUsername = '', onLoginSuccess }) => {
    const { isAuthenticated, login: markAsLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || ROUTES.ROOT;
    const { login } = useAuthService();

    const [username, setUsername] = useState(initialUsername);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const offline = location.state?.offline;
    const logoutError = location.state?.logoutError;

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(username, password);
            localStorage.setItem('username', username);
            await markAsLoggedIn();
            if (onLoginSuccess) onLoginSuccess(username);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Sign In</h1>
                {offline && (
                    <div
                        className="text-yellow-600 bg-yellow-50 p-3 rounded-md mb-4 text-sm"
                        role="alert"
                        aria-live="assertive"
                    >
                        Logout failed due to no internet connection. Please check your network and try again.
                    </div>
                )}
                {logoutError && (
                    <div
                        className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm"
                        role="alert"
                        aria-live="assertive"
                    >
                        {logoutError}
                    </div>
                )}
                {error && (
                    <div
                        className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm"
                        role="alert"
                        aria-live="assertive"
                    >
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                            disabled={isLoading}
                            aria-label="Enter your username"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                            disabled={isLoading}
                            aria-label="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        disabled={isLoading}
                        aria-label={isLoading ? 'Logging in' : 'Sign in'}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;