import TableRow from './TableRow';
import type { Column } from './useTable';

interface BodyProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit: (id: any, item: Partial<T>) => void;
    onDelete: (id: any) => void;
    loading: boolean;
}

export default function TableBody<T>({ data, columns, onEdit, onDelete, loading }: BodyProps<T>) {
    if (loading) {
        return (
            <tbody>
            <tr>
                <td colSpan={columns.length + 1} className="px-6 py-4 text-center">Yuklanmoqda...</td>
            </tr>
            </tbody>
        );
    }
    return (
        <tbody className="bg-white divide-y divide-gray-200">
        {data.map(item => (
            <TableRow key={item.id} item={item} columns={columns} onEdit={onEdit} onDelete={onDelete} />
        ))}
        </tbody>
    );
}
