// src/components/table/DynamicForm.tsx
import { useState, useEffect } from 'react';
import type { Column } from './useTable';
import { useParentOptions } from '@/hooks/useParentOptions';

// Komponent qabul qiladigan props'lar
interface DynamicFormProps<T extends { id?: number; parentId?: number | null }> {
    columns: Column<T>[];
    formData: Partial<T>;
    handleChange: (key: keyof T, value: any) => void;
    isSubmitting: boolean;
    parentApiUrl?: string;
    grandParentApiUrl?: string;
    isEditMode: boolean; // Tahrirlash rejimida ekanligini bildiradi
}

export default function DynamicForm<T extends { id?: number; parentId?: number | null }>({
                                                                                             columns,
                                                                                             formData,
                                                                                             handleChange,
                                                                                             isSubmitting,
                                                                                             parentApiUrl,
                                                                                             grandParentApiUrl,
                                                                                             isEditMode,
                                                                                         }: DynamicFormProps<T>) {
    // --- Ota-ona elementlar (Parent/Grandparent) logikasi ---
    const grandOptions = useParentOptions(grandParentApiUrl);
    const parentOptionsAll = useParentOptions(parentApiUrl);
    const [selectedGrand, setSelectedGrand] = useState('');
    const selectedParent = String(formData.parentId ?? '');

    useEffect(() => {
        // Tahrirlash rejimida ota-ona elementlarni avtomatik tanlash
        if (isEditMode && parentOptionsAll.length > 0 && grandParentApiUrl && formData.parentId) {
            const currentParent = parentOptionsAll.find(opt => opt.id === formData.parentId);
            if (currentParent) {
                setSelectedGrand(String(currentParent.parentId ?? ''));
            }
        }
    }, [isEditMode, formData.parentId, parentOptionsAll, grandParentApiUrl]);

    const filteredParentOptions = selectedGrand
        ? parentOptionsAll.filter(opt => opt.parentId === parseInt(selectedGrand))
        : parentOptionsAll;

    // --- Formada ko'rsatiladigan ustunlarni filtrlash ---
    const excludedKeys = ['id', 'actions', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];
    // Agar ota-ona elementlar uchun alohida select bo'lsa, 'parentId' ni ham filtrlaymiz
    if (parentApiUrl || grandParentApiUrl) {
        excludedKeys.push('parentId');
    }
    const formColumns = columns.filter(col => !excludedKeys.includes(String((col as any).key)));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {/* ID (Tahrirlash rejimida ko'rsatiladi) */}
            {isEditMode && (
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">ID</label>
                    <input
                        type="text"
                        className="border border-gray-300 p-3 w-full rounded-lg bg-gray-100 cursor-not-allowed"
                        value={String(formData.id ?? 'N/A')}
                        disabled
                    />
                </div>
            )}

            {/* Ota-ona elementlarni tanlash logikasi */}
            {grandParentApiUrl && (
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Ota Element (1-daraja)</label>
                    <select
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={selectedGrand}
                        onChange={e => {
                            setSelectedGrand(e.target.value);
                            // Agar ota element o'zgarsa va joriy tanlangan bola unga tegishli bo'lmasa, bolani tozalash
                            if (e.target.value && selectedParent && !filteredParentOptions.some(opt => opt.id === parseInt(selectedParent))) {
                                handleChange('parentId' as keyof T, '');
                            }
                        }}
                        disabled={isSubmitting}
                    >
                        <option value="">Tanlang...</option>
                        {grandOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                </div>
            )}
            {parentApiUrl && (
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Ota Element</label>
                    <select
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={selectedParent}
                        onChange={e => handleChange('parentId' as keyof T, e.target.value)}
                        disabled={isSubmitting}
                    >
                        <option value="">Hech biri</option>
                        {filteredParentOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                </div>
            )}

            {/* Barcha qolgan ustunlar uchun forma maydonlarini avtomatik yaratish */}
            {formColumns.map(col => (
                <div key={String((col as any).key)} className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">{(col as any).label}</label>
                    {(col as any).key === 'status' ? (
                        <select
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={String(formData[(col as any).key as keyof T] ?? 'ACTIVE')}
                            onChange={e => handleChange((col as any).key as keyof T, e.target.value)}
                            disabled={isSubmitting}
                        >
                            <option value="ACTIVE">Faol</option>
                            <option value="INACTIVE">Nofaol</option>
                        </select>
                    ) : (
                        <input
                            type="text"
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={String(formData[(col as any).key as keyof T] ?? '')}
                            onChange={e => handleChange((col as any).key as keyof T, e.target.value)}
                            disabled={isSubmitting}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}