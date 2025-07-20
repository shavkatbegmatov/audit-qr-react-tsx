// src/hooks/useCreateModal.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Column } from '@/components/table/useTable';

// Hook uchun propslar interfeysi o'zgarishsiz
interface UseCreateModalProps<T> {
    onSubmit: (item: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
    visible: boolean;
}

export function useCreateModal<T extends { id: number }>({ onSubmit, onClose, columns, visible }: UseCreateModalProps<T>) {
    // State'lar
    const [formData, setFormData] = useState<Partial<T>>({});
    // 1-QADAM: Formaning boshlang'ich holatini saqlash uchun state qo'shamiz
    const [initialData, setInitialData] = useState<Partial<T>>({});
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasStatusColumn = useMemo(() => columns.some(col => col.key === 'status'), [columns]);

    const initializeForm = useCallback(() => {
        const defaultData: Partial<T> = {};
        if (hasStatusColumn) {
            defaultData['status' as keyof T] = 'ACTIVE' as any;
        }
        setFormData(defaultData);
        // 2-QADAM: Boshlang'ich holatni ham shu yerda o'rnatamiz
        setInitialData(defaultData);
        setErrorMessage(null);
    }, [hasStatusColumn]);

    // Bu effekt o'zgarishsiz qoladi
    useEffect(() => {
        if (visible) {
            initializeForm();
        }
    }, [visible, initializeForm]);

    // Bu funksiya o'zgarishsiz qoladi
    const handleChange = useCallback((key: keyof T, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    // Bu funksiya o'zgarishsiz qoladi
    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await onSubmit(formData);
            toast.success('Muvaffaqiyatli yaratildi!');
            onClose();
        } catch (error: any) {
            const errMsg = error.response?.data?.error?.message || 'Xatolik yuz berdi. Iltimos, qayta urunib ko\'ring.';
            setErrorMessage(errMsg);
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit, onClose]);

    // 3-QADAM: O'zgarishni tekshirish mantiqini to'g'rilaymiz
    const handleClose = useCallback(() => {
        // Joriy ma'lumotlarni boshlang'ich ma'lumotlar bilan solishtiramiz
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

        if (hasChanges && !isSubmitting) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    }, [formData, initialData, isSubmitting, onClose]); // dependencylarga initialData qo'shildi

    // Qolgan funksiyalar va effektlar o'zgarishsiz
    const confirmClose = useCallback(() => {
        setShowConfirmClose(false);
        onClose();
    }, [onClose]);

    const cancelClose = useCallback(() => {
        setShowConfirmClose(false);
    }, []);

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