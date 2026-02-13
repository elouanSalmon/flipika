import React from 'react';
import { Building } from 'lucide-react';

interface ClientLogoAvatarProps {
    logo?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
};

const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
};

/**
 * ClientLogoAvatar - Displays a client logo with fallback to initials or icon
 */
const ClientLogoAvatar: React.FC<ClientLogoAvatarProps> = ({
    logo,
    name,
    size = 'sm',
    className = '',
}) => {
    const getInitials = (name?: string): string => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`;

    if (logo) {
        return (
            <div className={`${baseClasses} bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600`}>
                <img
                    src={logo}
                    alt={name || 'Client logo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Hide broken image and show fallback
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    const initials = getInitials(name);

    if (initials) {
        return (
            <div className={`${baseClasses} bg-primary/10 text-primary font-semibold`}>
                {initials}
            </div>
        );
    }

    return (
        <div className={`${baseClasses} bg-neutral-100 dark:bg-neutral-700 text-neutral-400`}>
            <Building size={iconSizes[size]} />
        </div>
    );
};

export default ClientLogoAvatar;
