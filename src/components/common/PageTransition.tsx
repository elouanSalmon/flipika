import React, { useState, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const { pathname } = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    // Use useLayoutEffect to run before browser paint to prevent flash of content at wrong scroll position
    useLayoutEffect(() => {
        // Start loading immediately
        setIsLoading(true);

        // Force scroll to top instantly
        window.scrollTo(0, 0);

        // Keep loading state for a bit to ensure clean transition
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg-primary)]"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 
              Hide content while loading to prevent "flash of unstyled/scrolled content".
              This ensures animations don't trigger until we are confirmed at the top.
            */}
            <div style={{ display: isLoading ? 'none' : 'block' }}>
                {children}
            </div>
        </>
    );
};

export default PageTransition;
