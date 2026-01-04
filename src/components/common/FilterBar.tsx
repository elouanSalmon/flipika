import React from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Campaign } from '../../types/business';

interface FilterBarProps {
    accounts: { id: string; name: string }[];
    campaigns?: Campaign[];
    selectedAccountId: string;
    selectedCampaignId?: string;
    onAccountChange: (accountId: string) => void;
    onCampaignChange?: (campaignId: string) => void;
    loadingCampaigns?: boolean;
    className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
    accounts,
    campaigns = [],
    selectedAccountId,
    selectedCampaignId = '',
    onAccountChange,
    onCampaignChange,
    loadingCampaigns = false,
    className = '',
}) => {
    const { t } = useTranslation('common');
    const hasActiveFilters = selectedAccountId || selectedCampaignId;

    const handleClearFilters = () => {
        onAccountChange('');
        if (onCampaignChange) onCampaignChange('');
    };

    return (
        <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 ${className}`}>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mr-2">
                <Filter size={20} />
                <span className="font-medium text-sm">{t('filters.title')}</span>
            </div>

            <div className="flex flex-wrap gap-4 flex-1 w-full sm:w-auto">
                {/* Account Selector */}
                <div className="flex-1 sm:flex-none sm:min-w-[200px]">
                    <select
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={selectedAccountId}
                        onChange={(e) => onAccountChange(e.target.value)}
                    >
                        <option value="">{t('filters.allAccounts')}</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Campaign Selector - Only show if onCampaignChange provided and account selected */}
                {onCampaignChange && selectedAccountId && (
                    <div className="flex-1 sm:flex-none sm:min-w-[200px]">
                        <select
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                            value={selectedCampaignId}
                            onChange={(e) => onCampaignChange(e.target.value)}
                            disabled={loadingCampaigns}
                        >
                            <option value="">{t('filters.allCampaigns')}</option>
                            {loadingCampaigns ? (
                                <option disabled>{t('status.loading')}</option>
                            ) : (
                                campaigns.map((campaign) => (
                                    <option key={campaign.id} value={campaign.id}>
                                        {campaign.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto sm:ml-0"
                    >
                        <X size={16} />
                        {t('actions.clear')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
