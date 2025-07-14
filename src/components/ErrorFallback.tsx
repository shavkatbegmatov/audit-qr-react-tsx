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
            style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '1rem',
            }}
        >
            Try Again
        </button>
    </div>
);

export default ErrorFallback;