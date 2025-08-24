import React from 'react';
import { FaDesktop, FaTable, FaTh, FaCogs } from 'react-icons/fa';
import { BiBarChartSquare } from "react-icons/bi";
import { ROUTES } from '@/utils/constants';

// Navigatsiya elementining interfeysini eksport qilamiz, boshqa fayllarda ham ishlatish uchun
export interface NavItem {
    label: string;
    route: string;
    icon?: React.ComponentType<{ className?: string }>;
    subItems?: NavItem[];
}

// Barcha menyu ma'lumotlarini shu yerda saqlaymiz
export const navItems: NavItem[] = [
    { label: 'Boshqaruv paneli', route: ROUTES.ROOT, icon: FaDesktop },
    {
        label: "Asosiy ma'lumotlar",
        route: ROUTES.REFERENCE,
        icon: FaTable,
        subItems: [
            { label: 'Audit obyekt turlari', route: ROUTES.AUDIT_OBJECT_TYPES, icon: FaTable },
            { label: 'Audit obyektlari', route: ROUTES.AUDIT_OBJECTS, icon: FaTable },
            { label: 'Audit obyekt tarmog\'lari', route: ROUTES.AUDIT_OBJECT_BRANCH_NETWORKS, icon: FaTable },
            { label: 'Bloklar', route: ROUTES.BLOCK, icon: FaTable },
            {
                label: 'Risklar reestri',
                route: ROUTES.RISK_REGISTRY,
                icon: BiBarChartSquare,
                subItems: [
                    { label: 'Risklarni baholash mezoni', route: '/risk-registry/list', icon: FaTable },
                    { label: '1-darajali risk turlari', route: ROUTES.TIER_1_RISK_TYPES, icon: FaTable },
                    { label: '2-darajali risk turlari', route: ROUTES.TIER_2_RISK_TYPES, icon: FaTable },
                    { label: '3-darajali risk turlari', route: ROUTES.TIER_3_RISK_TYPES, icon: FaTable },
                ]
            },
            { label: 'Tarkibiy tuzilmalar', route: ROUTES.ORG_STRUCTURE, icon: FaTable },
            { label: 'Auditorlar', route: '/audit-object-types/sub5', icon: FaTable },
            { label: 'Obyekt bo\'limlari', route: ROUTES.SUBJECT_SECTIONS, icon: FaTable },
            { label: 'Qo\'shimcha reestrlar', route: '/audit-object-types/sub8', icon: FaTable },
            { label: 'Aniqlangan holatlar reyestri', route: '/audit-object-types/sub9', icon: FaTable },
        ]
    },
    { label: 'Audit Loglari', route: ROUTES.AUDIT_LOGS, icon: FaTh },
    {
        label: 'Xavfsizlik',
        route: '/security',
        icon: FaCogs,
        subItems: [
            { label: 'Foydalanuvchilar', route: ROUTES.USERS, icon: FaTable },
            { label: 'Rollar', route: ROUTES.ROLES, icon: FaTable },
        ]
    },
];