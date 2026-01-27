import React from 'react';
import { Tooltip } from './Tooltip';

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    tooltip?: string;
    isActive?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    icon,
    tooltip,
    isActive,
    className = '',
    onClick,
    onMouseDown,
    disabled,
    ...props
}) => {
    const button = (
        <button
            type="button"
            onClick={(e) => {
                // Prevent default form submission if any, but let propagation happen if needed (though usually we stop it)
                // In TiptapToolbar it was e.preventDefault(); e.stopPropagation();
                // We'll keep it simple here and let caller handle specifics if needed, 
                // but usually for toolbar buttons we want:
                e.preventDefault();
                onClick?.(e);
            }}
            onMouseDown={(e) => {
                // Prevent losing focus from editor
                e.preventDefault();
                onMouseDown?.(e);
            }}
            disabled={disabled}
            className={`${className} ${isActive ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}`}
            // Remove title from props if it exists to avoid native tooltip
            {...props}
        >
            {icon}
        </button>
    );

    if (tooltip) {
        return (
            <Tooltip content={tooltip}>
                {button}
            </Tooltip>
        );
    }

    return button;
};
