import React, { forwardRef } from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const inputId = id || props.name || Math.random().toString(36).slice(2);

        return (
            <div className="input-group">
                {label && <label htmlFor={inputId} className="input-label">{label}</label>}
                <textarea
                    id={inputId}
                    ref={ref}
                    className={`input-field textarea-field ${className}`.trim()}
                    {...props}
                />
                {error && <span style={{ color: 'var(--color-secondary)', fontSize: '0.875rem' }}>{error}</span>}
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';
