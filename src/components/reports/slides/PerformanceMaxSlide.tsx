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

    return (
        <div className="h-full flex flex-col p-8 bg-white" style={{
            fontFamily: design?.typography?.fontFamily || 'Inter, sans-serif',
            color: design?.colorScheme?.text || '#111827'
        }}>
            {/* Header / Badge */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-200">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Performance Max</h3>
                        <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                            {data.campaignName} • {data.assetGroupName}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* Visual Assets Column (Left - 7 cols) */}
                <div className="col-span-7 flex flex-col gap-4 min-h-0">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutGrid size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Visual Assets</span>
                    </div>

                    {/* Main Hero Image */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 group">
                        {mainImage ? (
                            <img
                                src={mainImage.url}
                                alt="Main Asset"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                crossOrigin="anonymous" // Attempt to handle CORS if proxy is not standard
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
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
                            <div key={idx} className="relative rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-50 group aspect-square">
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
                            <div key={`empty-${idx}`} className="rounded-lg bg-gray-50 border border-gray-100 border-dashed flex items-center justify-center">
                                <ImageIcon size={20} className="text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Text Assets Column (Right - 5 cols) */}
                <div className="col-span-5 flex flex-col gap-6 overflow-y-auto pr-1">

                    {/* Headlines */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <TypeIcon size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Headlines</span>
                        </div>
                        <div className="space-y-2">
                            {data.headlines.slice(0, 5).map((headline, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 text-sm font-medium text-gray-800 shadow-sm">
                                    {headline}
                                </div>
                            ))}
                            {data.headlines.length === 0 && (
                                <div className="text-sm text-gray-400 italic">No headlines found</div>
                            )}
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <TypeIcon size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Descriptions</span>
                        </div>
                        <div className="space-y-2">
                            {data.descriptions.slice(0, 3).map((desc, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500 text-sm text-gray-600 shadow-sm">
                                    {desc}
                                </div>
                            ))}
                            {data.descriptions.length === 0 && (
                                <div className="text-sm text-gray-400 italic">No descriptions found</div>
                            )}
                        </div>
                    </div>

                    {/* Final URL */}
                    {data.finalUrl && (
                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Destination</div>
                            <div className="text-xs text-blue-600 truncate font-mono bg-blue-50 px-2 py-1 rounded inline-block max-w-full">
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
