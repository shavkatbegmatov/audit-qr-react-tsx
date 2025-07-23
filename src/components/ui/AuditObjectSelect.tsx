// src/components/ui/AuditObjectSelect.tsx
import { useEffect, useState } from 'react';
import { ROUTES } from "@/utils/constants.ts";

interface AuditObject {
    id: number;
    name: string;
}

interface Props {
    value: number | null;
    onChange: (value: number | null) => void;
}

export default function AuditObjectSelect({ value, onChange }: Props) {
    const [options, setOptions] = useState<AuditObject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${ROUTES.AUDIT_OBJECTS}?page=0&size=100`) // Assuming pagination, fetch up to 100 items
            .then(res => res.json())
            .then(data => {
                setOptions(data.data?.content || []); // Adjust based on response structure, assuming CrudResponse with data.content
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching audit objects:', error);
                setLoading(false);
            });
    }, []);

    return (
        <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            disabled={loading}
        >
            <option value="">{loading ? 'Loading...' : 'Select Audit Object'}</option>
            {options.map(option => (
                <option key={option.id} value={option.id}>
                    {option.name}
                </option>
            ))}
        </select>
    );
}