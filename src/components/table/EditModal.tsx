// src/components/table/EditModal.tsx
// Bu komponent elementni tahrirlash uchun modal oyna yaratadi.
// U foydalanuvchiga forma maydonlarini ko'rsatadi va ma'lumotlarni saqlaydi.
// ESLint qoidalariga mos: useState shartsiz chaqirilgan, any o'rniga number ishlatilgan.
// Modal dizayni: CreateModal ga o'xshash - Gradient fon, animatsiya, chiroyli tugmalar.
// ESC bosilganda: Agar o'zgarish bo'lsa, tasdiq so'raydi (ConfirmModal orqali).
// Pointer: Tugmalarda cursor-pointer qo'shilgan.
// Muammo tuzatish: Visible o'zgarganda formData ni reset qilish (bo'sh qilish).
// Yangi o'zgarishlar: Fon sal blur bilan orqa narsalar ko'rinib turishi uchun backdrop-blur-md va bg-opacity-50 qo'shilgan.
// Bekor qilish tugmasi qizilsimon (danger variant), Saqlash tugmasi yashilsimon (primary variant).
// Tuzatish: Modal o'zi kulrang bo'lib qolmasligi uchun bg-white/80 ni bg-white ga o'zgartirdim.
// Orqa fon: bg-black bg-opacity-50 backdrop-blur-md bilan qora yarim shaffof va blur effekti.
// Import o'zgartirish: '@/components/ConfirmModal' -> '@/components/layout/ConfirmModal'
// Universal Button komponentini ishlatish uchun import qo'shilgan va tugmalar Button bilan almashtirilgan.

import { useState, useEffect } from 'react';  // React hook'lari: state va effect uchun
import type { Column } from './useTable';  // Jadval ustun tipi
import ConfirmModal from '@/components/layout/ConfirmModal';  // Tasdiq modalini import qilamiz
import Button from '@/components/ui/Button';  // Universal Button komponentini import qilamiz

// Komponent interfeysi: Props'larni belgilaydi
interface EditModalProps<T extends { id: number }> {
    visible: boolean;  // Modal ochiq yoki yo'q
    item: Partial<T> | null;  // Tahrirlanadigan element
    onSubmit: (updatedItem: Partial<T>) => Promise<void>;  // Saqlash funksiyasi
    onClose: () => void;  // Yopish funksiyasi
    columns: Column<T>[];  // Jadval ustunlari (maydonlar)
}

// Komponent: EditModal
export default function EditModal<T extends { id: number }>({ visible, item, onSubmit, onClose, columns }: EditModalProps<T>) {
    // Form ma'lumotlarini saqlash uchun state
    const [formData, setFormData] = useState<Partial<T>>({});

    // Boshlang'ich ma'lumotlarni saqlash uchun state (o'zgarishni tekshirish uchun)
    const [initialData, setInitialData] = useState<Partial<T>>({});

    // Yopishni tasdiqlash uchun state
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    // Modal ochilganda formData va initialData ni o'rnatish uchun effect
    useEffect(() => {
        if (visible && item) {
            setFormData(item);  // Formni item bilan to'ldir
            setInitialData(item);  // Boshlang'ich holatni saqla
        }
    }, [visible, item]);  // visible va item o'zgarganda ishlaydi

    // Maydon qiymatini o'zgartirish funksiyasi: Inputdan kelayotgan qiymatni formData ga qo'shadi
    const handleChange = (key: keyof T, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Saqlash funksiyasi: "Saqlash" tugmasi bosilganda ishlaydi
    const handleSubmit = async () => {
        await onSubmit(formData);  // Ma'lumotlarni saqlaydi
        onClose();  // Modalni yopadi
    };

    // Form o'zgarganligini tekshirish funksiyasi: initialData bilan solishtirish
    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    };

    // Modalni yopish funksiyasi: Agar o'zgarish bo'lsa, tasdiq so'raydi
    const handleClose = () => {
        if (hasChanges()) {  // O'zgarish bo'lganmi?
            setShowConfirmClose(true);  // Tasdiq oynasini och
        } else {
            onClose();  // To'g'ridan yop
        }
    };

    // Tasdiq bilan yopish: Tasdiq oynasidagi "Ha" tugmasi
    const confirmClose = () => {
        setShowConfirmClose(false);  // Tasdiq oynasini yop
        onClose();  // Modalni yop
    };

    // Tasdiqni bekor qilish: Tasdiq oynasidagi "Yo'q" tugmasi
    const cancelClose = () => {
        setShowConfirmClose(false);  // Tasdiq oynasini yop, modal qoladi
    };

    // ESC klavishasini eshitish uchun effect: Modal ochiq bo'lganda faol
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {  // ESC bosilsa
                handleClose();  // Yopishni boshla
            }
        };

        if (visible) {  // Modal ochiq bo'lsa
            document.addEventListener('keydown', handleKeyDown);  // Klaviatura eshitishni qo'sh
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);  // Tozalash
        };
    }, [visible, formData]);  // visible va formData o'zgarganda qayta ishlaydi

    // Agar modal ochiq bo'lmasa yoki item null bo'lsa, hech narsa ko'rsatma (early return)
    if (!visible || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all duration-500 ease-in-out scale-105 hover:scale-110 border border-gray-200">
                <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">Elementni Tahrirlash ✨</h2>
                <form>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-semibold text-gray-800">ID</label>
                        <input
                            type="text"
                            className="border border-gray-300 p-3 w-full rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                            value={String(formData.id ?? 'Noma\'lum')}
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
                                value={String(formData[col.key] ?? '')}
                                onChange={e => handleChange(col.key, e.target.value)}
                            />
                        </div>
                    ))}
                    <div className="flex justify-end space-x-4 mt-8">
                        <Button
                            variant="danger"
                            onClick={handleClose}
                        >
                            Bekor Qilish
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
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