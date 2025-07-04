import React from 'react';

// Define props interface for type safety
interface AppErrorFallbackProps {
    error: Error; // Error object passed by ErrorBoundary
}

// AppErrorFallback component
const AppErrorFallback: React.FC<AppErrorFallbackProps> = ({ error }) => {
    // Handle refresh on button click
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div
            role="alert"
            style={{
                padding: '1.5rem',
                backgroundColor: '#fff3f3',
                color: '#dc3545',
                borderRadius: '4px',
                maxWidth: '500px',
                margin: '2rem auto',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
        >
            <h2 style={{ marginBottom: '1rem' }}>Application Error</h2>
            <p>Something went wrong while rendering the app.</p>
            <pre
                style={{
                    margin: '1rem 0',
                    padding: '0.5rem',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                }}
            >
        {error.message}
      </pre>
            <button
                onClick={handleRetry}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                }}
                aria-label="Retry loading the application"
            >
                Try Again
            </button>
        </div>
    );
};

export default AppErrorFallback;