import type { Column } from './useTable';

interface RowProps<T extends { id: any }> {
    item: T;
    columns: Column<T>[];
    onEdit: (id: any, item: Partial<T>) => void;
    onDelete: (id: any) => void;
}

export default function TableRow<T>({ item, columns, onEdit, onDelete }: RowProps<T>) {
    return (
        <tr className="hover:bg-gray-100">
            {columns.map(col => (
                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {String(item[col.key])}
                </td>
            ))}
            <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                <button onClick={() => onEdit(item.id, item)} className="text-blue-600 hover:text-blue-900">✏️</button>
                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">🗑️</button>
            </td>
        </tr>
    );
}
