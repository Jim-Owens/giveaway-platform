import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
};

export function Button({ variant = 'primary', fullWidth, className = '', children, ...props }: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
    const widthClass = fullWidth ? 'btn-block' : '';

    return (
        <button className={`${baseClass} ${variantClass} ${widthClass} ${className}`.trim()} {...props}>
            {children}
        </button>
    );
}
