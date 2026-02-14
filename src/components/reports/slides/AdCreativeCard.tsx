import React from 'react';
import { TrendingUp, TrendingDown, MousePointer, Target, DollarSign } from 'lucide-react';
import type { ReportDesign } from '../../../types/reportTypes';
import './AdCreativeCard.css';

export type AdType = 'search' | 'display' | 'PMAX';

export interface AdCreativeData {
    type: AdType;
    headline: string;
    description: string;
    displayUrl: string;
    imageUrl?: string; // For Display ads
    finalUrl?: string;
}

export interface AdMetrics {
    ctr: {
        value: number;
        formatted: string;
        change?: number;
    };
    conversions: {
        value: number;
        formatted: string;
        change?: number;
    };
    cost: {
        value: number;
        formatted: string;
        change?: number;
    };
}

interface AdCreativeCardProps {
    adData: AdCreativeData;
    metrics: AdMetrics;
    design: ReportDesign;
    className?: string;
}

const AdCreativeCard: React.FC<AdCreativeCardProps> = ({
    adData,
    metrics,
    design,
    className = '',
}) => {
    const getCardBackground = () => {
        if (design.mode === 'dark') {
            return 'rgba(10, 10, 10, 0.6)';
        } else {
            return 'rgba(249, 250, 251, 0.9)';
        }
    };

    const getCardBorder = () => {
        if (design.mode === 'dark') {
            return 'rgba(255, 255, 255, 0.1)';
        } else {
            return 'transparent'; // Clean look
        }
    };

    const renderSearchAdMockup = () => (
        <div className="search-ad-mockup">
            <div className="ad-badge">Annonce</div>
            <div className="ad-content">
                <div className="ad-url" style={{ color: design.mode === 'dark' ? '#34d399' : '#059669' }}>
                    {adData.displayUrl}
                </div>
                <h3 className="ad-headline" style={{ color: design?.colorScheme?.primary || '#1963d5' }}>
                    {adData.headline}
                </h3>
                <p className="ad-description" style={{ color: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(5, 5, 5, 0.7)' }}>
                    {adData.description}
                </p>
            </div>
        </div>
    );

    const renderDisplayAdMockup = () => (
        <div className="display-ad-mockup">
            <div className="ad-badge">Annonce</div>
            {adData.imageUrl ? (
                <div className="ad-image-container">
                    <img
                        src={adData.imageUrl}
                        alt={adData.headline}
                        className="ad-image"
                    />
                </div>
            ) : (
                <div
                    className="ad-image-placeholder"
                    style={{
                        background: design?.colorScheme?.primary || '#1963d5',
                        color: '#ffffff'
                    }}
                >
                    <span>Image publicitaire</span>
                </div>
            )}
            <div className="ad-content">
                <h3 className="ad-headline" style={{ color: design?.colorScheme?.text || '#050505' }}>
                    {adData.headline}
                </h3>
                <p className="ad-description" style={{ color: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(5, 5, 5, 0.7)' }}>
                    {adData.description}
                </p>
                <div className="ad-url" style={{ color: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(5, 5, 5, 0.5)' }}>
                    {adData.displayUrl}
                </div>
            </div>
        </div>
    );

    const renderMetricRow = (
        label: string,
        icon: React.ReactNode,
        value: string,
        change?: number
    ) => (
        <div className="metric-row">
            <div className="metric-label">
                <span
                    className="metric-icon"
                    style={{
                        background: design?.colorScheme?.primary || '#1963d5',
                        color: '#ffffff'
                    }}
                >
                    {icon}
                </span>
                <span style={{ color: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(5, 5, 5, 0.6)' }}>{label}</span>
            </div>
            <div className="metric-value-container">
                <span className="metric-value" style={{ color: design?.colorScheme?.text || '#050505' }}>
                    {value}
                </span>
                {change !== undefined && (
                    <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
                        {change >= 0 ? (
                            <TrendingUp size={12} />
                        ) : (
                            <TrendingDown size={12} />
                        )}
                        <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div
            className={`ad-creative-card ${className}`}
            style={{
                background: getCardBackground(),
                borderColor: getCardBorder(),
            }}
        >
            <div className="ad-creative-left">
                {adData.type === 'search' ? renderSearchAdMockup() : renderDisplayAdMockup()}
            </div>

            <div className="ad-creative-right">
                <h4 className="metrics-title" style={{ color: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(5, 5, 5, 0.5)' }}>
                    Performances
                </h4>
                <div className="metrics-table">
                    {renderMetricRow(
                        'CTR',
                        <MousePointer size={16} />,
                        metrics.ctr.formatted,
                        metrics.ctr.change
                    )}
                    {renderMetricRow(
                        'Conversions',
                        <Target size={16} />,
                        metrics.conversions.formatted,
                        metrics.conversions.change
                    )}
                    {renderMetricRow(
                        'Coût',
                        <DollarSign size={16} />,
                        metrics.cost.formatted,
                        metrics.cost.change
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdCreativeCard;
