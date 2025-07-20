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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 backdrop-blur-md">
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all duration-500 ease-in-out scale-105 hover:scale-110 border border-white/50">
                <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">Yangi Element Yaratish ✨</h2>
                <form>
                    {/* ID ni read-only ko'rsatish (create da auto-generated deb) */}
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-semibold text-gray-800">ID</label>
                        <input
                            type="text"
                            className="border border-gray-300 p-3 w-full rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                            value="Avtomatik Yaratiladi"
                            disabled
                            readOnly
                        />
                    </div>
                    {columns.filter(col => col.key !== 'id').map(col => (
                        <div key={String(col.key)} className="mb-5">
                            <label className="block mb-2 text-sm font-semibold text-gray-800">{col.label}</label>
                            <input
                                type="text"
                                className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                onChange={e => handleChange(col.key, e.target.value)}
                            />
                        </div>
                    ))}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition duration-300 cursor-pointer shadow-md hover:shadow-lg">Bekor Qilish</button>
                        <button type="button" onClick={handleSubmit} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition duration-300 cursor-pointer shadow-md hover:shadow-lg">Yaratish</button>
                    </div>
                </form>
            </div>
        </div>
    );
}