// src/context/SidebarContext.tsx

import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface SidebarContextType {
    openedSubMenus: string[];
    toggleSubMenu: (label: string) => void;
    allowMultipleOpen: boolean;
    setAllowMultipleOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default function SidebarProvider({ children }: { children: ReactNode }) {
    const [openedSubMenus, setOpenedSubMenus] = useState<string[]>([]);
    // Standart holatda bir vaqtda faqat bitta menyu ochiq bo'lishi mumkin.
    // Bir nechta menyuni ochishga ruxsat berish uchun `setAllowMultipleOpen(true)` chaqiriladi.
    const [allowMultipleOpen, setAllowMultipleOpen] = useState<boolean>(false);

    // `useCallback` yordamida funksiyani keshlaymiz.
    // Bu `toggleSubMenu` funksiyasini `useEffect` kabi hooklarda xavfsiz ishlatish imkonini beradi.
    const toggleSubMenu = useCallback((label: string) => {
        setOpenedSubMenus((prev) => {
            const isOpened = prev.includes(label);
            if (isOpened) {
                // Agar ochiq bo'lsa, yopamiz
                return prev.filter((l) => l !== label);
            } else {
                // Agar yopiq bo'lsa, ochamiz
                if (allowMultipleOpen) {
                    // Bir nechta menyu ochiq bo'lishiga ruxsat berilgan bo'lsa, massivga qo'shamiz
                    return [...prev, label];
                } else {
                    // Aks holda, faqat shu menyuni ochiq qoldiramiz
                    return [label];
                }
            }
        });
    }, [allowMultipleOpen]); // `allowMultipleOpen` o'zgargandagina funksiya qayta yaratiladi.

    const value = { openedSubMenus, toggleSubMenu, allowMultipleOpen, setAllowMultipleOpen };

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