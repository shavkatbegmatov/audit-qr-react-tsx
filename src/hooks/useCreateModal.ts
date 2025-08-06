// src/hooks/useCreateModal.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Column } from '@/components/table/useTable';
import { handleApiError } from './useErrorHandler';
import { useModalCloseHandlers } from './useModalCloseHandlers';

interface UseCreateModalProps<T> {
    onSubmit: (item: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
    visible: boolean;
}

export function useCreateModal<T extends { id: number; parentId?: number | null }>({ onSubmit, onClose, columns, visible }: UseCreateModalProps<T>) {
    const [formData, setFormData] = useState<Partial<T>>({});
    const [initialData, setInitialData] = useState<Partial<T>>({});
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasStatusColumn = useMemo(() => columns.some(col => col.key === 'status'), [columns]);

    const initializeForm = useCallback(() => {
        const defaultData: Partial<T> = {};
        if (hasStatusColumn) {
            (defaultData as Record<string, unknown>)['status'] = 'ACTIVE';
        }
        defaultData.parentId = null;
        setFormData(defaultData);
        setInitialData(defaultData);
        setErrorMessage(null);
    }, [hasStatusColumn]);

    useEffect(() => {
        if (visible) {
            initializeForm();
        }
    }, [visible, initializeForm]);

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
            toast.success('Muvaffaqiyatli yaratildi!');
            onClose();
        } catch (error) {
            const errMsg = handleApiError(error);
            setErrorMessage(errMsg);
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit, onClose]);

    const handleClose = useCallback(() => {
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

        if (hasChanges && !isSubmitting) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    }, [formData, initialData, isSubmitting, onClose]);

    const { confirmClose, cancelClose } = useModalCloseHandlers({
        setShowConfirmClose,
        onClose,
        visible,
        handleClose
    });

    return {
        formData,
        errorMessage,
        isSubmitting,
        showConfirmClose,
        handleChange,
        handleSubmit,
        handleClose,
        confirmClose,
        cancelClose,
    };
}