// src/components/table/CreateModal.tsx
import type { Column } from './useTable';
import ConfirmModal from '@/components/layout/ConfirmModal';
import Button from '@/components/ui/Button';
import { useCreateModal } from '@/hooks/useCreateModal'; // Yangi hook'ni import qilamiz

// Komponent interfeysi o'zgarishsiz qoladi
interface CreateModalProps<T extends { id: number }> {
    visible: boolean;
    onSubmit: (item: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
}

// "Best Practice" versiyasidagi komponent
export default function CreateModal<T extends { id: number }>({ visible, onSubmit, onClose, columns }: CreateModalProps<T>) {
    // Barcha mantiqni hook'dan olamiz
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

    // Agar modal ko'rinmas bo'lsa, hech narsa qaytarmaymiz
    if (!visible) return null;

    // UI: Modalning asosiy qismi
    // "Best Practice": Accessibility (a11y) uchun 'role', 'aria-modal', 'aria-labelledby' qo'shildi
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
            role="dialog" // 1. Dialog roli
            aria-modal="true" // 2. Modal ekanligini bildiradi
            aria-labelledby="create-modal-title" // 3. Sarlavha bilan bog'lash
        >
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all duration-300 ease-in-out border border-gray-200">
                <h2
                    id="create-modal-title" // Sarlavha ID si
                    className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                >
                    Yangi Element Yaratish ✨
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}> {/* Form submit ni ham handle qilish */}
                    {/* ID maydoni */}
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

                    {/* Dinamik maydonlar */}
                    {columns.filter(col => col.key !== 'id').map(col => (
                        <div key={String(col.key)} className="mb-5">
                            <label className="block mb-2 text-sm font-semibold text-gray-800">{col.label}</label>
                            {col.key === 'status' ? (
                                <select
                                    className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                    value={String(formData[col.key as keyof T] ?? 'ACTIVE')}
                                    onChange={e => handleChange(col.key, e.target.value)}
                                    disabled={isSubmitting} // Yuborish jarayonida o'chirish
                                >
                                    <option value="ACTIVE">Faol</option>
                                    <option value="INACTIVE">Nofaol</option>
                                </select>
                            ) : (
                                <input
                                    type="text" // Keyinchalik type'ni column'dan olish mumkin (masalan, 'number', 'date')
                                    className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                    onChange={e => handleChange(col.key, e.target.value)}
                                    disabled={isSubmitting} // Yuborish jarayonida o'chirish
                                />
                            )}
                        </div>
                    ))}

                    {/* Xatolik xabari */}
                    {errorMessage && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {/* Tugmalar */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <Button
                            variant="danger"
                            onClick={handleClose}
                            disabled={isSubmitting} // Yuborish jarayonida o'chirish
                            type="button"
                        >
                            Bekor Qilish
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            isLoading={isSubmitting} // "Loading" holatini ko'rsatish
                            type="submit"
                        >
                            {isSubmitting ? 'Yaratilmoqda...' : 'Yaratish'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Tasdiq modal oynasi */}
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