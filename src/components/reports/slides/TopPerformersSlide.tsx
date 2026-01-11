import React, { useState, useEffect } from 'react';
import { Trophy, AlertCircle, Search, MapPin, Layout } from 'lucide-react';
import type { SlideConfig } from '../../../types/reportTypes';
import { getSlideData } from '../../../services/slideService';

interface TopPerformersSlideProps {
    config: SlideConfig;
    accountId: string;
    campaignIds: string[];
    startDate?: Date;
    endDate?: Date;
    reportId?: string;
}

const TopPerformersSlide: React.FC<TopPerformersSlideProps> = ({
    config,
    accountId,
    campaignIds,
    startDate,
    endDate,
    reportId
}) => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!accountId || campaignIds.length === 0) return;

            try {
                setIsLoading(true);
                setError(null);

                const result = await getSlideData(
                    config,
                    accountId,
                    campaignIds,
                    startDate,
                    endDate,
                    reportId
                );

                if (result) {
                    setData(result.data || []);
                    setIsMockData(result.isMockData || false);
                }
            } catch (err) {
                console.error('Error fetching top performers data:', err);
                setError('Impossible de charger les données');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [config, accountId, campaignIds, startDate, endDate, reportId]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const formatPercent = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    const getIcon = () => {
        switch (config.settings?.dimension) {
            case 'KEYWORDS': return <Search className="w-5 h-5 text-blue-500" />;
            case 'SEARCH_TERMS': return <Search className="w-5 h-5 text-purple-500" />;
            case 'LOCATIONS': return <MapPin className="w-5 h-5 text-red-500" />;
            case 'ADS': return <Layout className="w-5 h-5 text-green-500" />;
            default: return <Trophy className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getTitle = () => {
        switch (config.settings?.dimension) {
            case 'KEYWORDS': return 'Mots-clés les plus performants';
            case 'SEARCH_TERMS': return 'Termes de recherche';
            case 'LOCATIONS': return 'Zones géographiques';
            case 'ADS': return 'Annonces les plus performantes';
            default: return 'Top Performers';
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-8 text-red-500 gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {getTitle()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Classé par {config.settings?.metric === 'CONVERSIONS' ? 'Conversions' :
                                config.settings?.metric === 'ROAS' ? 'ROAS' : 'Coût'}
                        </p>
                    </div>
                </div>
                {isMockData && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
                        Données démo
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Élément</th>
                            <th className="px-4 py-3">Campagne</th>
                            <th className="px-4 py-3 text-right">Impr.</th>
                            <th className="px-4 py-3 text-right">Clics</th>
                            <th className="px-4 py-3 text-right">CTR</th>
                            <th className="px-4 py-3 text-right">CPC Moy.</th>
                            <th className="px-4 py-3 text-right">Coût</th>
                            <th className="px-4 py-3 text-right">Conv.</th>
                            <th className="px-4 py-3 text-right">ROAS</th>
                            <th className="px-4 py-3 text-right rounded-tr-lg">Chiffre d'aff.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map((item, index) => (
                            <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate" title={item.name}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs w-4">#{index + 1}</span>
                                        {item.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={item.campaignName}>
                                    {item.campaignName}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                                    {formatNumber(item.impressions)}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                                    {formatNumber(item.clicks)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-blue-600 dark:text-blue-400">
                                    {formatPercent(item.ctr)}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(item.cpc)}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(item.cost)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                                    {formatNumber(item.conversions)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                    {item.roas.toFixed(2)}x
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(item.conversions_value)}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Aucune donnée disponible pour cette période
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopPerformersSlide;
