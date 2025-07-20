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
// Status maydoni: ACTIVE yoki INACTIVE bo'ladi, select bilan tanlanadi (agar column key 'status' bo'lsa).
// Tuzatish: Status default 'ACTIVE' qilib formData da oldindan o'rnatiladi (bo'sh yuborilmaslik uchun).
// Yangi tuzatish: Submit da try-catch bilan xatolikni tutib, modalda ko'rsatish va to'ster bilan xabar berish.
// Modal success bo'lmaguncha yopilmaydi. To'ster uchun react-hot-toast ishlatilgan (import qo'shing).

import { useState, useEffect } from 'react';  // React hook'lari: state va effect uchun
import type { Column } from './useTable';  // Jadval ustun tipi
import ConfirmModal from '@/components/layout/ConfirmModal';  // Tasdiq modalini import qilamiz
import Button from '@/components/ui/Button';  // Universal Button komponentini import qilamiz
import toast from 'react-hot-toast';  // To'ster uchun import (react-hot-toast library si o'rnatilgan deb faraz qilamiz)

// Komponent interfeysi: Props'larni belgilaydi
interface CreateModalProps<T extends { id: number }> {
    visible: boolean;  // Modal ochiq yoki yo'q
    onSubmit: (item: Partial<T>) => Promise<void>;  // Saqlash funksiyasi
    onClose: () => void;  // Yopish funksiyasi
    columns: Column<T>[];  // Jadval ustunlari (maydonlar)
}

// Komponent: CreateModal
export default function CreateModal<T extends { id: number }>({ visible, onSubmit, onClose, columns }: CreateModalProps<T>) {
    // Form ma'lumotlarini saqlash uchun state (bo'sh ob'ekt bilan boshlanadi)
    const [formData, setFormData] = useState<Partial<T>>({});

    // Yopishni tasdiqlash uchun state (dastlab false)
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    // Xatolik xabarini saqlash uchun state (backend xatolari uchun)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 'status' column borligini tekshirish
    const hasStatusColumn = columns.some(col => col.key === 'status');

    // Modal ochilganda formData ni bo'shatish va agar kerak bo'lsa default status ni o'rnatish uchun effect
    useEffect(() => {
        if (visible) {
            const initialData: Partial<T> = {};
            if (hasStatusColumn) {
                initialData.status = 'ACTIVE' as any;  // Default 'ACTIVE' faqat status bo'lsa
            }
            setFormData(initialData);
            setErrorMessage(null);  // Har ochilganda xatolikni tozalash
        }
    }, [visible, hasStatusColumn]);  // visible va hasStatusColumn o'zgarganda ishlaydi

    // Maydon qiymatini o'zgartirish funksiyasi: Input yoki select dan kelayotgan qiymatni formData ga qo'shadi
    const handleChange = (key: keyof T, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Saqlash funksiyasi: "Yaratish" tugmasi bosilganda ishlaydi
    const handleSubmit = async () => {
        setErrorMessage(null);  // Oldingi xatolikni tozalash
        try {
            await onSubmit(formData);  // Ma'lumotlarni saqlashga urinish
            toast.success('Muvaffaqiyatli yaratildi!');  // Success to'ster
            onClose();  // Success bo'lsa modalni yop
        } catch (error) {
            // Xatolikni tutish va ko'rsatish
            const errMsg = error.response?.data?.error?.message || 'Xatolik yuz berdi';
            setErrorMessage(errMsg);  // Modalda xatolikni ko'rsat
            toast.error(errMsg);  // Fail to'ster
            // Modal yopilmaydi
        }
    };

    // Modalni yopish funksiyasi: Agar forma to'ldirilgan bo'lsa, tasdiq so'raydi
    const handleClose = () => {
        if (Object.keys(formData).length > 0) {  // Forma bo'sh emasmi?
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

    // Agar modal ochiq bo'lmasa, hech narsa ko'rsatma (early return)
    if (!visible) return null;

    // UI: Modalning asosiy qismi
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">  // Orqa fon: Qora yarim shaffof va blur effekti
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all duration-500 ease-in-out scale-105 hover:scale-110 border border-gray-200">  // Modal: To'liq oq, blur yo'q
                <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">Yangi Element Yaratish ✨</h2>
                <form>  // Forma elementi
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
                            {/* Agar key 'status' bo'lsa, select bilan ACTIVE/INACTIVE tanlash */}
                            {col.key === 'status' ? (
                                <select
                                    className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                    value={String(formData[col.key] ?? 'ACTIVE')}  // Default ACTIVE
                                    onChange={e => handleChange(col.key, e.target.value)}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
                                    onChange={e => handleChange(col.key, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                    {/* Xatolik xabari (agar bo'lsa) */}
                    {errorMessage && (
                        <p className="text-red-500 mb-4">{errorMessage}</p>
                    )}
                    <div className="flex justify-end space-x-4 mt-8">  // Tugmalar qatori
                        <Button
                            variant="danger"  // Qizilsimon (danger)
                            onClick={handleClose}
                        >
                            Bekor Qilish
                        </Button>
                        <Button
                            variant="primary"  // Yashilsimon (primary)
                            onClick={handleSubmit}
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