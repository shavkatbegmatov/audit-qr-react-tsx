// src/components/Sidebar.tsx

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';
import logoImage from '@/assets/brb_logo_with_name_white.png';
import { useSidebar } from '@/context/SidebarContext';
import { useLayoutEffect, memo, useMemo } from "react";

// 1. O'ZGARISH: Markaziy konfiguratsiya faylidan NavItem interfeysi va navItems massivini import qilamiz.
import { navItems, type NavItem } from '@/config/navConfig';

// Bu funksiya marshrut bo'yicha ota-ona menyularni topadi.
// U endi import qilingan `navItems` bilan ishlaydi.
function findParentsForRoute(items: NavItem[], targetRoute: string, currentParents: string[] = []): string[] {
    for (const item of items) {
        if (item.route === targetRoute && item.subItems) {
            return [...currentParents, item.label];
        }

        if (item.subItems) {
            const found = findParentsForRoute(item.subItems, targetRoute, [...currentParents, item.label]);
            if (found.length > 0) {
                return found;
            }
        }
    }
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

    // Sahifa birinchi marta yuklanganda, aktiv menyuning ota-ona menyularini ochib qo'yish uchun.
    useLayoutEffect(() => {
        // 2. O'ZGARISH: Funksiya endi import qilingan `navItems` dan foydalanadi.
        const parents = findParentsForRoute(navItems, location.pathname);
        if (parents.length > 0) {
            setOpenedSubMenus((prev) => {
                const uniqueOpened = new Set(prev);
                parents.forEach((p) => uniqueOpened.add(p));
                return Array.from(uniqueOpened);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]); // `setOpenedSubMenus` o'zgarmas funksiya bo'lgani uchun dependencylardan olib tashlandi.

    // Menyu elementlarini `useMemo` bilan keshlaymiz.
    const memoizedNavItems = useMemo(() => {
        // 3. O'ZGARISH: `map` funksiyasi endi import qilingan `navItems` ustida ishlaydi.
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

// ===== SidebarItem Komponenti (O'ZGARISHLARSIZ QOLADI) =====

interface SidebarItemProps {
    item: NavItem; // Bu interfeys endi import qilinmoqda
    level?: number;
    isParentOpen?: boolean;
}

const SidebarItem = memo(function SidebarItem({ item, level = 0, isParentOpen = false }: SidebarItemProps) {
    const { openedSubMenus, toggleSubMenu } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

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

    if (item.subItems) {
        const handleParentClick = () => {
            if (location.pathname === item.route) {
                toggleSubMenu(item.label);
            } else {
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