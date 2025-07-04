import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/ErrorFallback'; // Import the new component

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.warn('⚠️ Unhandled Promise Rejection:', event.reason);
    event.preventDefault();
});

// Render the app with error boundary and strict mode
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);