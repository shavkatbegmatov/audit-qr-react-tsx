// src/components/table/TableRow.tsx
import type { Column } from './useTable';
import Button from '@/components/ui/Button';  // Universal Button import qilindi

interface RowProps<T extends { id: number }> {
    item: T;
    columns: Column<T>[];
    onEdit: (item: T) => void;  // Modal ochish uchun faqat item yuborish
    onDelete: (id: number) => void;
}

export default function TableRow<T extends { id: number }>({ item, columns, onEdit, onDelete }: RowProps<T>) {
    return (
        <tr className="hover:bg-gray-100">
            {columns.map(col => (
                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {String(item[col.key])}
                </td>
            ))}
            <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                <Button
                    variant="secondary"  // Secondary variant (masalan, oddiy ko'rinish)
                    onClick={() => onEdit(item)}
                >
                    ✏️ Edit
                </Button>
                <Button
                    variant="danger"  // Danger variant (qizil rang)
                    onClick={() => onDelete(item.id)}
                >
                    🗑️ Delete
                </Button>
            </td>
        </tr>
    );
}