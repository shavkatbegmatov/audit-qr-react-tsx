// src/hooks/useModalCloseHandlers.ts
import { useEffect, useCallback } from 'react';

interface UseModalCloseHandlersProps {
    setShowConfirmClose: (value: boolean) => void;
    onClose: () => void;
    visible: boolean;
    handleClose: () => void;
}

export function useModalCloseHandlers({ setShowConfirmClose, onClose, visible, handleClose }: UseModalCloseHandlersProps) {
    const confirmClose = useCallback(() => {
        setShowConfirmClose(false);
        onClose();
    }, [setShowConfirmClose, onClose]);

    const cancelClose = useCallback(() => {
        setShowConfirmClose(false);
    }, [setShowConfirmClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        if (visible) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, handleClose]);

    return { confirmClose, cancelClose };
}