// src/components/table/TableRow.tsx
import type { Column } from './useTable';
import UiButton from '@/components/ui/UiButton';
import {FaEdit, FaTrashAlt} from "react-icons/fa"; // Button nomini to'g'irladim

interface RowProps<T extends { id: number }> {
    item: T;
    columns: Column<T>[];
    onEdit: (item: T) => void;
    onDelete: (id: number) => void;
}

export default function TableRow<T extends { id: number }>({ item, columns, onEdit, onDelete }: RowProps<T>) {
    return (
        <tr className="hover:bg-gray-100 border-b border-gray-200">
            {columns.map(col => {
                const value = item[col.key as keyof T];
                return (
                    <td key={String(col.key)} className="px-6 py-2 text-sm text-gray-700 overflow-hidden text-ellipsis" style={{ textAlign: (col as any).align ?? 'left' }}>
                        {/* `render` endi `value` va `item` (row) ni qabul qiladi */}
                        {(col as any).render ? (col as any).render(value, item) : String(value ?? '')}
                    </td>
                );
            })}
            {/* --- BOSHLANISHI: QO'SHILGAN QISM --- */}
            <td className="px-6 py-2 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-2">
                    <UiButton
                        variant="icon"
                        size="sm"
                        onClick={() => onEdit(item)}
                        title="Tahrirlash"
                    >
                        <FaEdit />
                    </UiButton>
                    <UiButton
                        variant="icon"
                        color='danger'
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        title="O'chirish"
                    >
                        <FaTrashAlt />
                    </UiButton>
                </div>
            </td>
            {/* --- TUGASHI: QO'SHILGAN QISM --- */}
        </tr>
    );
}