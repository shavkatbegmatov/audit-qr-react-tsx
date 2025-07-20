// src/components/table/EditModal.tsx
import type { Column } from './useTable';
import ConfirmModal from '@/components/layout/ConfirmModal';
import Button from '@/components/ui/Button';
import { useEditModal } from '@/hooks/useEditModal'; // Yangi hook'ni import qilamiz

// Props interfeysi o'zgarishsiz qoladi
interface EditModalProps<T extends { id: number }> {
    visible: boolean;
    item: Partial<T> | null;
    onSubmit: (updatedItem: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
}

// Komponent endi faqat UI uchun javobgar
export default function EditModal<T extends { id: number }>({ visible, item, onSubmit, onClose, columns }: EditModalProps<T>) {
    // Barcha mantiqni hook'dan olamiz
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

    // Agar modal ko'rinmas bo'lsa yoki item bo'lmasa, hech narsa qaytarmaymiz
    if (!visible || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md" role="dialog" aria-modal="true">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4">
                <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Elementni Tahrirlash ✨</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-semibold text-gray-800">ID</label>
                        <input
                            type="text"
                            className="border border-gray-300 p-3 w-full rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                            value={String(formData.id ?? 'Noma\'lum')}
                            disabled readOnly
                        />
                    </div>
                    {columns.filter(col => col.key !== 'id').map(col => (
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

                    {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

                    <div className="flex justify-end space-x-4 mt-8">
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
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Saqlash
                        </Button>
                    </div>
                </form>
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