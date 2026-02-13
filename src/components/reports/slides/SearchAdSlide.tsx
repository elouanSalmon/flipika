import React from 'react';
import type { ReportDesign } from '../../../types/reportTypes';
import { Globe } from 'lucide-react';
import './ChartBlocksShared.css';

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
    const title = data.headlines.slice(0, 3).join(' | ');
    const description = data.descriptions.slice(0, 2).join(' ');

    return (
        <div
            className="chart-block-card"
            style={{
                fontFamily: design?.typography?.fontFamily || 'Inter, sans-serif',
                // Explicitly set background and color from design
                backgroundColor: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#111827',
                borderColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            }}
        >
            {/* Google Search Result Mockup */}
            <div className="chart-block-content" style={{ paddingTop: '10px' }}>
                <div style={{
                    background: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    border: design?.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                }}>
                    {/* Ad Label & URL */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: design?.colorScheme?.text || (design?.mode === 'dark' ? '#f8fafc' : '#141415') }}>Sponsorisé</span>
                        <span style={{ color: design?.colorScheme?.secondary || 'var(--color-text-muted)', fontSize: '10px' }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Globe size={14} style={{ color: design?.colorScheme?.primary || 'var(--color-primary)' }} />
                            <span style={{ fontSize: '14px', color: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.5)' }}>
                                {data.displayUrl}
                            </span>
                        </div>
                    </div>

                    {/* Ad Title */}
                    <h4 style={{
                        fontSize: '18px',
                        color: design?.colorScheme?.primary || '#1a0dab',
                        fontWeight: 'normal',
                        marginBottom: '6px',
                        cursor: 'pointer',
                    }}>
                        {title || 'Titre de l\'annonce manquant'}
                    </h4>

                    {/* Ad Description */}
                    <p style={{
                        fontSize: '14px',
                        color: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)',
                        lineHeight: '1.6',
                        marginBottom: '12px',
                    }}>
                        {description || 'Description de l\'annonce manquante...'}
                    </p>

                    {/* Sitelinks */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {['Contactez-nous', 'Nos Services', 'Demander un Devis'].map((link, i) => (
                            <span
                                key={i}
                                style={{
                                    fontSize: '13px',
                                    color: design?.colorScheme?.primary || '#1a0dab',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                }}
                            >
                                {link}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchAdSlide;
