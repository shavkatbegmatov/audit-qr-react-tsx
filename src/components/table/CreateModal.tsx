// src/components/table/CreateModal.tsx
import type { Column } from './useTable';
import ConfirmModal from '@/components/layout/ConfirmModal';
import Button from '@/components/ui/Button';
import { useCreateModal } from '@/hooks/useCreateModal';
import { useParentOptions } from '@/hooks/useParentOptions';
import { useState } from 'react';

interface CreateModalProps<T extends { id: number }> {
    visible: boolean;
    onSubmit: (item: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
    parentApiUrl?: string;
    grandParentApiUrl?: string;
}

export default function CreateModal<T extends { id: number; parentId?: number | null }>({ visible, onSubmit, onClose, columns, parentApiUrl, grandParentApiUrl }: CreateModalProps<T>) {
    const {
        formData,
        errorMessage,
        isSubmitting,
        showConfirmClose,
        handleChange,
        handleSubmit,
        handleClose,
        confirmClose,
        cancelClose,
    } = useCreateModal({ visible, onSubmit, onClose, columns });

    const grandOptions = useParentOptions(grandParentApiUrl);
    const parentOptionsAll = useParentOptions(parentApiUrl);

    const [selectedGrand, setSelectedGrand] = useState('');
    const selectedParent = String(formData.parentId ?? '');

    const filteredParentOptions = selectedGrand ? parentOptionsAll.filter(opt => opt.parentId === parseInt(selectedGrand)) : parentOptionsAll;

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
        >
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out border border-gray-200">
                <div className="p-8 sticky top-0 bg-white z-10 border-b border-gray-200">
                    <h2
                        id="create-modal-title"
                        className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                        Yangi Element Yaratish ✨
                    </h2>
                </div>
                <div className="flex-grow overflow-y-auto px-8">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {grandParentApiUrl && parentApiUrl ? (
                                <>
                                    <div className="mb-5">
                                        <label className="block mb-2 text-sm font-semibold text-gray-800">Tier1 ID</label>
                                        <select
                                            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                            value={selectedGrand}
                                            onChange={e => {
                                                const newVal = e.target.value;
                                                setSelectedGrand(newVal);
                                                if (newVal && selectedParent && filteredParentOptions.find(opt => opt.id === parseInt(selectedParent)) === undefined) {
                                                    handleChange('parentId', '');
                                                }
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Hech biri</option>
                                            {grandOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-5">
                                        <label className="block mb-2 text-sm font-semibold text-gray-800">Parent ID (Tier2)</label>
                                        <select
                                            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                            value={selectedParent}
                                            onChange={e => handleChange('parentId', e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Hech biri</option>
                                            {filteredParentOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : parentApiUrl ? (
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Parent ID</label>
                                    <select
                                        className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                        value={selectedParent}
                                        onChange={e => handleChange('parentId', e.target.value)}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Hech biri</option>
                                        {parentOptionsAll.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Parent ID</label>
                                    <input
                                        type="number"
                                        className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                        value={String(formData.parentId ?? '')}
                                        onChange={e => handleChange('parentId' as keyof T, e.target.value)}
                                        disabled={isSubmitting}
                                        placeholder="Parent ID ni kiriting (ixtiyoriy)"
                                    />
                                </div>
                            )}

                            {columns.filter(col => col.key !== 'id' && col.key !== 'parentId' && col.key !== 'createdBy' && col.key !== 'createdAt' && col.key !== 'updatedBy' && col.key !== 'updatedAt').map(col => (
                                <div key={String(col.key)} className="mb-5">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">{col.label}</label>
                                    {col.key === 'status' ? (
                                        <select
                                            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                            value={String(formData[col.key as keyof T] ?? 'ACTIVE')}
                                            onChange={e => handleChange(col.key, e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            <option value="ACTIVE">Faol</option>
                                            <option value="INACTIVE">Nofaol</option>
                                        </select>
                                    ) : col.render ? (
                                        <input
                                            type="text"
                                            className="border border-gray-300 p-3 w-full rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                                            value={formData[col.key as keyof T] !== undefined ? String(col.render(formData[col.key as keyof T] as T[typeof col.key]) ?? 'N/A') : 'N/A'}
                                            disabled
                                            readOnly
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                            value={String(formData[col.key as keyof T] ?? '')}
                                            onChange={e => handleChange(col.key, e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {errorMessage && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                                <p>{errorMessage}</p>
                            </div>
                        )}
                    </form>
                </div>
                <div className="p-8 sticky bottom-0 bg-white z-10 border-t border-gray-200">
                    <div className="flex justify-end space-x-4">
                        <Button
                            variant="danger"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            type="button"
                        >
                            Bekor Qilish
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting ? 'Yaratilmoqda...' : 'Yaratish'}
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmClose}
                onConfirm={confirmClose}
                onCancel={cancelClose}
                isLoading={false}
                title="Yopishni Tasdiqlash"
                message="O'zgarishlar saqlanmadi. Haqiqatan ham oynani yopmoqchimisiz?"
            />
        </div>
    );
}