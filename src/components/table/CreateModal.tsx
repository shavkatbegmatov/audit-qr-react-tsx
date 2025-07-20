// src/components/table/CreateModal.tsx
// Bu komponent yangi element yaratish uchun modal oyna yaratadi.
// U foydalanuvchiga forma maydonlarini ko'rsatadi va ma'lumotlarni saqlaydi.
// ESLint qoidalariga mos: useState shartsiz chaqirilgan, any o'rniga number ishlatilgan.
// Modal dizayni: Gradient fon, animatsiya, chiroyli tugmalar.
// ESC bosilganda: Agar o'zgarish bo'lsa, tasdiq so'raydi (ConfirmModal orqali).
// Pointer: Tugmalarda cursor-pointer qo'shilgan.
// Muammo tuzatish: Visible o'zgarganda formData ni reset qilish (bo'sh qilish).
// Yangi o'zgarishlar: Fon sal blur bilan orqa narsalar ko'rinib turishi uchun backdrop-blur-md va bg-opacity-50 qo'shilgan.
// Bekor qilish tugmasi qizilsimon (red-300), Yaratish tugmasi yashilsimon (green-500).
// Tuzatish: Modal o'zi kulrang bo'lib qolmasligi uchun bg-white/80 ni bg-white ga o'zgartirdim.
// Orqa fon: bg-black bg-opacity-50 backdrop-blur-md bilan qora yarim shaffof va blur effekti.
// Import o'zgartirish: '@/components/ConfirmModal' -> '@/components/layout/ConfirmModal'
// Yangi: Universal Button komponentini ishlatish uchun import qo'shilgan va tugmalar Button bilan almashtirilgan.
// Tugmalar: variant bilan ishlaydi (className o'rniga).

import { useState, useEffect } from 'react';
import type { Column } from './useTable';
import ConfirmModal from '@/components/layout/ConfirmModal';  // Tasdiq modalini import qilamiz
import Button from '@/components/ui/Button';  // Universal Button komponentini import qilamiz

interface CreateModalProps<T extends { id: number }> {
    visible: boolean;  // Modal ochiq yoki yo'q
    onSubmit: (item: Partial<T>) => Promise<void>;  // Saqlash funksiyasi
    onClose: () => void;  // Yopish funksiyasi
    columns: Column<T>[];  // Jadval ustunlari (maydonlar)
}

export default function CreateModal<T extends { id: number }>({ visible, onSubmit, onClose, columns }: CreateModalProps<T>) {
    // Form ma'lumotlarini saqlash uchun state
    const [formData, setFormData] = useState<Partial<T>>({});

    // Yopishni tasdiqlash uchun state
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    // Modal ochilganda formData ni bo'shatish (reset)
    useEffect(() => {
        if (visible) {
            setFormData({});  // Har safar modal ochilganda bo'sh qilamiz
        }
    }, [visible]);

    // Maydon qiymatini o'zgartirish funksiyasi
    const handleChange = (key: keyof T, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Saqlash funksiyasi
    const handleSubmit = async () => {
        await onSubmit(formData);
        onClose();
    };

    // Modalni yopish: Agar o'zgarish bo'lsa, tasdiq so'ra
    const handleClose = () => {
        if (Object.keys(formData).length > 0) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    };

    // Tasdiq bilan yopish
    const confirmClose = () => {
        setShowConfirmClose(false);
        onClose();
    };

    // Tasdiqni bekor qilish
    const cancelClose = () => {
        setShowConfirmClose(false);
    };

    // ESC klavishasini eshitish uchun effect
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
    }, [visible, formData]);  // formData o'zgarganda qayta tekshirish uchun

    // Agar modal ochiq bo'lmasa, hech narsa ko'rsatma
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">  // Orqa fon: Qora yarim shaffof va blur effekti
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all duration-500 ease-in-out scale-105 hover:scale-110 border border-gray-200">  // Modal: To'liq oq, blur yo'q
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
                        <Button
                            onClick={handleClose}
                            variant="danger"  // Qizilsimon (danger)
                        >
                            Bekor Qilish
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="primary"  // Yashilsimon (primary)
                        >
                            Yaratish
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
                title="Tasdiqlash"
                message="O'zgarishlar saqlanmagan. Haqiqatan ham yopmoqchimisiz?"
            />
        </div>
    );
}