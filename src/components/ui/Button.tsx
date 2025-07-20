// src/components/ui/Button.tsx
// Universal Button komponenti: Barcha tugmalar uchun umumiy, reusable.
// Avto-qo'shiladigan: cursor-pointer, hover effekti, disabled holati.
// Variant'lar: predefined turlar (primary, secondary, danger) bilan stillar belgilash.
// Ishlatish: <Button variant="primary" onClick={handle}>Matn</Button>
// Best practice: Variant prop bilan rang va stillarni oldindan belgilash (className o'rniga).

import React, {type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;  // Tugma ichidagi kontent
    variant?: 'primary' | 'secondary' | 'danger';  // Tugma turi (default: primary)
    disabled?: boolean;  // O'chirish
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', disabled = false, ...props }) => {
    // Variant bo'yicha stillarni belgilash
    let baseClass = 'px-6 py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg';
    switch (variant) {
        case 'primary':
            baseClass += ' bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700';
            break;
        case 'secondary':
            baseClass += ' bg-gray-300 text-gray-800 hover:bg-gray-400';
            break;
        case 'danger':
            baseClass += ' bg-red-300 text-gray-800 hover:bg-red-400';
            break;
        default:
            baseClass += ' bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700';  // Default primary
    }

    return (
        <button
            className={`${baseClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={disabled}
            {...props}  // Boshqa props'larni (onClick, type va h.k.) o'tkazish
        >
            {children}
        </button>
    );
};

export default Button;