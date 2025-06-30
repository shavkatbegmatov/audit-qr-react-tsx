import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { validateToken } from '../services/tokenService'; // yangi import

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            const valid = await validateToken(token);
            if (!valid) {
                authService.logout();
            } else {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        checkToken();
    }, []);

    const login = () => setIsAuthenticated(true);
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    useEffect(() => {
        const onStorage = () => setIsAuthenticated(Boolean(localStorage.getItem('accessToken')));
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    if (isLoading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
