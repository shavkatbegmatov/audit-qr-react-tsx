// src/pages/UsersManagementPage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaUserShield, FaUsers } from 'react-icons/fa';

// Asosiy komponentlar
import CustomTable from '@/components/table/CustomTable';
import type { Column as BaseColumn } from '@/components/table/useTable';
import Badge from '@/components/ui/Badge';
import UiButton from '@/components/ui/UiButton';

// Tiplarni import qilish
import type { User, UserRole } from '@/types/UserTypes';
import type { Auditor, AuditorRole, AuditorStatus } from '@/types/AuditorTypes';

// Yordamchi funksiyalar va konstantalar
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/dateUtils';

// Tab turlari
type TabType = 'users' | 'auditors';

// Yordamchi Render Funksiyalar
const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'INACTIVE': return 'danger';
        case 'PENDING': return 'warning';
        case 'BLOCKED': return 'danger';
        default: return 'secondary';
    }
};

export default function UsersManagementPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('users');

    // Foydalanuvchilar uchun ustunlar (actions ustunini olib tashladim, chunki Table komponentida bor)
    const userColumns: BaseColumn<User>[] = useMemo(
        () => [
            { key: 'id', label: 'ID', sortable: true, width: '80px' },
            {
                key: 'fullName',
                label: 'To\'liq Ism',
                sortable: true,
                render: (value: User['fullName'], row: User) => (
                    <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400 h-4 w-4" />
                        <span className="font-medium">{value ?? row.username}</span>
                    </div>
                ),
            },
            { key: 'username', label: 'Login', sortable: true },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value: User['status']) => (
                    <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
                ),
            },
            {
                key: 'enabled',
                label: 'Aktiv',
                sortable: true,
                render: (value: User['enabled']) => (
                    <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Ha' : 'Yo\'q'}</Badge>
                ),
            },
            {
                key: 'roles',
                label: 'Rollar',
                render: (value: UserRole[]) => (
                    <div className="flex flex-wrap gap-1">
                        {value?.length > 0
                            ? value.map((role: UserRole) => (
                                <Badge key={role.id} variant="info">
                                    {role.name}
                                </Badge>
                            ))
                            : <span className="text-gray-400">—</span>
                        }
                    </div>
                ),
            },
            {
                key: 'createdAt',
                label: 'Yaratilgan',
                sortable: true,
                render: (value: string) => value ? formatDate(value, true) : '—',
            },
        ],
        []
    );

    // Auditorlar uchun ustunlar (actions ustunini olib tashladim, chunki Table komponentida bor)
    const auditorColumns: BaseColumn<Auditor>[] = useMemo(
        () => [
            { key: 'id', label: 'ID', sortable: true, width: '80px' },
            {
                key: 'fullName',
                label: 'To\'liq Ism',
                sortable: true,
                render: (value: Auditor['fullName'], row: Auditor) => (
                    <div className="flex items-center gap-2">
                        <FaUserShield className="text-gray-400 h-4 w-4" />
                        <span className="font-medium">{value ?? row.username}</span>
                    </div>
                ),
            },
            {
                key: 'orgUnitName',
                label: 'Tarkibiy Bo\'linma',
                sortable: true,
                render: (value: Auditor['orgUnitName'], row: Auditor) =>
                    `${row.orgUnitCode ?? ''} ${value ?? ''}`.trim() || 'N/A',
            },
            {
                key: 'roles',
                label: 'Rollar',
                render: (value: Auditor['roles']) => (
                    <div className="flex flex-wrap gap-1">
                        {value?.length > 0
                            ? value.map((r: AuditorRole) => (
                                <Badge key={r.id} variant="info">
                                    {r.name}
                                </Badge>
                            ))
                            : <span className="text-gray-400">—</span>
                        }
                    </div>
                ),
            },
            {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value: Auditor['status']) => (
                    <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
                ),
            },
            {
                key: 'enabled',
                label: 'Aktiv',
                sortable: true,
                render: (value: Auditor['enabled']) => (
                    <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Ha' : 'Yo\'q'}</Badge>
                ),
            },
            {
                key: 'auditsCount',
                label: 'Auditlar',
                sortable: true,
                align: 'center',
                render: (v: Auditor['auditsCount']) => (
                    <span className={typeof v === 'number' ? 'text-gray-900' : 'text-gray-400'}>
                        {typeof v === 'number' ? v.toLocaleString() : '—'}
                    </span>
                ),
            },
            {
                key: 'lastLoginAt',
                label: 'Oxirgi Kirish',
                sortable: true,
                render: (value: Auditor['lastLoginAt']) => value ? formatDate(value, true) : '—',
            },
        ],
        []
    );

    const tabs = [
        {
            key: 'users' as TabType,
            label: 'Foydalanuvchilar',
            icon: FaUsers,
        },
        {
            key: 'auditors' as TabType,
            label: 'Auditorlar',
            icon: FaUserShield,
        },
    ];

    const getActiveTabConfig = () => {
        switch (activeTab) {
            case 'users':
                return {
                    title: 'Foydalanuvchilar',
                    apiUrl: '/api/v1/users', // Backend API endpoint
                    columns: userColumns,
                    createButtonText: 'Yangi foydalanuvchi qo\'shish',
                    createAction: () => console.log('Yangi foydalanuvchi qo\'shish'), // TODO: Modal ochish
                };
            case 'auditors':
                return {
                    title: 'Auditorlar',
                    apiUrl: '/api/v1/auditors', // Backend API endpoint
                    columns: auditorColumns,
                    createButtonText: 'Yangi auditor qo\'shish',
                    createAction: () => navigate(ROUTES.AUDITORS_CREATE),
                };
            default:
                return {
                    title: 'Foydalanuvchilar',
                    apiUrl: '/api/v1/users',
                    columns: userColumns,
                    createButtonText: 'Yangi foydalanuvchi qo\'shish',
                    createAction: () => console.log('Yangi foydalanuvchi qo\'shish'),
                };
        }
    };

    const activeTabConfig = getActiveTabConfig();

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Foydalanuvchilar va Auditorlar
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tizim foydalanuvchilarini va auditorlarini boshqarish
                    </p>
                </div>
                <UiButton
                    variant="primary"
                    onClick={activeTabConfig.createAction}
                >
                    <FaPlus className="mr-2 h-4 w-4" />
                    {activeTabConfig.createButtonText}
                </UiButton>
            </header>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm
                                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm
                                    ${isActive
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                                `}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Table Content - CustomTable komponentini ishlatish */}
            <div className="overflow-hidden">
                {activeTab === 'users' && (
                    <CustomTable<User>
                        key="users-table"
                        apiUrl={activeTabConfig.apiUrl}
                        columns={activeTabConfig.columns as BaseColumn<User>[]}
                        tableType="users"
                        onCustomEdit={(user) => console.log('Edit user:', user)}
                        onCustomDelete={(id) => console.warn(`Delete user: ${id}`)}
                    />
                )}
                {activeTab === 'auditors' && (
                    <CustomTable<Auditor>
                        key="auditors-table"
                        apiUrl={activeTabConfig.apiUrl}
                        columns={activeTabConfig.columns as BaseColumn<Auditor>[]}
                        tableType="auditors"
                        onCustomEdit={(auditor) => navigate(ROUTES.AUDITOR_DETAIL.replace(':id', auditor.id.toString()))}
                        onCustomDelete={(id) => console.warn(`Delete auditor: ${id}`)}
                    />
                )}
            </div>
        </div>
    );
}