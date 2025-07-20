// src/components/ui/Button.tsx
// Universal Button komponenti: Barcha tugmalar uchun umumiy, reusable.
// Avto-qo'shiladigan: cursor-pointer, hover effekti, disabled holati, focus ring.
// Variant'lar: predefined turlar (primary, secondary, danger) bilan stillar belgilash.
// O'zgartirish: ConfirmModal dagi stillarga moslab, px-4 py-2, rounded-md, focus ring qo'shilgan.
// Primary: blue (Create kabi), Secondary: gray (Cancel kabi), Danger: red (Confirm kabi).
// Ishlatish: <Button variant="primary" onClick={handle}>Matn</Button>
// Best practice: Variant prop bilan rang va stillarni oldindan belgilash.

import React, {type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;  // Tugma ichidagi kontent
    variant?: 'primary' | 'secondary' | 'danger';  // Tugma turi (default: primary)
    disabled?: boolean;  // O'chirish
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', disabled = false, ...props }) => {
    // Variant bo'yicha stillarni belgilash
    let variantClass = '';
    switch (variant) {
        case 'primary':
            variantClass = 'bg-blue-600 text-white hover:bg-blue-700';
            break;
        case 'secondary':
            variantClass = 'bg-gray-300 text-gray-800 hover:bg-gray-400';
            break;
        case 'danger':
            variantClass = 'bg-red-600 text-white hover:bg-red-700';
            break;
        default:
            variantClass = 'bg-blue-600 text-white hover:bg-blue-700';  // Default primary
    }

    return (
        <button
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${variantClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:ring-${variant === 'secondary' ? 'gray' : variant}-500`}
            disabled={disabled}
            {...props}  // Boshqa props'larni (onClick, type va h.k.) o'tkazish
        >
            {children}
        </button>
    );
};

export default Button;