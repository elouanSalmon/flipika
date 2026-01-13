import React from 'react';
import type { ReportDesign } from '../../../types/reportTypes';
import { Search, Globe, MoreVertical } from 'lucide-react';

interface SearchAdSlideProps {
    data: {
        headlines: string[];
        descriptions: string[];
        displayUrl: string;
        finalUrl: string;
    };
    design: ReportDesign;
}

const SearchAdSlide: React.FC<SearchAdSlideProps> = ({ data, design }) => {
    // Construct mockup titles
    // Google Ads usually combines up to 3 headlines separated by pipes " | " or dashes " - "
    // We'll simulate this behavior
    const title = data.headlines.slice(0, 3).join(' | ');
    const description = data.descriptions.slice(0, 2).join(' ');

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50" style={{
            fontFamily: design.typography.fontFamily,
            color: design.colorScheme.text
        }}>
            {/* Google Search Result Mockup Card */}
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-100 p-6">

                {/* Mobile Header Mockup (Optional, adds realism) */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Globe size={16} />
                    </div>
                </div>

                {/* Ad Label & URL */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-gray-900">Sponsoris&eacute;</span>
                    <span className="text-gray-400 text-[10px]">&bull;</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                            {/* Favicon placeholder */}
                            {data.displayUrl.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{data.displayUrl}</span>
                        <MoreVertical size={12} className="text-gray-400 ml-1" />
                    </div>
                </div>

                {/* Ad Title */}
                <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-normal mb-1">
                    {title || 'Titre de l\'annonce manquant'}
                </h3>

                {/* Ad Description */}
                <p className="text-sm text-[#4d5156] leading-relaxed max-w-2xl">
                    {description || 'Description de l\'annonce manquante...'}
                </p>

                {/* Sitelinks Mockup (Visual decoration) */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                    {['Contactez-nous', 'Nos Services', 'Demander un Devis'].map((link, i) => (
                        <span key={i} className="text-sm text-[#1a0dab] hover:underline cursor-pointer">
                            {link}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8 w-full max-w-3xl">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Headlines Pool</h4>
                    <div className="space-y-2">
                        {data.headlines.map((h, i) => (
                            <div key={i} className="text-sm text-gray-700 py-1 border-b border-gray-50 last:border-0 border-dashed">
                                {h}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Descriptions Pool</h4>
                    <div className="space-y-2">
                        {data.descriptions.map((d, i) => (
                            <div key={i} className="text-sm text-gray-700 py-1 border-b border-gray-50 last:border-0 border-dashed">
                                {d}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchAdSlide;
