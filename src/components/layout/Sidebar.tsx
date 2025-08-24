// src/components/layout/Sidebar.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLayoutEffect, memo, useMemo } from "react";
import { FaAngleRight } from "react-icons/fa";
import logoImage from "@/assets/brb_logo_with_name_white.png";

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
        <nav
            className={`fixed top-0 left-0 h-full w-[280px] bg-[#1b1a1b] text-white overflow-y-auto transition-transform duration-300 ease-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } [&::-webkit-scrollbar]:w-0`}
            aria-label="Asosiy navigatsiya"
        >
            {/* Header: logo + title vertikal markazda */}
            <header className="bg-[#33363a] sticky top-0 z-10 h-28 p-0 m-0 flex flex-col items-center justify-center">
                <img
                    src={logoImage}
                    alt="AuditQR logo"
                    className="w-[200px] block mx-auto"
                />
                <h1 className="text-center font-medium text-[25px] leading-tight font-sans tracking-[2px] text-red-500 m-0 mt-2">
                    AuditQR
                </h1>
            </header>

            {/* Menu */}
            <div className="menu w-full mt-[18px]">{memoizedNav}</div>
        </nav>
    );
}

interface SidebarItemProps {
    item: NavItem;
    level?: number;
    isParentOpen?: boolean;
}

const SidebarItem = memo(function SidebarItem({
                                                  item,
                                                  level = 0,
                                                  isParentOpen = false,
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

    const indent = level * 20;
    const basePadding = 25;

    const connectingLines =
        level > 0 ? (
            <>
        <span
            className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#2b2b2c]"
            aria-hidden="true"
        />
                <span
                    className="absolute left-0 top-[20px] w-[14px] h-[2px] bg-[#2b2b2c]"
                    aria-hidden="true"
                />
            </>
        ) : null;

    if (item.subItems && item.subItems.length > 0) {
        const handleParentClick = () => {
            if (location.pathname === item.route) {
                toggleSubMenu(item.label);
            } else {
                if (!isSubOpen) toggleSubMenu(item.label);
                navigate(item.route);
            }
        };

        return (
            <div>
                <div
                    onClick={handleParentClick}
                    style={{ marginLeft: `${indent}px`, paddingLeft: `${basePadding}px` }}
                    className={`relative py-[6px] pr-[30px] leading-[40px] flex items-center cursor-pointer border-l-4 transition ${
                        isParentActive
                            ? "border-red-500 bg-red-500"
                            : isParentOpen
                                ? "border-red-500"
                                : "border-transparent hover:bg-[#33363a]"
                    }`}
                    role="button"
                    aria-expanded={isSubOpen}
                    aria-controls={`submenu-${item.label}`}
                    title={item.label}
                >
                    {connectingLines}
                    {item.icon && (
                        <item.icon
                            className={`mr-[10px] ${
                                isParentActive ? "text-white" : isParentOpen ? "text-red-500" : ""
                            }`}
                        />
                    )}
                    <span className="flex-1 truncate" title={item.label}>
            {item.label}
          </span>
                    <FaAngleRight
                        className={`absolute right-[20px] transition-transform duration-300 ${
                            isSubOpen ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                    />
                </div>

                <div
                    id={`submenu-${item.label}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isSubOpen ? "max-h-[999px]" : "max-h-0"
                    }`}
                    aria-hidden={!isSubOpen}
                >
                    <div className="bg-[#262627]">
                        {item.subItems.map((sub) => (
                            <SidebarItem
                                key={sub.label}
                                item={sub}
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
            className={({ isActive }) =>
                `relative text-white text-[15px] no-underline flex items-center leading-[40px] border-l-4 transition ${
                    isActive || isParentOpen
                        ? "border-red-500"
                        : "border-transparent hover:bg-red-600"
                } ${isActive ? "bg-red-500" : ""}`
            }
            title={item.label}
        >
            {connectingLines}
            {item.icon && <item.icon className="mr-[10px]" />}
            <span className="truncate flex-1" title={item.label}>
        {item.label}
      </span>
        </NavLink>
    );
});
