import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateToken } from '../services/tokenService';

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

            try {
                const valid = await validateToken(token);
                setIsAuthenticated(valid);
            } catch (err) {
                console.error('Token check error:', err);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        window.addEventListener('storage', checkToken);
        checkToken();
        return () => {
            window.removeEventListener('storage', checkToken);
        }
    }, []);

    const login = () => setIsAuthenticated(true);

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
