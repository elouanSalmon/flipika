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
            }}
        >
            {/* Header */}
            <div className="chart-block-header">
                <h3 className="chart-block-title">Aperçu d'annonce</h3>
            </div>

            {/* Google Search Result Mockup */}
            <div className="chart-block-content">
                <div style={{
                    background: 'rgba(var(--surface-rgb), 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    border: '1px solid rgba(var(--border-rgb), 0.15)',
                }}>
                    {/* Ad Label & URL */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Sponsorisé</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Globe size={14} style={{ color: design?.colorScheme?.primary || 'var(--color-primary)' }} />
                            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
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
                        color: 'var(--color-text-secondary)',
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
