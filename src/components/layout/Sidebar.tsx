// src/components/layout/Sidebar.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLayoutEffect, memo, useMemo } from "react";
import { FaAngleRight } from "react-icons/fa";

import { useSidebar } from "@/context/SidebarContext";
import { navItems, type NavItem } from "@/config/navConfig";

/* Aktiv route uchun parentlarni topish (auto-open) */
function findParentsForRoute(
    items: NavItem[],
    targetRoute: string,
    currentParents: string[] = []
): string[] {
    for (const item of items) {
        if (item.route === targetRoute && item.subItems) {
            return [...currentParents, item.label];
        }
        if (item.subItems) {
            const found = findParentsForRoute(item.subItems, targetRoute, [
                ...currentParents,
                item.label,
            ]);
            if (found.length > 0) return found;
        }
    }
    const directParent = items.find((i) =>
        i.subItems?.some((sub) => sub.route === targetRoute)
    );
    return directParent ? [...currentParents, directParent.label] : [];
}


interface SidebarProps {
    isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
    const location = useLocation();
    const { setOpenedSubMenus } = useSidebar();

    useLayoutEffect(() => {
        const parents = findParentsForRoute(navItems, location.pathname);
        if (parents.length > 0) {
            setOpenedSubMenus((prev) => {
                const s = new Set(prev);
                parents.forEach((p) => s.add(p));
                return Array.from(s);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const memoizedNav = useMemo(
        () => navItems.map((item) => <SidebarItem key={item.label} item={item} />),
        []
    );

    return (
        <aside
            className={`fixed top-0 left-0 h-full w-[280px] bg-white shadow-md flex flex-col transition-transform duration-300 ease-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            aria-label="Asosiy navigatsiya"
        >
            {/* Header: Topbar bilan bir xil balandlikda */}
            <header className="h-16 flex items-center px-4 border-b">
                <div className="text-xl font-bold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>AuditQR</span>
                </div>
            </header>

            {/* Menu */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {memoizedNav}
            </nav>

            {/* Footer: Foydalanuvchi profili */}
            <footer className="p-4 border-t">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                        JD
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">John Doe</p>
                        <p className="text-xs text-gray-500">Senior Auditor</p>
                    </div>
                </div>
            </footer>
        </aside>
    );
}

interface SidebarItemProps {
    item: NavItem;
    level?: number;
}

const SidebarItem = memo(function SidebarItem({
                                                  item,
                                                  level = 0,
                                              }: SidebarItemProps) {
    const { openedSubMenus, toggleSubMenu } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

    const isParentActive = useMemo(() => {
        const isAnySubItemActive = (navItem: NavItem): boolean =>
            navItem.subItems?.some(
                (sub) => location.pathname === sub.route || isAnySubItemActive(sub)
            ) || false;
        return location.pathname === item.route || isAnySubItemActive(item);
    }, [location.pathname, item]);

    const isSubOpen = openedSubMenus.includes(item.label);
    const indent = level * 16;

    if (item.subItems && item.subItems.length > 0) {
        const handleParentClick = () => {
            if (item.route && location.pathname !== item.route) {
                navigate(item.route);
            }
            toggleSubMenu(item.label);
        };

        return (
            <div>
                <div
                    onClick={handleParentClick}
                    style={{ paddingLeft: `${16 + indent}px` }}
                    className={`flex items-center py-3 text-sm rounded-md cursor-pointer transition-colors duration-200 ${
                        isParentActive
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    role="button"
                    aria-expanded={isSubOpen}
                    title={item.label}
                >
                    {item.icon && (
                        <item.icon className={`h-5 w-5 mr-3 ${isParentActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                    )}
                    <span className="flex-1 truncate">{item.label}</span>
                    <FaAngleRight
                        className={`h-4 w-4 mr-3 transition-transform duration-300 ${isSubOpen ? "rotate-90" : ""}`}
                    />
                </div>
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isSubOpen ? "max-h-[999px]" : "max-h-0"
                    }`}
                >
                    <div className="pt-1 space-y-1">
                        {item.subItems.map((sub) => (
                            <SidebarItem key={sub.label} item={sub} level={level + 1} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <NavLink
            to={item.route}
            style={{ paddingLeft: `${16 + indent}px` }}
            className={({ isActive }) =>
                `flex items-center py-3 text-sm rounded-md transition-colors duration-200 ${
                    isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                }`
            }
            title={item.label}
        >
            {({ isActive }) => (
                <>
                    {item.icon && (
                        <item.icon
                            className={`h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
                        />
                    )}
                    <span className="truncate flex-1">{item.label}</span>
                </>
            )}
        </NavLink>
    );
});