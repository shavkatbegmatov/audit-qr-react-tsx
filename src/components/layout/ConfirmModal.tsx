// src/components/ConfirmModal.tsx
import React, { useEffect, useRef } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
    title?: string;
    message?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
   isOpen,
   onConfirm,
   onCancel,
   isLoading,
   title = 'Confirm Action',
   message = 'Are you sure you want to proceed?',
}) => {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            if (event.key === 'Escape') {
                onCancel();
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!isLoading && confirmButtonRef.current) {
                    confirmButtonRef.current.focus();
                    onConfirm();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            confirmButtonRef.current?.focus();
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel, onConfirm, isLoading]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
            style={{ opacity: isOpen ? 1 : 0 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md transform transition-transform duration-300"
                style={{ transform: isOpen ? 'translateY(0)' : 'translateY(-20px)' }}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer"
                        aria-label="Cancel action"
                    >
                        Cancel
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200 cursor-pointer"
                        aria-label="Confirm action"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;