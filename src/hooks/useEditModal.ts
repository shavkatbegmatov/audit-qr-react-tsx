// src/hooks/useEditModal.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast'; // Xabar berish uchun

// Hook qabul qiladigan props'lar uchun interfeys
interface UseEditModalProps<T> {
    visible: boolean;
    item: Partial<T> | null;
    onSubmit: (updatedItem: Partial<T>) => Promise<void>;
    onClose: () => void;
}

// Edit Modal uchun barcha mantiqni o'zida saqlovchi custom hook
export function useEditModal<T extends { id: number }>({ visible, item, onSubmit, onClose }: UseEditModalProps<T>) {
    // State'lar
    const [formData, setFormData] = useState<Partial<T>>({});
    const [initialData, setInitialData] = useState<Partial<T>>({});
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Modal ochilganda formani to'ldirish uchun effekt
    useEffect(() => {
        if (visible && item) {
            setFormData(item);
            setInitialData(item);
            setErrorMessage(null); // Xatolikni tozalash
        }
    }, [visible, item]);

    // Maydon o'zgarishini boshqarish
    const handleChange = useCallback((key: keyof T, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    // Formani yuborish (saqlash)
    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await onSubmit(formData);
            toast.success("Muvaffaqiyatli saqlandi!");
            onClose(); // Muvaffaqiyatli bo'lsa, oynani yopish
        } catch (error: any) {
            const errMsg = error.response?.data?.error?.message || 'Saqlashda xatolik yuz berdi.';
            setErrorMessage(errMsg);
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit, onClose]);

    // O'zgarishlar borligini tekshirish
    const hasChanges = useCallback(() => {
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    // Modalni yopishni so'rash
    const handleClose = useCallback(() => {
        if (hasChanges()) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    }, [hasChanges, onClose]);

    // Yopishni tasdiqlash
    const confirmClose = useCallback(() => {
        setShowConfirmClose(false);
        onClose();
    }, [onClose]);

    // Yopishni bekor qilish
    const cancelClose = useCallback(() => {
        setShowConfirmClose(false);
    }, []);

    // ESC tugmasini eshitish
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

    // Hook o'zidan UI uchun kerakli hamma narsani qaytaradi
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