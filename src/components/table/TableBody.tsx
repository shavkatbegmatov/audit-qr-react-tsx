// src/components/table/TableBody.tsx
// Jadval tanasi komponenti: Ma'lumotlarni ro'yxatini ko'rsatadi.
// Yuklanayotgan holatni boshqaradi va TableRow komponentini ishlatadi.
// Best practice: Strict typing (id: number), ESLint mos (no any), tushunarli izohlar.
// Yuklanayotgan holat: O'zbek tilida xabar, colspan avto-hisoblanadi.
// Data bo'sh bo'lsa: Bo'sh tbody qaytaradi (optional: bo'sh xabar qo'shish mumkin).

import TableRow from './TableRow';
import type { Column } from './useTable';

interface BodyProps<T extends { id: number }> {
    data: T[];  // Ma'lumotlar ro'yxati
    columns: Column<T>[];  // Jadval ustunlari
    onEdit: (item: T) => void;  // Tahrirlash funksiyasi (modal ochish uchun item yuborish)
    onDelete: (id: number) => void;  // O'chirish funksiyasi
    loading: boolean;  // Yuklanayotgan holat
}

export default function TableBody<T extends { id: number }>({ data, columns, onEdit, onDelete, loading }: BodyProps<T>) {
    if (loading) {
        return (
            <tbody>
            <tr>
                <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                    Yuklanmoqda...  {/* Optional: Spinner qo'shish mumkin <Spinner /> */}
                </td>
            </tr>
            </tbody>
        );
    }

    return (
        <tbody className="bg-white divide-y divide-gray-200">
        {data.map(item => (
            <TableRow
                key={item.id}  // Unique key: id bo'yicha
                item={item}
                columns={columns}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ))}
        {/* Agar data bo'sh bo'lsa, optional xabar qo'shish */}
        {data.length === 0 && (
            <tr>
                <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                    Ma'lumotlar topilmadi.
                </td>
            </tr>
        )}
        </tbody>
    );
}