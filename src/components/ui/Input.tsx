import React, { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const inputId = id || props.name || Math.random().toString(36).slice(2);

        return (
            <div className="input-group">
                {label && <label htmlFor={inputId} className="input-label">{label}</label>}
                <input
                    id={inputId}
                    ref={ref}
                    className={`input-field ${className}`.trim()}
                    {...props}
                />
                {error && <span style={{ color: 'var(--color-secondary)', fontSize: '0.875rem' }}>{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';
