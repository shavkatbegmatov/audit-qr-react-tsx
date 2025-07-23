// src/components/ui/UniversalSelect.tsx
import { useEffect, useState } from 'react';

interface Option {
    id: number;
    name: string;
    // Additional fields can be added if needed
}

interface UniversalSelectProps {
    apiUrl: string;
    value: number | null;
    onChange: (value: number | null) => void;
    labelKey?: string;
    valueKey?: string;
    disabled?: boolean;
}

export default function UniversalSelect({
                                            apiUrl,
                                            value,
                                            onChange,
                                            labelKey = 'name',
                                            valueKey = 'id',
                                            disabled = false,
                                        }: UniversalSelectProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${apiUrl}?page=0&size=100`)
            .then(res => res.json())
            .then(data => {
                setOptions(data.data?.content || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching options:', error);
                setLoading(false);
            });
    }, [apiUrl]);

    return (
        <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            disabled={loading || disabled}
            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 shadow-sm hover:shadow-md"
        >
            <option value="">{loading ? 'Yuklanmoqda...' : 'Tanlang'}</option>
            {options.map(option => (
                <option key={option[valueKey as keyof Option] as number} value={option[valueKey as keyof Option] as number}>
                    {option[labelKey as keyof Option] as string}
                </option>
            ))}
        </select>
    );
}