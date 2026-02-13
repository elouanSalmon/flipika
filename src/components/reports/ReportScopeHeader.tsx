import React from 'react';
import { Calendar, Briefcase, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Campaign } from '../../types/business';
import type { Client } from '../../types/client';

interface ReportScopeHeaderProps {
    startDate?: Date;
    endDate?: Date;
    client?: Client | null;
    campaignIds: string[];
    scopeCampaigns: Campaign[];
    onOpenSettings: () => void;
    isTemplateMode?: boolean;
    periodPreset?: string;
    children?: React.ReactNode;
}

const ReportScopeHeader: React.FC<ReportScopeHeaderProps> = ({
    startDate,
    endDate,
    client,
    campaignIds,
    scopeCampaigns,
    onOpenSettings,
    isTemplateMode = false,
    periodPreset,
    children, // Add children prop for action buttons
}) => {
    const { t } = useTranslation('reports');

    const isDemo = isTemplateMode || (!startDate && !endDate && !client);

    const getPeriodDisplay = () => {
        if (isTemplateMode && periodPreset) {
            return t(`config.periods.${periodPreset}`) || periodPreset;
        }
        if (isDemo && !startDate && !endDate) {
            return t('config.periods.last30Days') + ' (Demo)';
        }
        return `${startDate ? new Date(startDate).toLocaleDateString() : 'N/A'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}`;
    };

    return (
        <div
            className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 flex items-center justify-start text-sm shadow-sm z-30"
            style={{
                position: 'fixed',
                top: 'var(--page-header-height)',
                left: '200px',
                right: 0,
                height: 'var(--scope-header-height)',
                zIndex: 38
            }}
        >
            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar max-w-fit h-full mr-6">
                {/* Dates */}
                <div
                    className="flex items-center text-neutral-600 dark:text-neutral-300 whitespace-nowrap min-w-fit cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors"
                    onClick={onOpenSettings}
                >
                    <Calendar size={16} className="mr-1.5 opacity-70" />
                    <span className="font-medium mr-1">{t('common.period')}:</span>
                    <span>
                        {getPeriodDisplay()}
                    </span>
                </div>

                <div className="h-3 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>

                {/* Client */}
                <div
                    className="flex items-center text-neutral-600 dark:text-neutral-300 whitespace-nowrap min-w-fit cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors"
                    onClick={onOpenSettings}
                >
                    <Briefcase size={16} className="mr-1.5 opacity-70" />
                    <span className="font-medium mr-1">{t('common.client')}:</span>
                    <span className="truncate max-w-[200px]" title={isDemo ? 'Demo Client' : (client?.name || 'Client introuvable')}>
                        {isDemo ? 'Demo Client' : (client?.name || 'Client introuvable')}
                    </span>
                </div>

                <div className="h-3 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>

                {/* Campaigns */}
                <div
                    className="flex items-center text-neutral-600 dark:text-neutral-300 whitespace-nowrap min-w-fit cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors"
                    onClick={onOpenSettings}
                >
                    <Target size={16} className="mr-1.5 opacity-70" />
                    <span className="font-medium mr-1">{t('common.campaigns')}:</span>
                    <span className="truncate max-w-[300px]" title={
                        isDemo ? t('common.allCampaigns') + ' (Demo)' :
                            (!campaignIds || campaignIds.length === 0
                                ? t('common.allCampaigns')
                                : scopeCampaigns
                                    .filter(c => campaignIds.includes(c.id.toString()))
                                    .map(c => c.name)
                                    .join(', '))
                    }>
                        {isDemo ? t('common.allCampaigns') + ' (Demo)' :
                            (!campaignIds || campaignIds.length === 0
                                ? t('common.allCampaigns')
                                : scopeCampaigns
                                    .filter(c => campaignIds.includes(c.id.toString()))
                                    .map(c => c.name)
                                    .join(', '))}
                    </span>
                </div>
            </div>

            <div className="h-3 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block mr-6"></div>

            {/* Scale Actions (Theme, Settings) */}
            <div className="flex items-center space-x-2">
                {children}
            </div>
        </div>
    );
};

export default ReportScopeHeader;
