import { NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { FaDesktop, FaTable, FaTh, FaCogs, FaAngleRight } from 'react-icons/fa';
import logoImage from '@/assets/brb_logo_with_name_white.png';
import { useSidebar } from '@/context/SidebarContext';
import React from "react";

interface NavItem {
    label: string;
    route: string;
    icon: React.ComponentType<{ className?: string }>;
    subItems?: { label: string; route: string }[];
}

const navItems: NavItem[] = [
    { label: 'Boshqaruv paneli', route: ROUTES.ROOT, icon: FaDesktop },
    {
        label: "Asosiy ma'lumotlar",
        route: ROUTES.REFERENCE,
        icon: FaTable,
        subItems: [
            { label: 'Audit obyekt turlari', route: ROUTES.AUDIT_OBJECT_TYPES },
            { label: 'Audit obyekt tarmog\'lari', route: ROUTES.AUDIT_OBJECT_BRANCH_NETWORKS },
            { label: 'Audit obyektlari', route: ROUTES.AUDIT_OBJECTS },
            { label: 'Bloklar', route: '/audit-object-types/sub3' },
            { label: 'Tarkibiy tuzilmalar', route: '/audit-object-types/sub4' },
            { label: 'Auditorlar', route: '/audit-object-types/sub5' },
            { label: 'Obyekt bo\'limlari', route: '/audit-object-types/sub6' },
            { label: 'Risklar reestri', route: '/audit-object-types/sub7' },
            { label: 'Qo\'shimcha reestrlar', route: '/audit-object-types/sub8' },
            { label: 'Aniqlangan holatlar reyestri', route: '/audit-object-types/sub9' },
        ]
    },
    { label: 'Audit Loglari', route: ROUTES.AUDIT_LOGS, icon: FaTh },
    {
        label: 'Xavfsizlik',
        route: ROUTES.ROLES,
        icon: FaCogs,
        subItems: [
            { label: 'Foydalanuvchilar', route: ROUTES.USERS },
            { label: 'Rollar', route: ROUTES.ROLES },
        ]
    },
];

interface SidebarProps {
    isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
    return (
        <nav
            className={`fixed
                        top-0
                        left-0
                        h-full
                        w-[250px] 
                        bg-[#1b1a1b] 
                        backdrop-blur-md 
                        text-white 
                        overflow-y-auto 
                        transition-all 
                        duration-[100ms] 
                        ease-in-out
                        ${isOpen ? 'left-0' : 'left-[-250px]'}
                        [&::-webkit-scrollbar]:w-0`}
        >
            <header className="bg-[#33363a]">
                <img
                    src={logoImage}
                    alt="Profile"
                    className="w-[200px] m-[15px]"
                />
                <h1 className="text-center
                               font-medium
                               text-[25px]
                               pb-[13px]
                               font-sans
                               tracking-[2px]
                               text-red-500"
                >AuditQR</h1>
            </header>
            <div className="menu w-full mt-[30px]">
                {navItems.map((item) => (
                    <SidebarItem key={item.route} item={item} />
                ))}
            </div>
        </nav>
    );
}

interface SidebarItemProps {
    item: NavItem;
}

function SidebarItem({ item }: SidebarItemProps) {
    const { openedSubMenus, toggleSubMenu } = useSidebar();
    const location = useLocation();
    const isParentActive = (
        location.pathname === item.route ||
        item.subItems?.some(
            sub => location.pathname === sub.route
        )
    );
    const isSubOpen = openedSubMenus.includes(item.label) || isParentActive;

    return (
        <div className="item relative cursor-pointer">
            {item.subItems ? (
                <div
                    className={`
                        text-white 
                        text-base 
                        no-underline 
                        py-[5px] 
                        ${isSubOpen ? 'border-l-8 border-red-500 pl-[22px]' : 'pl-[30px]'} 
                        pr-[30px] 
                        leading-[40px] 
                        hover:bg-[#33363a] 
                        transition 
                        duration-300 
                        ease 
                        flex 
                        items-center 
                        relative
                    `}
                >
                    <NavLink to={item.route} className="flex items-center">
                        <item.icon className={`
                            mr-[15px] 
                            ${isParentActive ? 'text-red-500' : ''}
                        `} />
                    </NavLink>
                    <span onClick={() => toggleSubMenu(item.label)} className="flex-1 cursor-pointer">
            {item.label}
          </span>
                    <span
                        className="
                            absolute
                            right-0
                            m-[20px]
                            transition duration-300 ease
                            flex items-center
                            cursor-pointer"
                        onClick={() => toggleSubMenu(item.label)}
                    >
            <FaAngleRight className={`${isSubOpen ? 'rotate-90' : ''}`} />
          </span>
                </div>
            ) : (
                <NavLink
                    to={item.route}
                    className={({ isActive }) => `
                        text-white 
                        text-base 
                        no-underline 
                        p-[5px_30px] 
                        leading-[40px] 
                        transition duration-300 ease 
                        flex items-center 
                        ${isActive ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-[#33363a]'}
                    `}
                >
                    <item.icon className="mr-[15px]" />
                    {item.label}
                </NavLink>
            )}
            {item.subItems && (
                <div
                    className={`
                        sub-menu 
                        bg-[#262627] 
                        overflow-hidden 
                        transition-all 
                        duration-300 ease 
                        ${isSubOpen ? 'max-h-[999px]' : 'max-h-0'}
                    `}
                >
                    {item.subItems.map((sub) => (
                        <NavLink
                            key={sub.route}
                            to={sub.route}
                            className={({ isActive }) => `
                                sub-item 
                                text-white 
                                text-base 
                                no-underline 
                                block 
                                pl-[36px] 
                                leading-[40px] 
                                hover:bg-red-600 
                                transition duration-300 ease 
                                border-l-4 border-red-500 
                                ${isActive ? 'bg-red-500' : 'hover:bg-red-200'}
                            `}
                        >
                            {sub.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}