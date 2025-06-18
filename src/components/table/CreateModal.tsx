import { useState, useEffect } from 'react';
import type { Column } from './useTable';

interface CreateModalProps<T> {
    visible: boolean;
    onSubmit: (item: Partial<T>) => void;
    onClose: () => void;
    columns: Column<T>[];
}

export default function CreateModal<T>({ visible, onSubmit, onClose, columns }: CreateModalProps<T>) {
    const [form, setForm] = useState<Record<string, any>>({});

    useEffect(() => {
        if (visible) {
            const initial: Record<string, any> = {};
            columns.forEach(col => {
                if (col.key === 'status') {
                    initial[col.key as string] = 'ACTIVE';
                } else if (col.key !== 'id') {
                    initial[col.key as string] = '';
                }
            });
            setForm(initial);
        }
    }, [visible, columns]);

    if (!visible) return null;

    const handleChange = (key: string, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };
    const handleSubmit = () => onSubmit(form as T);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Yangi yozuv qo'shish</h2>
                </header>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {columns.filter(c => c.key !== 'id').map(col => (
                        <div key={String(col.key)}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {col.label}
                            </label>

                            {col.key === 'status' ? (
                                <select
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-200 focus:ring-1 focus:border-blue-500"
                                    value={form[col.key as string]}
                                    onChange={e => handleChange(col.key as string, e.target.value)}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="PASSIVE">PASSIVE</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-200 focus:ring-1 focus:border-blue-500"
                                    value={form[col.key as string] ?? ''}
                                    onChange={e => handleChange(col.key as string, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <footer className="px-6 py-4 bg-gray-50 flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}
