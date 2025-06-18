// src/components/table/TablePagination.tsx
import styles from './Table.module.css';

interface PaginationProps {
    page: number;
    total: number;
    pageSize: number;
    onPageChange: (p: number) => void;
}

export default function TablePagination({ page, total, pageSize, onPageChange }: PaginationProps) {
    const pages = Math.ceil(total / pageSize);
    return (
        <div className={styles.pagination}>
            {Array.from({ length: pages }, (_, i) => (
                <button
                    key={i+1}
                    className={page === i+1 ? styles.activePage : ''}
                    onClick={() => onPageChange(i+1)}
                >
                    {i+1}
                </button>
            ))}
        </div>
    );
}
