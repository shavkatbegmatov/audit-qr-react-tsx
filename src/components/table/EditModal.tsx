// src/components/table/EditModal.tsx
import { useState, useEffect } from 'react';
import type { Column } from './useTable';

interface EditModalProps<T extends { id: number }> {
    visible: boolean;
    item: Partial<T> | null;
    onSubmit: (updatedItem: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
}

export default function EditModal<T extends { id: number }>({ visible, item, onSubmit, onClose, columns }: EditModalProps<T>) {
    if (!visible || !item) return null;

    const [formData, setFormData] = useState<Partial<T>>(item);

    useEffect(() => {
        setFormData(item);
    }, [item]);

    const handleChange = (key: keyof T, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        await onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl mb-4">Edit Item</h2>
                {columns.filter(col => col.key !== 'id').map(col => (
                    <div key={String(col.key)} className="mb-4">
                        <label className="block mb-1">{col.label}</label>
                        <input
                            type="text"
                            className="border p-2 w-full"
                            value={String(formData[col.key] ?? '')}
                            onChange={e => handleChange(col.key, e.target.value)}
                        />
                    </div>
                ))}
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white">Save</button>
                </div>
            </div>
        </div>
    );
}