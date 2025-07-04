import React from 'react';

const LoadingFallback: React.FC = () => (
    <div aria-live="polite" style={{ padding: '1rem', textAlign: 'center' }}>
        Loading...
    </div>
);

export default LoadingFallback;