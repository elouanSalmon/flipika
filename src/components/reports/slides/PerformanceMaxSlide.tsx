import React, { useMemo } from 'react';
import type { ReportDesign } from '../../../types/reportTypes';
import { Zap, LayoutGrid, Image as ImageIcon, Type as TypeIcon } from 'lucide-react';

interface PerformanceMaxSlideProps {
    data: {
        headlines: string[];
        descriptions: string[];
        images: { url: string; ratio: 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE' }[];
        finalUrl?: string;
        campaignName: string;
        assetGroupName: string;
    };
    design: ReportDesign;
}

const PerformanceMaxSlide: React.FC<PerformanceMaxSlideProps> = ({ data, design }) => {
    // Organize images by ratio using useMemo for performance
    const organizedImages = useMemo(() => {
        return {
            landscape: data.images.filter(img => img.ratio === 'LANDSCAPE'),
            square: data.images.filter(img => img.ratio === 'SQUARE'),
            portrait: data.images.filter(img => img.ratio === 'PORTRAIT'),
        };
    }, [data.images]);

    // Construct a "Best Combination" layout
    // Usually PMax optimizes, but for static report we show diverse assets
    const mainImage = organizedImages.landscape[0] || organizedImages.square[0] || data.images[0];
    const secondaryImages = [
        ...organizedImages.square.slice(0, 2),
        ...organizedImages.portrait.slice(0, 1)
    ].filter(img => img !== mainImage).slice(0, 3);

    // Theme helpers
    const isDark = design?.mode === 'dark';
    const bgColor = design?.colorScheme?.background || '#ffffff';
    const textColor = design?.colorScheme?.text || '#050505';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f6f6f7';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
    // Removed shadows as requested

    return (
        <div className="h-full flex flex-col p-4" style={{
            fontFamily: design?.typography?.fontFamily || 'DM Sans, sans-serif',
            color: textColor,
            backgroundColor: bgColor,
        }}>
            {/* Campaign & Asset Group Info */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-primary" />
                    <p className="text-xs font-medium tracking-wide uppercase" style={{ color: design?.colorScheme?.secondary || '#6b6e77' }}>
                        {data.campaignName} • {data.assetGroupName}
                    </p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* Visual Assets Column (Left - 7 cols) */}
                <div className="col-span-7 flex flex-col gap-4 min-h-0">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutGrid size={14} style={{ color: design?.colorScheme?.secondary || '#8e9199' }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: design?.colorScheme?.secondary || '#8e9199' }}>Top Visual Assets</span>
                    </div>

                    {/* Main Hero Image */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden group" style={{
                        backgroundColor: cardBg,
                        border: `1px solid ${borderColor}`,
                    }}>
                        {mainImage ? (
                            <img
                                src={mainImage.url}
                                alt="Main Asset"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                crossOrigin="anonymous" // Attempt to handle CORS if proxy is not standard
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-400">
                                <ImageIcon size={48} className="opacity-20" />
                            </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-1 rounded">
                            Suggested Hero
                        </div>
                    </div>

                    {/* Secondary Images Grid */}
                    <div className="grid grid-cols-3 gap-4 grow">
                        {secondaryImages.map((img, idx) => (
                            <div key={idx} className="relative rounded-lg overflow-hidden group aspect-square" style={{
                                backgroundColor: cardBg,
                                border: `1px solid ${borderColor}`,
                            }}>
                                <img
                                    src={img.url}
                                    alt={`Asset ${idx}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        ))}
                        {/* Fillers if not enough images */}
                        {Array.from({ length: 3 - secondaryImages.length }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="rounded-lg border-dashed flex items-center justify-center" style={{
                                backgroundColor: cardBg,
                                borderColor: borderColor,
                                border: `1px dashed ${borderColor || 'var(--color-border)'}`
                            }}>
                                <ImageIcon size={20} style={{ opacity: 0.3 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Text Assets Column (Right - 5 cols) */}
                <div className="col-span-5 flex flex-col gap-6 overflow-y-auto pr-1">

                    {/* Headlines */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <TypeIcon size={14} style={{ color: design?.colorScheme?.secondary || '#8e9199' }} />
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: design?.colorScheme?.secondary || '#8e9199' }}>Top Headlines</span>
                        </div>
                        <div className="space-y-2">
                            {data.headlines.slice(0, 5).map((headline, idx) => (
                                <div key={idx} className="p-3 rounded-lg border-l-4 border-primary text-sm font-medium" style={{
                                    backgroundColor: cardBg,
                                    color: textColor,
                                    boxShadow: 'none'
                                }}>
                                    {headline}
                                </div>
                            ))}
                            {data.headlines.length === 0 && (
                                <div className="text-sm italic" style={{ color: design?.colorScheme?.secondary || '#8e9199' }}>No headlines found</div>
                            )}
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <TypeIcon size={14} style={{ color: design?.colorScheme?.secondary || '#8e9199' }} />
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: design?.colorScheme?.secondary || '#8e9199' }}>Top Descriptions</span>
                        </div>
                        <div className="space-y-2">
                            {data.descriptions.slice(0, 3).map((desc, idx) => (
                                <div key={idx} className="p-3 rounded-lg border-l-4 border-purple-500 text-sm" style={{
                                    backgroundColor: cardBg,
                                    color: design?.colorScheme?.secondary || '#545660',
                                    boxShadow: 'none'
                                }}>
                                    {desc}
                                </div>
                            ))}
                            {data.descriptions.length === 0 && (
                                <div className="text-sm italic" style={{ color: design?.colorScheme?.secondary || '#8e9199' }}>No descriptions found</div>
                            )}
                        </div>
                    </div>

                    {/* Final URL */}
                    {data.finalUrl && (
                        <div className="mt-auto pt-4 border-t" style={{ borderColor: borderColor || 'rgba(0,0,0,0.05)' }}>
                            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: design?.colorScheme?.secondary || '#8e9199' }}>Destination</div>
                            <div className="text-xs text-primary truncate font-mono bg-primary-50 px-2 py-1 rounded inline-block max-w-full">
                                {data.finalUrl}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};


export default PerformanceMaxSlide;
