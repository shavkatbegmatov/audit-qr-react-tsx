// src/components/ErrorFallback.tsx
import React from 'react';

interface ErrorFallbackProps {
    error: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => (
    <div role="alert" style={{ padding: '1rem', color: '#dc3545' }}>
        <h2>Something went wrong</h2>
        <pre>{error.message}</pre>
        <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
        >
            Try Again
        </button>
    </div>
);

export default ErrorFallback;