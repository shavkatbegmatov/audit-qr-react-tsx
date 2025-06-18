// src/components/table/TableBody.tsx
// src/components/table/TableBody.tsx
import type {Column} from './useTable';
import TableRow from './TableRow';

interface BodyProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit: (id: any, item: Partial<T>) => void;
    onDelete: (id: any) => void;
    loading: boolean;
}

export default function TableBody<T>({ data, columns, onEdit, onDelete, loading }: BodyProps<T>) {
    if (loading) {
        return <tbody><tr><td colSpan={columns.length+1}>Yuklanmoqda...</td></tr></tbody>;
    }
    return (
        <tbody>
        {data.map(item => (
            <TableRow
                key={item.id}
                item={item}
                columns={columns}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ))}
        </tbody>
    );
}
