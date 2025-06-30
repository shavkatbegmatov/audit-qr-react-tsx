import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { isAuthenticated, login: markAsLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Если уже залогинились — сразу переходим
    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await authService.login(username, password);
            markAsLoggedIn();
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="p-6 bg-white shadow-md rounded w-96">
                <h1 className="text-2xl mb-4 text-center">Login</h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <input
                    type="text"
                    autoComplete="username"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="border p-2 w-full rounded mb-4"
                    required
                />
                <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border p-2 w-full rounded mb-4"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">
                    Login
                </button>
            </form>
        </div>
    );
}
