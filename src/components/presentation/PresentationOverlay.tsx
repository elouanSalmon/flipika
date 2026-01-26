import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { TiptapReadOnlyRenderer } from '../editor/TiptapReadOnlyRenderer';
import type { EditableReport } from '../../types/reportTypes';
import { AnimatePresence, motion } from 'framer-motion';

interface PresentationOverlayProps {
    report: EditableReport;
    onClose: () => void;
    initialSlideIndex?: number;
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
    report,
    onClose,
    initialSlideIndex = 0,
}) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Filter content to get only slides
    const slides = React.useMemo(() => {
        if (!report.content || !Array.isArray(report.content.content)) return [];
        return report.content.content.filter((node: any) => node.type === 'slide');
    }, [report.content]);

    const totalSlides = slides.length;

    // Navigation handlers
    const goToNextSlide = useCallback(() => {
        if (currentSlideIndex < totalSlides - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    }, [currentSlideIndex, totalSlides]);

    const goToPrevSlide = useCallback(() => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    }, [currentSlideIndex]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                goToNextSlide();
            } else if (e.key === 'ArrowLeft') {
                goToPrevSlide();
            } else if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNextSlide, goToPrevSlide, onClose]);

    const containerRef = React.useRef<HTMLDivElement>(null);

    // Fullscreen toggle
    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                if (containerRef.current) {
                    await containerRef.current.requestFullscreen();
                }
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Helper to construct a valid document structure for a single slide
    const getCurrentSlideContent = () => {
        const currentSlide = slides[currentSlideIndex];
        if (!currentSlide) return { type: 'doc', content: [] };

        return {
            type: 'doc',
            content: [currentSlide]
        };
    };

    if (totalSlides === 0) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-3xl pointer-events-none" />

            {/* Header Controls - Glassmorphism */}
            <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 transition-all duration-300 ${isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                {/* Slide Counter Pill */}
                <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90 font-medium text-sm shadow-lg">
                    {currentSlideIndex + 1} / {totalSlides}
                </div>

                {/* Actions Group */}
                <div className="flex gap-3">
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full transition-all duration-200 shadow-lg group"
                        title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-3 text-white/80 hover:text-red-400 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full transition-all duration-200 shadow-lg"
                        title="Fermer"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Slide Container - Maximized */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlideIndex}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-video relative overflow-hidden shadow-2xl"
                        style={{
                            boxShadow: '0 0 0 1px rgba(0,0,0,1)' // Thin border to define edge against black
                        }}
                    >
                        {/* Scalable Renderer Container */}
                        <SlideScaler>
                            <TiptapReadOnlyRenderer
                                content={getCurrentSlideContent()}
                                design={report.design}
                                accountId={report.accountId}
                                campaignIds={report.campaignIds}
                                reportId={report.id}
                                clientId={report.clientId}
                                userId={report.userId}
                                startDate={report.startDate}
                                endDate={report.endDate}
                            />
                        </SlideScaler>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows - Glassmorphism, Floating */}
            {/* Previous */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40">
                <button
                    onClick={goToPrevSlide}
                    disabled={currentSlideIndex === 0}
                    className={`p-4 text-white hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group ${currentSlideIndex === 0 ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100 translate-x-0'}`}
                >
                    <ChevronLeft size={32} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Next */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40">
                <button
                    onClick={goToNextSlide}
                    disabled={currentSlideIndex === totalSlides - 1}
                    className={`p-4 text-white hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 group ${currentSlideIndex === totalSlides - 1 ? 'opacity-0 pointer-events-none -translate-x-10' : 'opacity-100 translate-x-0'}`}
                >
                    <ChevronRight size={32} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Keyboard Hint - Fade out */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/5 text-white/40 text-xs font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none">
                Utilisez les flèches ← → pour naviguer
            </div>
        </div>
    );
};

// Helper component to scale slide content
const SlideScaler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                // We know the slide defines specific dimensions (960x540)
                // But the container is aspect-ratio locked to 16:9 so we can just scale by width
                const scaleX = width / 960;
                const scaleY = height / 540;
                // Use the smaller scale to ensure fit (though in 16:9 they should be identical)
                setScale(Math.min(scaleX, scaleY));
            }
        };

        // Initial calculate
        updateScale();

        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden">
            <div
                style={{
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: 'center center',
                    width: '960px',
                    height: '540px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                }}
            >
                {children}
            </div>
        </div>
    );
};
