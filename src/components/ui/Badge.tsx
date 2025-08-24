// src/components/ui/Badge.tsx
import React from 'react';

// Komponent qabul qiladigan 'props' turlarini aniqlaymiz
type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'secondary';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
                                         children,
                                         variant = 'secondary', // Standart variant
                                         className = '',
                                     }) => {
    // Variantga qarab mos keluvchi CSS klasslarini tanlaymiz
    const variantClasses: Record<BadgeVariant, string> = {
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-700',
    };

    // Asosiy, variantga bog'liq va qo'shimcha klasslarni birlashtiramiz
    const combinedClassName = `
    inline-flex 
    items-center 
    justify-center 
    px-2.5 
    py-0.5 
    rounded-full 
    text-xs 
    font-semibold 
    leading-tight
    ${variantClasses[variant]} 
    ${className}
  `;

    return (
        <span className={combinedClassName.trim()}>
      {children}
    </span>
    );
};

export default Badge;