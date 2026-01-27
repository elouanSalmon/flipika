import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import AdCreativeCard from './AdCreativeCard';
import PerformanceMaxSlide from './PerformanceMaxSlide';
import SearchAdSlide from './SearchAdSlide';
import type { AdCreativeData, AdMetrics } from './AdCreativeCard';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import ReportBlock from '../../editor/blocks/ReportBlock';
import { generateBlockAnalysis } from '../../../services/aiService';
import { generateConfigHash } from '../../../hooks/useGenerateAnalysis';

export interface AdCreativeConfig {
    description?: string;
    aiAnalysisHash?: string;
    title?: string;
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
    onDelete?: () => void;
    onUpdateConfig?: (newConfig: Partial<AdCreativeConfig> & { title?: string }) => void;
    variant?: 'default' | 'chromeless';
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
    campaignName?: string;
    adGroupName?: string;
}

const AdCreativeSlide: React.FC<AdCreativeSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    editable = false,
    onDelete,
    onUpdateConfig,
    variant,
}) => {
    const { t } = useTranslation('reports');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(true);
    const [realAds, setRealAds] = useState<RealAdCreative[]>([]);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // AI Analysis generation state
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

    // Ref to store captured data for AI generation
    const capturedDataRef = useRef<RealAdCreative[]>([]);

    // Get description from config settings
    const description = config.settings?.description as string | undefined;
    const aiAnalysisHash = config.settings?.aiAnalysisHash as string | undefined;
    const blockTitle = config.settings?.title || "Aperçu d'annonce";

    // Check if description is stale
    const descriptionIsStale = Boolean(description && aiAnalysisHash && (() => {
        const currentHash = generateConfigHash({
            title: 'Ad Creative',
            metrics: ['metrics.clicks', 'metrics.conversions', 'metrics.ctr'],
            visualization: 'ad_creative',
        }, startDate, endDate);
        return currentHash !== aiAnalysisHash;
    })());

    // Compute effective scope
    const effectiveAccountId = config.scope?.accountId || accountId || '';
    const effectiveCampaignIds = useMemo(() => {
        return config.scope?.campaignIds || campaignIds || [];
    }, [config.scope?.campaignIds, campaignIds]);

    // DEMO DATA
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
        ctr: { value: 4.25, formatted: '4.25%', change: 12.5 },
        conversions: { value: 47, formatted: '47', change: 8.3 },
        cost: { value: 1247.50, formatted: '1 247,50 €', change: -5.2 },
    };

    useEffect(() => {
        loadData();
    }, [config?.id, effectiveAccountId, effectiveCampaignIds, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!effectiveAccountId) {
                setIsMockData(true);
                setLoading(false);
                return;
            }

            const { fetchAdCreatives } = await import('../../../services/googleAds');
            const result = await fetchAdCreatives(effectiveAccountId, effectiveCampaignIds || []);

            if (!result.success || !result.ads || result.ads.length === 0) {
                setIsMockData(true);
                setLoading(false);
                return;
            }

            setRealAds(result.ads);
            setIsMockData(false);
            capturedDataRef.current = result.ads;

        } catch (err) {
            console.error('Error loading ad creative data:', err);
            setIsMockData(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle AI analysis generation
    const handleBulkGenerateAnalysis = useCallback(async () => {
        if (description || !startDate || !endDate || !editable || !onUpdateConfig) {
            return;
        }

        setIsGeneratingAnalysis(true);
        window.dispatchEvent(new CustomEvent('flipika:ai-generation-start'));

        try {
            const formatDate = (d: Date | string) => {
                const date = new Date(d);
                return date.toISOString().split('T')[0];
            };

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

            const hash = generateConfigHash({
                title: 'Ad Creative',
                metrics: ['metrics.clicks', 'metrics.conversions', 'metrics.ctr'],
                visualization: 'ad_creative',
            }, startDate, endDate);

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

    useEffect(() => {
        const handleRequestAllAnalyses = () => {
            handleBulkGenerateAnalysis();
        };

        window.addEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        return () => {
            window.removeEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        };
    }, [handleBulkGenerateAnalysis]);

    const handleSave = (title: string) => {
        onUpdateConfig?.({ title });
        setIsConfigOpen(false);
    };

    const ConfigModal = (
        <AnimatePresence>
            {isConfigOpen && (
                <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsConfigOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-[var(--color-bg-primary)] rounded-3xl shadow-2xl flex flex-col w-[500px] max-w-full overflow-hidden border border-[var(--color-border)]"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                            <h4 className="text-xl font-bold">{t('flexibleBlock.modalTitle', 'Paramètres')}</h4>
                            <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <section>
                                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.title', 'Titre')}</label>
                                <input
                                    type="text"
                                    defaultValue={blockTitle}
                                    onBlur={(e) => handleSave(e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                                />
                            </section>
                        </div>
                        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
                            <button onClick={() => setIsConfigOpen(false)} className="btn btn-primary px-6">{t('flexibleBlock.actions.update', 'Enregistrer')}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const headerContent = (
        <div className="flex items-center gap-2">
            {isMockData && (
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
            )}
        </div>
    );

    let adData: AdCreativeData;
    let adMetrics: AdMetrics;
    let selectedAd: RealAdCreative | undefined;

    if (!isMockData && realAds.length > 0) {
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
        <div className="h-full">
            <ReportBlock
                title={blockTitle}
                design={design}
                loading={loading}
                error={error}
                editable={editable}
                headerContent={headerContent}
                description={description}
                descriptionIsStale={descriptionIsStale}
                onRegenerateAnalysis={handleBulkGenerateAnalysis}
                isGeneratingAnalysis={isGeneratingAnalysis}
                onEdit={() => setIsConfigOpen(true)}
                onDelete={onDelete}
                minHeight={400}
                className="ad-creative-widget"
                variant={variant}
            >
                <div className="flex-1 w-full h-full overflow-hidden min-h-0 ad-preview-container">
                    {renderAdContent()}
                </div>
            </ReportBlock>
            {typeof document !== 'undefined' && createPortal(ConfigModal, document.body)}
        </div>
    );
};

export default AdCreativeSlide;
