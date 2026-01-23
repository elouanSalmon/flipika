import React from 'react';
import type { ReportDesign } from '../../../types/reportTypes';
import { Globe } from 'lucide-react';

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
        <div
            className="h-full p-6 rounded-xl"
            style={{
                fontFamily: design?.typography?.fontFamily || 'Inter, sans-serif',
                backgroundColor: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#111827'
            }}
        >
            {/* Header */}
            <h3 className="text-lg font-semibold mb-4" style={{ color: design?.colorScheme?.secondary || '#6b7280' }}>
                Aperçu d'annonce
            </h3>

            {/* Google Search Result Mockup */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                {/* Ad Label & URL */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-gray-900">Sponsorisé</span>
                    <span className="text-gray-400 text-[10px]">•</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Globe size={14} className="text-blue-600" />
                        <span className="truncate">{data.displayUrl}</span>
                    </div>
                </div>

                {/* Ad Title */}
                <h4 className="text-lg text-[#1a0dab] font-normal mb-1 hover:underline cursor-pointer">
                    {title || 'Titre de l\'annonce manquant'}
                </h4>

                {/* Ad Description */}
                <p className="text-sm text-[#4d5156] leading-relaxed">
                    {description || 'Description de l\'annonce manquante...'}
                </p>

                {/* Sitelinks */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {['Contactez-nous', 'Nos Services', 'Demander un Devis'].map((link, i) => (
                        <span key={i} className="text-sm text-[#1a0dab] hover:underline cursor-pointer">
                            {link}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchAdSlide;
