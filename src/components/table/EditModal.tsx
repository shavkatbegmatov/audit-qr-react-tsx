// src/components/table/EditModal.tsx
import type { Column } from './useTable';
import ConfirmModal from '@/components/layout/ConfirmModal';
import Button from '@/components/ui/Button';
import { useEditModal } from '@/hooks/useEditModal';
import { useParentOptions } from '@/hooks/useParentOptions';
import { useState, useEffect } from 'react';

interface EditModalProps<T extends { id: number }> {
    visible: boolean;
    item: Partial<T> | null;
    onSubmit: (updatedItem: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
    parentApiUrl?: string;
    grandParentApiUrl?: string;
}

export default function EditModal<T extends { id: number; parentId?: number | null }>({ visible, item, onSubmit, onClose, columns, parentApiUrl, grandParentApiUrl }: EditModalProps<T>) {
    const {
        formData,
        isSubmitting,
        errorMessage,
        showConfirmClose,
        handleChange,
        handleSubmit,
        handleClose,
        confirmClose,
        cancelClose,
    } = useEditModal({ visible, item, onSubmit, onClose });

    const grandOptions = useParentOptions(grandParentApiUrl);
    const parentOptionsAll = useParentOptions(parentApiUrl);

    const [selectedGrand, setSelectedGrand] = useState('');

    const selectedParent = String(formData.parentId ?? '');

    const [selectedDepth, setSelectedDepth] = useState('1');

    const isRecursive = grandParentApiUrl && parentApiUrl && grandParentApiUrl === parentApiUrl;

    const depthLabels: { [key: string]: string } = {
        '1': '1-daraja: Blok direktorlari',
        '2': '2-daraja: Departament direktorlari',
        '3': '3-daraja: Boshqarma boshliqlari',
    };

    useEffect(() => {
        if (visible && item && parentOptionsAll.length > 0) {
            if (isRecursive && item.id) {
                const parentOf = new Map(parentOptionsAll.map(opt => [opt.id, opt.parentId]));
                const memo = new Map<number, number>();

                function getDepth(id: number, path: Set<number> = new Set()): number {
                    if (memo.has(id)) return memo.get(id)!;
                    if (path.has(id)) {
                        console.error(`Cycle detected in block hierarchy at id ${id}`);
                        return 1; // Fallback to depth 1 on cycle
                    }
                    path.add(id);
                    const p = parentOf.get(id);
                    if (p === null || p === undefined) {
                        const depth = 1;
                        memo.set(id, depth);
                        path.delete(id);
                        return depth;
                    }
                    const depth = getDepth(p, path) + 1;
                    memo.set(id, depth);
                    path.delete(id);
                    return depth;
                }

                setSelectedDepth(String(getDepth(item.id)));
            } else if (!isRecursive && grandParentApiUrl && parentApiUrl) {
                const currentParent = parentOptionsAll.find(opt => opt.id === parseInt(selectedParent));
                setSelectedGrand(String(currentParent?.parentId ?? ''));
            }
        }
    }, [visible, item, grandParentApiUrl, parentApiUrl, parentOptionsAll, selectedParent, isRecursive]);

    let filteredParentOptions: typeof parentOptionsAll = [];

    if (isRecursive) {
        const depth1 = parentOptionsAll.filter(opt => opt.parentId === null);
        const depth2 = parentOptionsAll.filter(opt => depth1.some(d1 => d1.id === opt.parentId));

        if (selectedDepth === '2') {
            filteredParentOptions = depth1;
        } else if (selectedDepth === '3') {
            filteredParentOptions = depth2;
        }
    } else {
        filteredParentOptions = selectedGrand ? parentOptionsAll.filter(opt => opt.parentId === parseInt(selectedGrand)) : parentOptionsAll;
    }

    const handleDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDepth = e.target.value;
        setSelectedDepth(newDepth);
        if (newDepth === '1') {
            handleChange('parentId', '');
        } else if (selectedParent && !filteredParentOptions.some(opt => opt.id === parseInt(selectedParent))) {
            handleChange('parentId', '');
        }
    };

    if (!visible || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden">
                <div className="p-8 sticky top-0 bg-white z-10 border-b border-gray-200">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Elementni Tahrirlash ✨</h2>
                </div>
                <div className="flex-grow overflow-y-auto px-8">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-semibold text-gray-800">ID</label>
                                <input
                                    type="text"
                                    className="border border-gray-300 p-3 w-full rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                                    value={String(formData.id ?? 'Noma\'lum')}
                                    disabled readOnly
                                />
                            </div>

                            {grandParentApiUrl && parentApiUrl ? (
                                <>
                                    {isRecursive ? (
                                        <>
                                            <div className="mb-5">
                                                <label className="block mb-2 text-sm font-semibold text-gray-800">Daraja</label>
                                                <select
                                                    className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    value={selectedDepth}
                                                    onChange={handleDepthChange}
                                                    disabled={isSubmitting}
                                                >
                                                    {Object.entries(depthLabels).map(([value, label]) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {selectedDepth !== '1' && (
                                                <div className="mb-5">
                                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Ota ID (Oldingi daraja)</label>
                                                    <select
                                                        className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-5">
                                                <label className="block mb-2 text-sm font-semibold text-gray-800">Tier1 ID</label>
                                                <select
                                                    className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                                    className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    )}
                                </>
                            ) : parentApiUrl ? (
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-semibold text-gray-800">Parent ID</label>
                                    <select
                                        className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                        className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            value={String(formData[col.key as keyof T] ?? 'ACTIVE')}
                                            onChange={e => handleChange(col.key, e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
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
                                            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            value={String(formData[col.key as keyof T] ?? '')}
                                            onChange={e => handleChange(col.key, e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                    </form>
                </div>
                <div className="p-8 sticky bottom-0 bg-white z-10 border-t border-gray-200">
                    <div className="flex justify-end space-x-4">
                        <Button
                            variant="danger"
                            onClick={handleClose}
                            type="button"
                            disabled={isSubmitting}
                        >
                            Bekor Qilish
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Saqlash
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmClose}
                onConfirm={confirmClose}
                onCancel={cancelClose}
                isLoading={false}
                title="Tasdiqlash"
                message="O'zgarishlar saqlanmagan. Haqiqatan ham yopmoqchimisiz?"
            />
        </div>
    );
}