import { useState } from 'react';

interface TableToolbarProps {
    onSearch: (q: string) => void;
    onFilter: (f: Record<string, any>) => void;
    onOpenCreate: () => void;
}

export default function TableToolbar({ onSearch, onFilter, onOpenCreate }: TableToolbarProps) {
    const [q, setQ] = useState('');
    return (
        <div className="flex items-center p-4 bg-gray-100 border-b border-gray-200 space-x-2">
            <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Qidirish..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && onSearch(q)}
            />
            <button onClick={() => onFilter({})} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Filter
            </button>
            <button onClick={onOpenCreate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create
            </button>
        </div>
    );
}
