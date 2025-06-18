interface PaginationProps {
    page: number;
    total: number;
    pageSize: number;
    onPageChange: (p: number) => void;
}

export default function TablePagination({ page, total, pageSize, onPageChange }: PaginationProps) {
    const pages = Math.ceil(total / pageSize);
    return (
        <div className="flex justify-end p-4 bg-gray-100 border-t border-gray-200 space-x-1">
            {Array.from({ length: pages }, (_, i) => (
                <button
                    key={i+1}
                    onClick={() => onPageChange(i+1)}
                    className={`px-3 py-1 rounded ${page === i+1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                >
                    {i+1}
                </button>
            ))}
        </div>
    );
}
