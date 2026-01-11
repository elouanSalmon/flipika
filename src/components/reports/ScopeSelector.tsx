import React, { useState, useEffect } from 'react';
import { Target, ChevronDown } from 'lucide-react';
import { fetchCampaigns } from '../../services/googleAds';
import type { SlideScope, SlideType } from '../../types/reportTypes';
import type { Campaign } from '../../types/business';

interface ScopeSelectorProps {
    value: SlideScope | undefined;
    onChange: (scope: SlideScope | undefined) => void;
    reportAccountId: string;
    reportCampaignIds: string[];
    slideType: SlideType;  // NEW: To filter available scope options
}

// Define which scope types are available for each slide type
const SLIDE_SCOPE_COMPATIBILITY: Record<SlideType, SlideScope['type'][]> = {
    // Performance Overview: Can show all campaigns or subset
    performance_overview: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Campaign Chart: Designed to compare campaigns, so all or subset
    campaign_chart: ['report_default', 'specific_campaigns'],

    // Key Metrics: Can show all or focus on specific campaigns
    key_metrics: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Ad Creative: Typically for a single campaign
    ad_creative: ['single_campaign'],

    // Text Block: Not data-driven, but allow all for consistency
    text_block: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Custom: Allow all options
    custom: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Funnel Analysis
    funnel_analysis: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Heatmap
    heatmap: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Device Platform Split
    device_platform_split: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Top Performers
    // Top Performers
    top_performers: ['report_default', 'specific_campaigns', 'single_campaign'],

    // Structural Slides (No specific data scope needed, default to report)
    section_title: ['report_default'],
    rich_text: ['report_default'],
};

const SCOPE_LABELS: Record<SlideScope['type'], string> = {
    report_default: 'Toutes les campagnes du rapport',
    specific_campaigns: 'Campagnes spécifiques',
    single_campaign: 'Campagne unique',
};

const SCOPE_DESCRIPTIONS: Record<SlideScope['type'], string> = {
    report_default: 'Affiche les données de toutes les campagnes du rapport',
    specific_campaigns: 'Sélectionne un sous-ensemble des campagnes du rapport',
    single_campaign: 'Focus sur une seule campagne du rapport',
};

const ScopeSelector: React.FC<ScopeSelectorProps> = ({
    value,
    onChange,
    reportAccountId,
    reportCampaignIds,
    slideType,
}) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

    const scopeType = value?.type || 'report_default';
    const availableScopeTypes = SLIDE_SCOPE_COMPATIBILITY[slideType] || ['report_default'];

    // Load campaigns from report account
    useEffect(() => {
        if (scopeType !== 'report_default' && reportAccountId) {
            loadCampaigns(reportAccountId);
        }
    }, [reportAccountId, scopeType]);

    const loadCampaigns = async (accountId: string) => {
        try {
            setIsLoadingCampaigns(true);
            const response = await fetchCampaigns(accountId);
            if (response.success && response.campaigns) {
                const allCampaigns = Array.isArray(response.campaigns) ? response.campaigns : [];
                // Filter to only show campaigns that are in the report
                const reportCampaigns = allCampaigns.filter((c: Campaign) => reportCampaignIds.includes(c.id));
                setCampaigns(reportCampaigns);
            } else {
                setCampaigns([]);
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            setCampaigns([]);
        } finally {
            setIsLoadingCampaigns(false);
        }
    };

    const handleScopeTypeChange = (type: SlideScope['type']) => {
        if (type === 'report_default') {
            onChange(undefined);
        } else {
            onChange({
                type,
                accountId: reportAccountId,
                campaignIds: type === 'single_campaign' ? [] : reportCampaignIds,
            });
        }
    };

    const handleCampaignChange = (campaignId: string, checked: boolean) => {
        if (!value) return;

        let newCampaignIds: string[];
        if (value.type === 'single_campaign') {
            // Single campaign: replace
            newCampaignIds = checked ? [campaignId] : [];
        } else {
            // Multiple campaigns: toggle
            newCampaignIds = checked
                ? [...(value.campaignIds || []), campaignId]
                : (value.campaignIds || []).filter(id => id !== campaignId);
        }

        onChange({
            ...value,
            accountId: reportAccountId,
            campaignIds: newCampaignIds,
        });
    };

    return (
        <div className="scope-selector p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Portée des données
                </h4>
            </div>

            {/* Scope Type Selector */}
            <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type de portée
                </label>
                <div className="relative">
                    <select
                        value={scopeType}
                        onChange={(e) => handleScopeTypeChange(e.target.value as SlideScope['type'])}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 appearance-none pr-10"
                    >
                        {availableScopeTypes.map(type => (
                            <option key={type} value={type}>
                                {SCOPE_LABELS[type]}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {SCOPE_DESCRIPTIONS[scopeType]}
                </p>
            </div>

            {/* Campaign Selector (shown for specific_campaigns and single_campaign) */}
            {(scopeType === 'specific_campaigns' || scopeType === 'single_campaign') && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {scopeType === 'single_campaign' ? 'Campagne' : 'Campagnes'}
                    </label>
                    {isLoadingCampaigns ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                            Chargement des campagnes...
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                            Aucune campagne disponible dans ce rapport
                        </div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-xl p-2 bg-white dark:bg-gray-700">
                            {campaigns.map(campaign => {
                                const isChecked = value?.campaignIds?.includes(campaign.id) || false;
                                return (
                                    <label
                                        key={campaign.id}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600/50 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <input
                                            type={scopeType === 'single_campaign' ? 'radio' : 'checkbox'}
                                            name={scopeType === 'single_campaign' ? 'campaign' : undefined}
                                            checked={isChecked}
                                            onChange={(e) => handleCampaignChange(campaign.id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                            {campaign.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScopeSelector;
