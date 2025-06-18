// src/components/table/TableToolbar.tsx
import { useState } from 'react';
import styles from './Table.module.css'; // toolbar ham shu faylda turadi

interface ToolbarProps {
    onSearch: (q: string) => void;
    onFilter: (f: Record<string, any>) => void;
    onCreate: (item: any) => void;
}

export default function TableToolbar({ onSearch, onFilter, onCreate }: ToolbarProps) {
    const [q, setQ] = useState('');
    return (
        <div className={styles.toolbar}>
            <input
                className={styles.search}
                placeholder="Qidirish..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && onSearch(q)}
            />
            {/* Filter panelni toggle qilib qo‘shishingiz mumkin */}
            <button onClick={() => onFilter({/* example filter */})}>Filter</button>
            <button onClick={() => onCreate({/* open modal va so‘ng createItem */})}>
                Create
            </button>
        </div>
    );
}
