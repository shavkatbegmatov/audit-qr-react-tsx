// src/config/navConfig.ts

import React from 'react';
import { FaDesktop, FaTable, FaTh, FaCogs, FaUserShield, FaUsers, FaKey } from 'react-icons/fa';
import { BiBarChartSquare } from "react-icons/bi";
import { ROUTES } from '@/utils/constants';

// Navigatsiya elementining interfeysi
export interface NavItem {
    label: string;
    route: string;
    icon?: React.ComponentType<{ className?: string }>;
    subItems?: NavItem[];
}

// Barcha menyu ma'lumotlari
export const navItems: NavItem[] = [
    { label: 'Boshqaruv paneli', route: ROUTES.ROOT, icon: FaDesktop },
    {
        label: "Asosiy ma'lumotlar",
        route: ROUTES.REFERENCE,
        icon: FaTable,
        subItems: [
            { label: 'Audit obyekt turlari', route: ROUTES.AUDIT_OBJECT_TYPES },
            { label: 'Audit obyektlari', route: ROUTES.AUDIT_OBJECTS },
            { label: 'Audit obyekt tarmog\'lari', route: ROUTES.AUDIT_OBJECT_BRANCH_NETWORKS },
            { label: 'Bloklar', route: ROUTES.BLOCK },
            {
                label: 'Risklar reestri',
                route: ROUTES.RISK_REGISTRY,
                icon: BiBarChartSquare,
                subItems: [
                    { label: 'Risklarni baholash mezoni', route: '/risk-registry/list' },
                    { label: '1-darajali risk turlari', route: ROUTES.TIER_1_RISK_TYPES },
                    { label: '2-darajali risk turlari', route: ROUTES.TIER_2_RISK_TYPES },
                    { label: '3-darajali risk turlari', route: ROUTES.TIER_3_RISK_TYPES },
                ]
            },
            { label: 'Tarkibiy tuzilmalar', route: ROUTES.ORG_STRUCTURE },
            { label: 'Obyekt bo\'limlari', route: ROUTES.SUBJECT_SECTIONS },
            // ... boshqa eski menyular
        ]
    },
    { label: 'Audit Loglari', route: ROUTES.AUDIT_LOGS, icon: FaTh },
    {
        label: 'Xavfsizlik',
        route: '/security',
        icon: FaCogs,
        subItems: [
            { label: 'Foydalanuvchilar', route: ROUTES.USERS, icon: FaUsers },
            { label: 'Rollar', route: ROUTES.ROLES, icon: FaKey },
            // YANGILANGAN VA KO'CHIRILGAN:
            { label: 'Auditorlar', route: ROUTES.AUDITORS, icon: FaUserShield },
        ]
    },
];