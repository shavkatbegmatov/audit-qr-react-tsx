import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SidebarContextType {
    openedSubMenus: string[];
    toggleSubMenu: (label: string) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [openedSubMenus, setOpenedSubMenus] = useState<string[]>(() => {
        const stored = localStorage.getItem('openedSubMenus');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('openedSubMenus', JSON.stringify(openedSubMenus));
    }, [openedSubMenus]);

    const toggleSubMenu = (label: string) => {
        setOpenedSubMenus((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
    };

    return (
        <SidebarContext.Provider value={{ openedSubMenus, toggleSubMenu }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};