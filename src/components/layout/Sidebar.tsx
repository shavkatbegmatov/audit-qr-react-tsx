// src/components/Sidebar.tsx

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { FaDesktop, FaTable, FaTh, FaCogs, FaAngleRight } from 'react-icons/fa';
import { BiBarChartSquare } from "react-icons/bi";
import logoImage from '@/assets/brb_logo_with_name_white.png';
import { useSidebar } from '@/context/SidebarContext';
import React, { useLayoutEffect, memo, useMemo } from "react";

interface NavItem {
    label: string;
    route: string;
    icon?: React.ComponentType<{ className?: string }>;
    subItems?: NavItem[];
}

const navItems: NavItem[] = [
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
            { label: 'Obyekt bo\'limlari', route: '/audit-object-types/sub6', icon: FaTable },
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

// Bu funksiya marshrut bo'yicha ota-ona menyularni topadi.
// U faqat marshrut o'zgarganda kerak, shuning uchun uni Sidebar komponentidan tashqarida qoldiramiz.
function findParentsForRoute(items: NavItem[], targetRoute: string, currentParents: string[] = []): string[] {
    for (const item of items) {
        // Agar joriy elementning yo'li maqsadli yo'l bilan bir xil bo'lsa,
        // va uning sub-elementlari bo'lsa, demak, bu ota-ona hisoblanadi.
        if (item.route === targetRoute && item.subItems) {
            return [...currentParents, item.label];
        }

        if (item.subItems) {
            const found = findParentsForRoute(item.subItems, targetRoute, [...currentParents, item.label]);
            if (found.length > 0) {
                // Agar ichki elementlardan topilsa, bu topilgan yo'lni qaytaramiz
                return found;
            }
        }
    }
    // Agar hech narsa topilmasa, bo'sh massiv qaytaramiz.
    // Marshrut sub-item bo'lmasa, ota-onasi bo'lmaydi.
    // Agar marshrut topilsa-yu, subItems bo'lmasa, bizga faqat uning ota-onalari kerak, o'zi emas.
    const directParent = items.find(item => item.subItems?.some(sub => sub.route === targetRoute));
    if (directParent) {
        return [...currentParents, directParent.label];
    }

    return [];
}

interface SidebarProps {
    isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
    const location = useLocation();
    const { setOpenedSubMenus } = useSidebar();

    // Sahifa birinchi marta yuklanganda yoki marshrut o'zgarganda,
    // aktiv menyuning ota-ona menyularini ochib qo'yish uchun.
    // useEffect ni useLayoutEffect ga o'zgartirdik, flicker ni oldini olish uchun.
    useLayoutEffect(() => {
        const parents = findParentsForRoute(navItems, location.pathname);
        if (parents.length > 0) {
            // Ota-ona menyularni ochiqlar ro'yxatiga qo'shamiz, eski ochiq menyularni saqlab.
            // Bu multiple open ga mos keladi va flicker ni oldini oladi.
            setOpenedSubMenus((prev) => {
                const uniqueOpened = new Set(prev);
                parents.forEach((p) => uniqueOpened.add(p));
                return Array.from(uniqueOpened);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]); // `setOpenedSubMenus` ni dependency ro'yxatidan olib tashladik, chunki u o'zgarmaydi.

    // `navItems` o'zgarmas ekan, menyu elementlarini `useMemo` bilan keshlaymiz.
    // Bu `Sidebar` har safar qayta render bo'lganda `SidebarItem`larni qaytadan yaratishning oldini oladi.
    const memoizedNavItems = useMemo(() => {
        return navItems.map((item) => (
            <SidebarItem key={item.label} item={item} />
        ));
    }, []); // Bo'sh massiv - faqat bir marta ishlaydi.

    return (
        <nav
            className={`fixed top-0 left-0 h-full w-[280px] bg-[#1b1a1b] backdrop-blur-md text-white overflow-y-auto transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} [&::-webkit-scrollbar]:w-0`}
        >
            <header className="bg-[#33363a]">
                <img src={logoImage} alt="Profile" className="w-[200px] m-[15px]" />
                <h1 className="text-center font-medium text-[25px] pb-[13px] font-sans tracking-[2px] text-red-500">
                    AuditQR
                </h1>
            </header>
            <div className="menu w-full mt-[30px]">
                {memoizedNavItems}
            </div>
        </nav>
    );
}

// ===== SidebarItem Komponenti (OPTIMALLASHTIRILGAN) =====

interface SidebarItemProps {
    item: NavItem;
    level?: number;
    isParentOpen?: boolean;
}

// `React.memo` - bu HOC (High-Order Component). U komponentni o'rab oladi va uning
// props'lari o'zgarmagan bo'lsa, qayta render bo'lishiga yo'l qo'ymaydi.
const SidebarItem = memo(function SidebarItem({ item, level = 0, isParentOpen = false }: SidebarItemProps) {
    const { openedSubMenus, toggleSubMenu } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

    // Marshrutning aktivligini tekshirish uchun `useMemo`dan foydalanamiz.
    // Bu hisob-kitob faqat `location.pathname` yoki `item` o'zgarganda ishlaydi.
    const isParentActive = useMemo(() => {
        const isAnySubItemActive = (navItem: NavItem): boolean => {
            return navItem.subItems?.some(
                (sub) => location.pathname === sub.route || isAnySubItemActive(sub)
            ) || false;
        };
        return location.pathname === item.route || isAnySubItemActive(item);
    }, [location.pathname, item]);

    const isSubOpen = openedSubMenus.includes(item.label);
    const indent = level * 20;
    const basePadding = 25;

    const showConnectingLines = level > 0 && isParentOpen;

    const connectingLines = showConnectingLines ? (
        <div style={{
            position: 'absolute',
            left: '0px',
            top: '50%',
            width: 20,
            height: 1,
            background: '#ef4444',
            transform: 'translateY(-50%)'
        }} />
    ) : null;

    // Agar elementning ichki menyulari (subItems) bo'lsa
    if (item.subItems) {
        const handleParentClick = () => {
            // Agar joriy sahifa shu menyuga tegishli bo'lsa, shunchaki ochamiz/yopamiz.
            if (location.pathname === item.route) {
                toggleSubMenu(item.label);
            } else {
                // Agar boshqa sahifada bo'lsak, avval menyuni ochamiz (agar yopiq bo'lsa),
                // keyin o'sha menyu sahifasiga o'tamiz.
                if (!isSubOpen) {
                    toggleSubMenu(item.label);
                }
                navigate(item.route);
            }
        };

        return (
            <div>
                <div
                    onClick={handleParentClick}
                    style={{ marginLeft: `${indent}px`, paddingLeft: `${basePadding}px` }}
                    className={`relative text-white text-base no-underline py-[5px] pr-[30px] leading-[40px] transition duration-300 ease flex items-center cursor-pointer border-l-4 ${isParentActive ? 'border-red-500 bg-red-500' : (isParentOpen ? 'border-red-500' : 'border-transparent hover:bg-[#33363a]')}`}
                >
                    {connectingLines}
                    {item.icon && <item.icon className={`mr-[10px] ${isParentActive ? 'text-white' : (isParentOpen ? 'text-red-500' : '')}`} />}
                    <span className="flex-1 truncate" title={item.label}>{item.label}</span>
                    <FaAngleRight className={`absolute right-[20px] transition-transform duration-300 ${isSubOpen ? 'rotate-90' : ''}`} />
                </div>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubOpen ? 'max-h-[999px]' : 'max-h-0'}`}>
                    <div className="bg-[#262627]">
                        {item.subItems.map((subItem) => (
                            <SidebarItem
                                key={subItem.label}
                                item={subItem}
                                level={level + 1}
                                isParentOpen={isSubOpen}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Agar oddiy menyu bandi bo'lsa (ichki menyusi yo'q)
    return (
        <NavLink
            to={item.route}
            style={{ marginLeft: `${indent}px`, paddingLeft: `${basePadding}px` }}
            className={({ isActive }) => `relative text-white text-base no-underline flex items-center leading-[40px] transition duration-300 ease border-l-4 ${isActive || isParentOpen ? 'border-red-500' : 'border-transparent hover:bg-red-600'} ${isActive ? 'bg-red-500' : ''}`}
        >
            {connectingLines}
            {item.icon && <item.icon className="mr-[10px]" />}
            <span className="truncate flex-1" title={item.label}>{item.label}</span>
        </NavLink>
    );
});