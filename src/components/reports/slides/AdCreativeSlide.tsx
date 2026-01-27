import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import AdCreativeCard from './AdCreativeCard';
import PerformanceMaxSlide from './PerformanceMaxSlide';
import SearchAdSlide from './SearchAdSlide';
import type { AdCreativeData, AdMetrics } from './AdCreativeCard';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import ReportBlock from '../../editor/blocks/ReportBlock';
import { AlertTriangle } from 'lucide-react';
import { generateBlockAnalysis } from '../../../services/aiService';
import { generateConfigHash } from '../../../hooks/useGenerateAnalysis';

export interface AdCreativeConfig {
    description?: string;
    aiAnalysisHash?: string;
}

interface AdCreativeSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
    isTemplateMode?: boolean;
    onUpdateConfig?: (newConfig: Partial<AdCreativeConfig>) => void;
}

interface RealAdCreative {
    id: string;
    type: 'SEARCH' | 'DISPLAY' | 'UNKNOWN' | 'PMAX';
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
    images: { url: string; ratio: 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE' }[];
    campaignName?: string; // Add optional campaign name
    adGroupName?: string;  // Add optional asset group name
}

const AdCreativeSlide: React.FC<AdCreativeSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    editable = false,
    onUpdateConfig,
}) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(true);
    const [realAds, setRealAds] = useState<RealAdCreative[]>([]);

    // AI Analysis generation state
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

    // Ref to store captured data for AI generation
    const capturedDataRef = useRef<RealAdCreative[]>([]);

    // Get description from config settings
    const description = config.settings?.description as string | undefined;
    const aiAnalysisHash = config.settings?.aiAnalysisHash as string | undefined;

    // Check if description is stale
    const descriptionIsStale = Boolean(description && aiAnalysisHash && (() => {
        const currentHash = generateConfigHash({
            title: 'Ad Creative',
            metrics: ['metrics.clicks', 'metrics.conversions', 'metrics.ctr'],
            visualization: 'ad_creative',
        }, startDate, endDate);
        return currentHash !== aiAnalysisHash;
    })());

    // Compute effective scope (per-slide override or report-level default)
    const effectiveAccountId = config.scope?.accountId || accountId || '';

    // Memoize campaign IDs to prevent re-render loops due to array reference changes
    const effectiveCampaignIds = useMemo(() => {
        return config.scope?.campaignIds || campaignIds || [];
    }, [config.scope?.campaignIds, campaignIds]);

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
    }, [config?.id, effectiveAccountId, effectiveCampaignIds, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Debug logging to trace values
            console.log('🎯 AdCreativeSlide loadData called with:', {
                effectiveAccountId,
                effectiveCampaignIds,
                campaignIdsLength: effectiveCampaignIds?.length,
                hasAccountId: !!effectiveAccountId,
                hasCampaignIds: effectiveCampaignIds && effectiveCampaignIds.length > 0,
                startDate,
                endDate
            });

            // Check if we have the required data to fetch ads
            // We need at least an accountId. campaignIds can be empty (meaning "all campaigns")
            if (!effectiveAccountId) {
                console.warn('⚠️ Missing accountId, using demo data');
                setIsMockData(true);
                setLoading(false);
                return;
            }

            // Fetch real ad creatives from Google Ads API
            const { fetchAdCreatives } = await import('../../../services/googleAds');
            // Ensure we pass an empty array if campaignIds is undefined, as the service expects string[]
            const result = await fetchAdCreatives(effectiveAccountId, effectiveCampaignIds || []);

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

            // Capture data for AI generation
            capturedDataRef.current = result.ads;

        } catch (err) {
            console.error('Error loading ad creative data:', err);
            // Fall back to demo data on error
            setIsMockData(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle AI analysis generation (for bulk generation)
    const handleBulkGenerateAnalysis = useCallback(async () => {
        // Skip if already has description or no dates or not editable
        if (description || !startDate || !endDate || !editable || !onUpdateConfig) {
            return;
        }

        // For ad creatives, we can still generate even with mock data - it will analyze the ad copy
        setIsGeneratingAnalysis(true);
        window.dispatchEvent(new CustomEvent('flipika:ai-generation-start'));

        try {
            const formatDate = (d: Date | string) => {
                const date = new Date(d);
                return date.toISOString().split('T')[0];
            };

            // Prepare ad creative data for AI
            const adData = capturedDataRef.current.length > 0
                ? capturedDataRef.current.map(ad => ({
                    type: ad.type,
                    headlines: ad.headlines,
                    descriptions: ad.descriptions,
                    clicks: ad.metrics.clicks,
                    impressions: ad.metrics.impressions,
                    ctr: ad.metrics.ctr,
                    conversions: ad.metrics.conversions,
                    cost: ad.metrics.cost
                }))
                : [{
                    type: 'MOCK',
                    headlines: ['Logiciel de Gestion Google Ads'],
                    descriptions: ['Optimisez vos campagnes Google Ads'],
                    note: 'Données de démonstration'
                }];

            const result = await generateBlockAnalysis({
                blockTitle: "Aperçu d'annonce",
                visualization: 'ad_creative',
                metrics: ['metrics.clicks', 'metrics.conversions', 'metrics.ctr', 'metrics.cost'],
                dimension: 'ad_creative',
                period: {
                    start: formatDate(startDate),
                    end: formatDate(endDate)
                },
                currentData: adData as any,
                comparisonData: undefined,
                showComparison: false
            });

            // Generate hash for staleness detection
            const hash = generateConfigHash({
                title: 'Ad Creative',
                metrics: ['metrics.clicks', 'metrics.conversions', 'metrics.ctr'],
                visualization: 'ad_creative',
            }, startDate, endDate);

            // Update config directly
            onUpdateConfig({
                description: result.analysis,
                aiAnalysisHash: hash
            });

        } catch (error) {
            console.error('Error generating analysis (bulk) for ad creative:', error);
        } finally {
            setIsGeneratingAnalysis(false);
            window.dispatchEvent(new CustomEvent('flipika:ai-generation-end'));
        }
    }, [description, startDate, endDate, editable, onUpdateConfig]);

    // Listen for "Generate All" event
    useEffect(() => {
        const handleRequestAllAnalyses = () => {
            handleBulkGenerateAnalysis();
        };

        window.addEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        return () => {
            window.removeEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        };
    }, [handleBulkGenerateAnalysis]);

    // AI Generation overlay removed - handled by ReportBlock
    // DescriptionSection removed - handled by ReportBlock

    const headerContent = isMockData ? (
        <span
            className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-medium rounded-full"
            style={{
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fcd34d'
            }}
            title="Données de démonstration - Connectez votre compte Google Ads pour voir vos vraies annonces"
        >
            <AlertTriangle size={10} />
            Mode Démo
        </span>
    ) : null;

    // Determine which ad to display & Logic
    let adData: AdCreativeData;
    let adMetrics: AdMetrics;
    let selectedAd: RealAdCreative | undefined;

    if (!isMockData && realAds.length > 0) {
        // Use real ad data
        const selectedAdId = config.settings?.selectedAdId;
        selectedAd = selectedAdId
            ? realAds.find(ad => ad.id === selectedAdId)
            : realAds[0];

        if (selectedAd) {
            adData = {
                type: selectedAd.type === 'SEARCH' ? 'search' : selectedAd.type === 'PMAX' ? 'PMAX' : 'display',
                headline: selectedAd.headlines[0] || 'No headline',
                description: selectedAd.descriptions[0] || 'No description',
                displayUrl: selectedAd.displayUrl,
                imageUrl: selectedAd.imageUrl || undefined,
                finalUrl: selectedAd.finalUrl,
            };

            const ctr = selectedAd.metrics.ctr * 100;
            adMetrics = {
                ctr: { value: ctr, formatted: `${ctr.toFixed(2)}%` },
                conversions: { value: selectedAd.metrics.conversions, formatted: new Intl.NumberFormat('fr-FR').format(selectedAd.metrics.conversions) },
                cost: { value: selectedAd.metrics.cost, formatted: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedAd.metrics.cost) },
            };
        } else {
            const adType = config.settings?.adType || 'search';
            adData = adType === 'display' ? mockDisplayAd : mockSearchAd;
            adMetrics = mockMetrics;
        }
    } else {
        const adType = config.settings?.adType || 'search';
        adData = adType === 'display' ? mockDisplayAd : mockSearchAd;
        adMetrics = mockMetrics;
    }

    const renderAdContent = () => {
        if (adData.type === 'PMAX' || (selectedAd?.type === 'PMAX')) {
            return (
                <PerformanceMaxSlide
                    data={{
                        headlines: selectedAd?.headlines || [],
                        descriptions: selectedAd?.descriptions || [],
                        images: selectedAd?.images || [],
                        finalUrl: selectedAd?.finalUrl,
                        campaignName: selectedAd?.campaignName || 'Campaign',
                        assetGroupName: selectedAd?.name || 'Asset Group'
                    }}
                    design={design}
                />
            );
        }

        if (adData.type === 'search' || selectedAd?.type === 'SEARCH') {
            return (
                <SearchAdSlide
                    data={{
                        headlines: selectedAd?.headlines || [adData.headline],
                        descriptions: selectedAd?.descriptions || [adData.description],
                        displayUrl: adData.displayUrl,
                        finalUrl: adData.finalUrl || ''
                    }}
                    design={design}
                />
            );
        }

        return (
            <div className="flex flex-col justify-center h-full">
                <AdCreativeCard
                    adData={adData}
                    metrics={adMetrics}
                    design={design}
                />
            </div>
        );
    };

    return (
        <ReportBlock
            title="Aperçu d'annonce"
            design={design}
            loading={loading}
            error={error}
            editable={editable}
            headerContent={headerContent}
            description={description}
            descriptionIsStale={descriptionIsStale}
            onRegenerateAnalysis={handleBulkGenerateAnalysis}
            isGeneratingAnalysis={isGeneratingAnalysis}
            minHeight={400}
            className="ad-creative-widget"
        >
            <div className="flex-1 w-full h-full overflow-hidden min-h-0 ad-preview-container">
                {renderAdContent()}
            </div>
        </ReportBlock>
    );
};

export default AdCreativeSlide;
