// src/components/ui/UiButton.tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonColor = 'default' | 'danger';

interface UiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    color?: ButtonColor;
    className?: string;
}

const UiButton: React.FC<UiButtonProps> = ({
                                               children,
                                               variant = 'primary',
                                               size = 'md',
                                               color = 'default',
                                               className = '',
                                               ...props
                                           }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    // O'ZGARISH: `primary` varianti uchun `indigo` ranglari ishlatildi
    const variantClasses: Record<ButtonVariant, string> = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
        icon: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400 !p-2 rounded-full',
    };

    const colorClasses: Record<string, string> = {
        'icon-danger': 'text-red-600 hover:bg-red-50 focus:ring-red-500',
    };

    const combinedClassName = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${color === 'danger' && variant === 'icon' ? colorClasses['icon-danger'] : ''}
    ${className}
  `;

    return (
        <button className={combinedClassName.trim()} {...props}>
            {children}
        </button>
    );
};

export default UiButton;