// src/components/ui/Button.tsx
// Universal Button komponenti: Barcha tugmalar uchun umumiy, reusable.
// Yangi: isLoading holatini qo'llab-quvvatlaydi. Yuklanayotganda spinner ko'rsatadi va tugmani o'chiradi.
// Avto-qo'shiladigan: cursor-pointer, hover effekti, disabled holati, focus ring.
// Variant'lar: predefined turlar (primary, secondary, danger) bilan stillar belgilash.
// Best practice: Variant prop bilan rang va stillarni oldindan belgilash.

import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;                  // Tugma ichidagi kontent
    variant?: 'primary' | 'secondary' | 'danger'; // Tugma turi (default: primary)
    isLoading?: boolean;                        // YANGI: Yuklanish holati uchun prop
    // disabled prop'i ButtonHTMLAttributes'dan keladi, qayta e'lon qilish shart emas.
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           isLoading = false, // isLoading'ni props'dan olamiz, default qiymati false
                                           disabled = false,
                                           className, // Tashqaridan kelishi mumkin bo'lgan qo'shimcha klasslar uchun
                                           ...props
                                       }) => {
    // Variant bo'yicha stillarni belgilash (focus ring'lar bilan birga)
    let variantClass = '';
    switch (variant) {
        case 'primary':
            variantClass = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
            break;
        case 'secondary':
            variantClass = 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-500';
            break;
        case 'danger':
            variantClass = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
            break;
        default:
            variantClass = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }

    // Tugma o'chirilgan bo'lishi kerakmi? (tashqaridan kelgan disabled yoki isLoading holati)
    const isDisabled = isLoading || disabled;

    return (
        <button
            // Barcha klasslarni birlashtiramiz
            className={`
                px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 
                transition-all duration-200 flex items-center justify-center
                ${variantClass} 
                ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            // Tugmani o'chirish
            disabled={isDisabled}
            {...props}  // Boshqa props'larni (onClick, type va h.k.) o'tkazish
        >
            {isLoading ? (
                <>
                    {/* Yuklanish animatsiyasi (spinner) */}
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {children}
                </>
            ) : (
                // Agar yuklanmayotgan bo'lsa, oddiy kontentni ko'rsatish
                children
            )}
        </button>
    );
};

export default Button;