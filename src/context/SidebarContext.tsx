// src/context/SidebarContext.tsx

import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface SidebarContextType {
    openedSubMenus: string[];
    setOpenedSubMenus: React.Dispatch<React.SetStateAction<string[]>>;
    toggleSubMenu: (label: string) => void;
    // Ko'p darajali menyular uchun bir nechta submenu ochiq bo'lishi qulay,
    // shuning uchun bu sozlamani saqlab qolamiz.
    allowMultipleOpen: boolean;
    setAllowMultipleOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default function SidebarProvider({ children }: { children: ReactNode }) {
    const [openedSubMenus, setOpenedSubMenus] = useState<string[]>([]);
    const [allowMultipleOpen, setAllowMultipleOpen] = useState<boolean>(true);

    // `useCallback` funksiyani keraksiz qayta yaratilishdan saqlaydi.
    // Bu, funksiya props sifatida uzatilganda optimizatsiya uchun muhim.
    const toggleSubMenu = useCallback((label: string) => {
        setOpenedSubMenus((prev) => {
            const isOpened = prev.includes(label);

            if (isOpened) {
                // Agar submenu allaqachon ochiq bo'lsa, uni yopamiz.
                return prev.filter((l) => l !== label);
            }

            // Agar yopiq bo'lsa, ochamiz.
            if (allowMultipleOpen) {
                // Bir nechta submenu ochiq bo'lishiga ruxsat berilgan bo'lsa, yangisini qo'shamiz.
                return [...prev, label];
            } else {
                // Aks holda, faqat shu submenuni ochiq qoldiramiz.
                return [label];
            }
        });
    }, [allowMultipleOpen]); // Faqat `allowMultipleOpen` o'zgarganda funksiya qayta yaratiladi.

    const value = { openedSubMenus, setOpenedSubMenus, toggleSubMenu, allowMultipleOpen, setAllowMultipleOpen };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};