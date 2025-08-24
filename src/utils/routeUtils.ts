import { navItems, type NavItem } from '@/config/navConfig';

/**
 * Berilgan `pathname` bo'yicha navigatsiya ierarxiyasini (breadcrumb yo'lini) topadi.
 * @param pathname Joriy URL manzili.
 * @returns Topilgan NavItem obyektlaridan iborat massiv.
 */
export const findBreadcrumbTrail = (pathname: string): NavItem[] => {
    const findPath = (items: NavItem[], currentPath: string): NavItem[] | null => {
        for (const item of items) {
            if (item.route === currentPath) {
                return [item];
            }
            if (item.subItems) {
                const subPath = findPath(item.subItems, currentPath);
                if (subPath) {
                    return [item, ...subPath];
                }
            }
        }
        return null;
    };

    return findPath(navItems, pathname) || [];
};