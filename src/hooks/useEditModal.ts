// src/hooks/useEditModal.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { handleApiError } from './useErrorHandler';
import { useModalCloseHandlers } from './useModalCloseHandlers';

interface UseEditModalProps<T> {
    visible: boolean;
    item: Partial<T> | null;
    onSubmit: (updatedItem: Partial<T>) => Promise<void>;
    onClose: () => void;
}

export function useEditModal<T extends { id: number; parentId?: number | null }>({ visible, item, onSubmit, onClose }: UseEditModalProps<T>) {
    const [formData, setFormData] = useState<Partial<T>>({});
    const [initialData, setInitialData] = useState<Partial<T>>({});
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (visible && item) {
            setFormData(item);
            setInitialData(item);
            setErrorMessage(null);
        }
    }, [visible, item]);

    const handleChange = useCallback((key: keyof T, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: key === 'parentId' ? (value ? parseInt(value, 10) : null) : value
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await onSubmit(formData);
            toast.success("Muvaffaqiyatli saqlandi!");
            onClose();
        } catch (error) {
            const errMsg = handleApiError(error);
            setErrorMessage(errMsg);
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit, onClose]);

    const hasChanges = useCallback(() => {
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const handleClose = useCallback(() => {
        if (hasChanges()) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    }, [hasChanges, onClose]);

    const { confirmClose, cancelClose } = useModalCloseHandlers({
        setShowConfirmClose,
        onClose,
        visible,
        handleClose
    });

    return {
        formData,
        isSubmitting,
        errorMessage,
        showConfirmClose,
        handleChange,
        handleSubmit,
        handleClose,
        confirmClose,
        cancelClose,
    };
}