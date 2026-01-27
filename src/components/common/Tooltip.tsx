import React, { useEffect, useRef } from 'react';
import tippy from 'tippy.js';
import type { Instance as TippyInstance, Props as TippyProps } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import './Tooltip.css';

interface TooltipProps {
    content: string | React.ReactNode;
    children: React.ReactElement;
    options?: Partial<TippyProps>;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, options = {}, className }) => {
    const triggerRef = useRef<Element>(null);
    const instanceRef = useRef<TippyInstance | null>(null);

    useEffect(() => {
        if (triggerRef.current) {
            instanceRef.current = tippy(triggerRef.current, {
                content: content as string | Element, // Type assertion for tippy compatibility
                delay: [300, 0], // 300ms show delay, 0ms hide delay as requested
                arrow: false,
                offset: [0, 6],
                theme: 'flipika-v2',
                placement: 'top',
                animation: 'shift-away',
                ...options,
            });
        }

        return () => {
            if (instanceRef.current) {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }
        };
    }, []);

    // Update content dynamically
    useEffect(() => {
        if (instanceRef.current) {
            instanceRef.current.setContent(content as string | Element);
        }
    }, [content]);

    // Update options dynamically
    useEffect(() => {
        if (instanceRef.current && options) {
            instanceRef.current.setProps(options);
        }
    }, [options]);

    // Clone child to attach ref
    return React.cloneElement(children as React.ReactElement<any>, {
        ref: (node: Element) => {
            triggerRef.current = node;
            // Handle existing ref if present on children
            const childRef = (children as any).ref;
            if (typeof childRef === 'function') {
                childRef(node);
            } else if (childRef) {
                childRef.current = node;
            }
        },
        className: className ? `${(children.props as any).className || ''} ${className}` : (children.props as any).className
    });
};
