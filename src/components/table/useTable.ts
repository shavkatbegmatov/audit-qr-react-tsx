// src/components/table/useTable.ts
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';  // Import the custom axios instance

export interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
}

export interface TableParams<T> {
    apiUrl: string;
    pageSize?: number;
    columns: Column<T>[];
}

interface ApiResponse<T> {
    success: boolean;
    data: {
        content?: T[];
    } | T[];
    meta?: {
        totalElements: number;
    };
    error?: unknown;
}

export default function useTable<T extends { id: number }>({
                                                               apiUrl,
                                                               pageSize = 10
                                                           }: TableParams<T>) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Record<string, unknown>>({});
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = {
                page: page - 1,  // Spring Boot Pageable: zero-based
                size: pageSize,
                q: search,
                ...filters,
            };
            if (sortKey) {
                params.sort = `${String(sortKey)},${sortOrder}`;
            }

            const res = await api.get<ApiResponse<T>>(apiUrl, { params });
            if (res.data.success && 'content' in res.data.data && typeof res.data.meta?.totalElements === 'number') {
                let items: T[] = res.data.data.content ?? [];

                if (sortKey) {
                    items = [...items].sort((a, b) => {
                        const aVal = a[sortKey];
                        const bVal = b[sortKey];
                        if (aVal == null) return -1;
                        if (bVal == null) return 1;
                        if (typeof aVal === 'number' && typeof bVal === 'number') {
                            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                        }
                        return sortOrder === 'asc'
                            ? String(aVal).localeCompare(String(bVal))
                            : String(bVal).localeCompare(String(aVal));
                    });
                }

                setTotal(res.data.meta.totalElements);
                setData(items);
            } else if (res.data.success && Array.isArray(res.data.data)) {
                let items: T[] = res.data.data;
                if (sortKey) {
                    items = [...items].sort((a, b) => {
                        const aVal = a[sortKey];
                        const bVal = b[sortKey];
                        if (aVal == null) return -1;
                        if (bVal == null) return 1;
                        if (typeof aVal === 'number' && typeof bVal === 'number') {
                            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                        }
                        return sortOrder === 'asc'
                            ? String(aVal).localeCompare(String(bVal))
                            : String(bVal).localeCompare(String(aVal));
                    });
                }
                setTotal(items.length);
                setData(items);
            } else {
                console.error('Unexpected response format:', res.data);
                setData([]);
                setTotal(0);
            }
        } catch (err) {
            console.error(err);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, page, pageSize, search, filters, sortKey, sortOrder]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // CRUD ops
    const createItem = async (item: Partial<T>) => { await api.post(apiUrl, item); fetchData(); };
    const updateItem = async (id: number, item: Partial<T>) => { await api.put(`${apiUrl}/${id}`, item); fetchData(); };
    const deleteItem = async (id: number) => { await api.delete(`${apiUrl}/${id}`); fetchData(); };

    // Handlers
    const onSearch = (q: string) => { setSearch(q); setPage(1); };
    const onFilter = (f: Record<string, unknown>) => { setFilters(f); setPage(1); };
    const onSort = (key: keyof T) => {
        if (sortKey === key) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
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