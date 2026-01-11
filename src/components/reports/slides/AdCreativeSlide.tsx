import React, { useEffect, useState } from 'react';
import AdCreativeCard from './AdCreativeCard';
import type { AdCreativeData, AdMetrics } from './AdCreativeCard';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import { AlertTriangle } from 'lucide-react';

interface AdCreativeSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
}

interface RealAdCreative {
    id: string;
    type: 'SEARCH' | 'DISPLAY' | 'UNKNOWN';
    name: string;
    headlines: string[];
    descriptions: string[];
    finalUrl: string;
    imageUrl: string | null;
    displayUrl: string;
    metrics: {
        impressions: number;
        clicks: number;
        ctr: number;
        cost: number;
        conversions: number;
    };
}

const AdCreativeSlide: React.FC<AdCreativeSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    // editable and reportId are not used yet but kept in props for future use
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(true);
    const [realAds, setRealAds] = useState<RealAdCreative[]>([]);

    // DEMO DATA - Mock ad examples for demonstration
    // In production, these would be fetched from Google Ads API based on user selection
    const mockSearchAd: AdCreativeData = {
        type: 'search',
        headline: 'Logiciel de Gestion Google Ads - Essai Gratuit 14 Jours',
        description: 'Optimisez vos campagnes Google Ads avec Flipika. Rapports automatisés, analyses en temps réel et recommandations IA pour améliorer vos performances.',
        displayUrl: 'www.flipika.com/essai-gratuit',
        finalUrl: 'https://www.flipika.com/essai-gratuit',
    };

    const mockDisplayAd: AdCreativeData = {
        type: 'display',
        headline: 'Boostez vos performances Google Ads',
        description: 'Rapports automatisés et insights puissants pour vos campagnes publicitaires.',
        displayUrl: 'www.flipika.com',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
        finalUrl: 'https://www.flipika.com',
    };

    const mockMetrics: AdMetrics = {
        ctr: {
            value: 4.25,
            formatted: '4.25%',
            change: 12.5,
        },
        conversions: {
            value: 47,
            formatted: '47',
            change: 8.3,
        },
        cost: {
            value: 1247.50,
            formatted: '1 247,50 €',
            change: -5.2,
        },
    };

    useEffect(() => {
        loadData();
    }, [config, accountId, campaignIds, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Debug logging to trace values
            console.log('🎯 AdCreativeSlide loadData called with:', {
                accountId,
                campaignIds,
                campaignIdsLength: campaignIds?.length,
                hasAccountId: !!accountId,
                hasCampaignIds: campaignIds && campaignIds.length > 0,
                startDate,
                endDate
            });

            // Check if we have the required data to fetch ads
            // We need at least an accountId. campaignIds can be empty (meaning "all campaigns")
            if (!accountId) {
                console.warn('⚠️ Missing accountId, using demo data');
                setIsMockData(true);
                setLoading(false);
                return;
            }

            // Fetch real ad creatives from Google Ads API
            const { fetchAdCreatives } = await import('../../../services/googleAds');
            // Ensure we pass an empty array if campaignIds is undefined, as the service expects string[]
            const result = await fetchAdCreatives(accountId, campaignIds || []);

            if (!result.success || !result.ads || result.ads.length === 0) {
                console.warn('No ads returned from API, using demo data:', result.error);
                setIsMockData(true);
                setLoading(false);
                return;
            }

            // Successfully loaded real ads
            console.log('✅ Loaded real ad creatives:', result.ads.length);
            setRealAds(result.ads);
            setIsMockData(false);

        } catch (err) {
            console.error('Error loading ad creative data:', err);
            // Fall back to demo data on error
            setIsMockData(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="ad-creative-widget loading">
                <div className="widget-header">
                    <h3>Aperçu d'annonce</h3>
                </div>
                <div className="widget-content">
                    <div className="flex justify-center py-8">
                        <Spinner size={32} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ad-creative-widget error">
                <div className="widget-header">
                    <h3>Aperçu d'annonce</h3>
                </div>
                <div className="widget-content">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    // Determine which ad to display
    let adData: AdCreativeData;
    let adMetrics: AdMetrics;

    if (!isMockData && realAds.length > 0) {
        // Use real ad data
        // Get selected ad ID from widget settings, or use first ad
        const selectedAdId = config.settings?.selectedAdId;
        const selectedAd = selectedAdId
            ? realAds.find(ad => ad.id === selectedAdId)
            : realAds[0];

        if (selectedAd) {
            // Transform real ad to AdCreativeData format
            adData = {
                type: selectedAd.type === 'SEARCH' ? 'search' : 'display',
                headline: selectedAd.headlines[0] || 'No headline',
                description: selectedAd.descriptions[0] || 'No description',
                displayUrl: selectedAd.displayUrl,
                imageUrl: selectedAd.imageUrl || undefined,
                finalUrl: selectedAd.finalUrl,
            };

            // Calculate metrics with change (we don't have historical data yet, so no change)
            const ctr = selectedAd.metrics.ctr * 100; // Convert to percentage
            adMetrics = {
                ctr: {
                    value: ctr,
                    formatted: `${ctr.toFixed(2)}%`,
                },
                conversions: {
                    value: selectedAd.metrics.conversions,
                    formatted: new Intl.NumberFormat('fr-FR').format(selectedAd.metrics.conversions),
                },
                cost: {
                    value: selectedAd.metrics.cost,
                    formatted: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedAd.metrics.cost),
                },
            };
        } else {
            // Fallback to mock if selected ad not found
            const adType = config.settings?.adType || 'search';
            adData = adType === 'display' ? mockDisplayAd : mockSearchAd;
            adMetrics = mockMetrics;
        }
    } else {
        // Use mock data
        const adType = config.settings?.adType || 'search';
        adData = adType === 'display' ? mockDisplayAd : mockSearchAd;
        adMetrics = mockMetrics;
    }

    return (
        <div
            className="ad-creative-widget"
            style={{
                '--widget-primary': design.colorScheme.primary,
                '--widget-text': design.colorScheme.text,
                '--widget-background': design.colorScheme.background,
                backgroundColor: design.colorScheme.background,
                color: design.colorScheme.text,
                padding: '24px',
                height: '100%',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column'
            } as React.CSSProperties}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 style={{
                    color: design.colorScheme.text,
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600,
                }}>
                    Aperçu d'annonce
                </h3>
                {isMockData && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
                        style={{
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fcd34d'
                        }}
                        title="Données de démonstration - Connectez votre compte Google Ads pour voir vos vraies annonces"
                    >
                        <AlertTriangle size={12} />
                        Mode Démo
                    </span>
                )}
            </div>

            <div className="widget-content flex-1 flex flex-col justify-center">
                <AdCreativeCard
                    adData={adData}
                    metrics={adMetrics}
                    design={design}
                />
            </div>
        </div>
    );
};

export default AdCreativeSlide;
