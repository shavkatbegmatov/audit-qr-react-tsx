// src/components/table/TableRow.tsx
import type { Column } from './useTable';
import Button from '@/components/ui/Button';

interface RowProps<T extends { id: number }> {
    item: T;
    columns: Column<T>[];
    onEdit: (item: T) => void;
    onDelete: (id: number) => void;
}

export default function TableRow<T extends { id: number }>({ item, columns, onEdit, onDelete }: RowProps<T>) {
    return (
        <tr className="hover:bg-gray-100 border-b border-gray-200">
            {columns.map(col => (
                <td key={String(col.key)} className="px-6 py-2 whitespace-nowrap text-sm text-gray-700"> {/* <<< O'ZGARISH BU YERDA */}
                    {String(item[col.key])}
                </td>
            ))}
            <td className="px-6 py-2 whitespace-nowrap text-right"> {/* <<< VA BU YERDA */}
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="secondary"
                        onClick={() => onEdit(item)}
                        className="py-1 px-3 text-xs" // Tugmalarni ham kichraytirish mumkin
                    >
                        ✏️ Edit
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => onDelete(item.id)}
                        className="py-1 px-3 text-xs" // Tugmalarni ham kichraytirish mumkin
                    >
                        🗑️ Delete
                    </Button>
                </div>
            </td>
        </tr>
    );
}