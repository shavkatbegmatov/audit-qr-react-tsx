// src/components/table/CreateModal.tsx
import { useState } from 'react';
import type { Column } from './useTable';

interface CreateModalProps<T extends { id: number }> {
    visible: boolean;
    onSubmit: (item: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
}

export default function CreateModal<T extends { id: number }>({ visible, onSubmit, onClose, columns }: CreateModalProps<T>) {
    const [formData, setFormData] = useState<Partial<T>>({});

    const handleChange = (key: keyof T, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        await onSubmit(formData);
        onClose();
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Item</h2>
                <form>
                    {/* ID ni read-only ko'rsatish (create da auto-generated deb) */}
                    <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">ID</label>
                        <input
                            type="text"
                            className="border border-gray-300 p-3 w-full rounded-lg bg-gray-100 cursor-not-allowed"
                            value="Auto-generated"
                            disabled
                            readOnly
                        />
                    </div>
                    {columns.filter(col => col.key !== 'id').map(col => (
                        <div key={String(col.key)} className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">{col.label}</label>
                            <input
                                type="text"
                                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                onChange={e => handleChange(col.key, e.target.value)}
                            />
                        </div>
                    ))}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200">Cancel</button>
                        <button type="button" onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}