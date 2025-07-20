// src/components/ui/Button.tsx
// Universal Button komponenti: Barcha tugmalar uchun umumiy, reusable.
// Avto-qo'shiladigan: cursor-pointer, hover effekti, disabled holati.
// Ishlatish: <Button onClick={handle}>Matn</Button>

import React, {type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;  // Tugma ichidagi kontent
    className?: string;  // Qo'shimcha class'lar
    disabled?: boolean;  // O'chirish
}

const Button: React.FC<ButtonProps> = ({ children, className = '', disabled = false, ...props }) => {
    return (
        <button
            className={`px-6 py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
            disabled={disabled}
            {...props}  // Boshqa props'larni (onClick, type va h.k.) o'tkazish
        >
            {children}
        </button>
    );
};

export default Button;