import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
    html: string;
    className?: string;
    tag?: React.ElementType;
}

/**
 * SafeHTML Component - Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify to clean potentially dangerous HTML before rendering
 */
export const SafeHTML: React.FC<SafeHTMLProps> = ({
    html,
    className,
    tag: Tag = 'div'
}) => {
    const sanitizedHTML = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
    });

    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
    );
};
