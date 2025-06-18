// src/components/table/useTable.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
}

export interface TableParams<T> {
    apiUrl: string;
    columns: Column<T>[];
    pageSize?: number;
}

export default function useTable<T>({ apiUrl, columns, pageSize = 10 }: TableParams<T>) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                _page: page,
                _limit: pageSize,
                q: search,
                ...filters,
            };
            if (sortKey) {
                params._sort = sortKey;
                params._order = sortOrder;
            }
            const res = await axios.get<T[]>(apiUrl, { params });
            // assume API returns X-Total-Count header
            setTotal(Number(res.headers['x-total-count'] || res.data.length));
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, page, pageSize, search, filters, sortKey, sortOrder]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // CRUD ops
    const createItem = async (item: Partial<T>) => {
        await axios.post(apiUrl, item);
        fetchData();
    };
    const updateItem = async (id: any, item: Partial<T>) => {
        await axios.put(`${apiUrl}/${id}`, item);
        fetchData();
    };
    const deleteItem = async (id: any) => {
        await axios.delete(`${apiUrl}/${id}`);
        fetchData();
    };

    // handlers
    const onSearch = (q: string) => { setSearch(q); setPage(1); };
    const onFilter = (f: Record<string, any>) => { setFilters(f); setPage(1); };
    const onSort = (key: keyof T) => {
        if (sortKey === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortOrder('asc'); }
    };
    const onPageChange = (p: number) => setPage(p);

    return {
        data, loading, page, total,
        createItem, updateItem, deleteItem,
        onSearch, onFilter, onSort, onPageChange,
        sortKey, sortOrder,
    };
}
