import React from 'react';
import { TrendingUp, TrendingDown, MousePointer, Target, DollarSign } from 'lucide-react';
import type { ReportDesign } from '../../../types/reportTypes';
import './AdCreativeCard.css';

export type AdType = 'search' | 'display';

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
            return 'rgba(30, 41, 59, 0.6)';
        } else {
            return 'rgba(249, 250, 251, 0.9)';
        }
    };

    const getCardBorder = () => {
        if (design.mode === 'dark') {
            return 'rgba(255, 255, 255, 0.1)';
        } else {
            return 'rgba(0, 0, 0, 0.06)';
        }
    };

    const renderSearchAdMockup = () => (
        <div className="search-ad-mockup">
            <div className="ad-badge">Annonce</div>
            <div className="ad-content">
                <div className="ad-url" style={{ color: design.mode === 'dark' ? '#34d399' : '#059669' }}>
                    {adData.displayUrl}
                </div>
                <h3 className="ad-headline" style={{ color: design.colorScheme.primary }}>
                    {adData.headline}
                </h3>
                <p className="ad-description" style={{ color: design.colorScheme.secondary }}>
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
                        background: design.colorScheme.primary,
                        color: '#ffffff'
                    }}
                >
                    <span>Image publicitaire</span>
                </div>
            )}
            <div className="ad-content">
                <h3 className="ad-headline" style={{ color: design.colorScheme.text }}>
                    {adData.headline}
                </h3>
                <p className="ad-description" style={{ color: design.colorScheme.secondary }}>
                    {adData.description}
                </p>
                <div className="ad-url" style={{ color: design.colorScheme.secondary }}>
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
                        background: design.colorScheme.primary,
                        color: '#ffffff'
                    }}
                >
                    {icon}
                </span>
                <span style={{ color: design.colorScheme.secondary }}>{label}</span>
            </div>
            <div className="metric-value-container">
                <span className="metric-value" style={{ color: design.colorScheme.text }}>
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
                <h4 className="metrics-title" style={{ color: design.colorScheme.secondary }}>
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
