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

    // Fullscreen toggle
    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
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
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Header / Controls (visible on hover or always if not fullscreen?) let's keep it visible but subtle */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-b from-black/50 to-transparent">
                <div className="text-white/80 font-medium">
                    {currentSlideIndex + 1} / {totalSlides}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
                    >
                        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        title="Fermer"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Slide Container */}
            <div className="flex-1 w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlideIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-video bg-white shadow-2xl relative overflow-hidden"
                    >
                        {/* We reuse the specific ReadOnlyRenderer, ensuring design props are passed */}
                        <div className="w-full h-full transform scale-100 origin-top-left">
                            <TiptapReadOnlyRenderer
                                content={getCurrentSlideContent()}
                                design={report.design}
                                accountId={report.accountId}
                                campaignIds={report.campaignIds}
                                reportId={report.id}
                                clientId={report.clientId}
                                userId={report.userId}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all ${currentSlideIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-50 hover:opacity-100'}`}
            >
                <ChevronLeft size={48} />
            </button>

            <button
                onClick={goToNextSlide}
                disabled={currentSlideIndex === totalSlides - 1}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all ${currentSlideIndex === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-50 hover:opacity-100'}`}
            >
                <ChevronRight size={48} />
            </button>
        </div>
    );
};
