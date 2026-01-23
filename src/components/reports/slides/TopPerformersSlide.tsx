import React, { useState, useEffect } from 'react';
import { Trophy, AlertCircle, Search, MapPin, Layout } from 'lucide-react';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';

interface TopPerformersSlideProps {
    config: SlideConfig;
    design: ReportDesign; // Added design prop
    accountId: string;
    campaignIds: string[];
    startDate?: Date;
    endDate?: Date;
    reportId?: string;
    isTemplateMode?: boolean;
}

const TopPerformersSlide: React.FC<TopPerformersSlideProps> = ({
    config,
    design,
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

    // Compute effective scope (per-slide override or report-level default)
    const effectiveAccountId = config.scope?.accountId || accountId || '';
    const effectiveCampaignIds = config.scope?.campaignIds || campaignIds || [];

    useEffect(() => {
        const fetchData = async () => {
            if (!effectiveAccountId || effectiveCampaignIds.length === 0) return;

            try {
                setIsLoading(true);
                setError(null);

                const result = await getSlideData(
                    config,
                    effectiveAccountId,
                    effectiveCampaignIds,
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
    }, [config, effectiveAccountId, effectiveCampaignIds, startDate, endDate, reportId]);

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
            case 'KEYWORDS': return <Search size={20} color={design?.colorScheme?.primary || '#3b82f6'} />;
            case 'SEARCH_TERMS': return <Search size={20} color={design?.colorScheme?.secondary || '#6b7280'} />;
            case 'LOCATIONS': return <MapPin size={20} color={design?.colorScheme?.accent || '#93c5fd'} />;
            case 'ADS': return <Layout size={20} color={design?.colorScheme?.primary || '#3b82f6'} />;
            default: return <Trophy size={20} color={design?.colorScheme?.primary || '#3b82f6'} />;
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

    const tableHeaderStyle = {
        backgroundColor: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        color: design?.colorScheme?.text || '#111827',
        fontSize: '11px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        fontWeight: 600,
        padding: '12px 16px',
        textAlign: 'right' as const,
        borderBottom: `1px solid ${design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
    };

    const tableCellStyle = {
        padding: '12px 16px',
        fontSize: '13px',
        color: design?.colorScheme?.text || '#111827',
        borderBottom: `1px solid ${design.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Spinner size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-8 gap-2" style={{ color: '#ef4444' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div
            className="h-full flex flex-col p-6 rounded-xl overflow-hidden"
            style={{
                backgroundColor: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#111827'
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${design?.colorScheme?.primary || '#3b82f6'}15` }}
                    >
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: design?.colorScheme?.text || '#111827' }}>
                            {getTitle()}
                        </h3>
                        <p className="text-sm opacity-70">
                            Classé par {config.settings?.metric === 'CONVERSIONS' ? 'Conversions' :
                                config.settings?.metric === 'ROAS' ? 'ROAS' : 'Coût'}
                        </p>
                    </div>
                </div>
                {isMockData && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
                        style={{
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fcd34d'
                        }}
                        title="Données de démonstration - Connectez un compte Google Ads pour voir vos données réelles"
                    >
                        <AlertCircle size={12} />
                        Mode Démo
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            <th style={{ ...tableHeaderStyle, textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Élément</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>Campagne</th>
                            <th style={tableHeaderStyle}>Impr.</th>
                            <th style={tableHeaderStyle}>Clics</th>
                            <th style={tableHeaderStyle}>CTR</th>
                            <th style={tableHeaderStyle}>CPC Moy.</th>
                            <th style={tableHeaderStyle}>Coût</th>
                            <th style={tableHeaderStyle}>Conv.</th>
                            <th style={tableHeaderStyle}>ROAS</th>
                            <th style={{ ...tableHeaderStyle, borderRadius: '0 8px 8px 0' }}>Valeur Conv.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className="group transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                <td style={tableCellStyle}>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="text-xs font-mono opacity-50 w-5"
                                        >
                                            #{index + 1}
                                        </span>
                                        <span className="font-medium truncate max-w-[200px]" title={item.name}>
                                            {item.name}
                                        </span>
                                    </div>
                                </td>
                                <td style={tableCellStyle}>
                                    <span className="opacity-70 truncate max-w-[150px] block" title={item.campaignName}>
                                        {item.campaignName}
                                    </span>
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                    {formatNumber(item.impressions)}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                    {formatNumber(item.clicks)}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right', color: design?.colorScheme?.primary || '#3b82f6', fontWeight: 500 }}>
                                    {formatPercent(item.ctr)}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                    {formatCurrency(item.cpc)}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                                    {formatCurrency(item.cost)}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right', color: design?.colorScheme?.secondary || '#6b7280', fontWeight: 600 }}>
                                    {formatNumber(item.conversions)}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                    <span
                                        className="px-2 py-0.5 rounded text-xs font-bold"
                                        style={{
                                            backgroundColor: item.roas > 4 ? '#dcfce7' : item.roas > 2 ? '#fef9c3' : '#fee2e2',
                                            color: item.roas > 4 ? '#166534' : item.roas > 2 ? '#854d0e' : '#991b1b'
                                        }}
                                    >
                                        {item.roas.toFixed(2)}x
                                    </span>
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                                    {formatCurrency(item.conversions_value)}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={10} className="py-12 text-center opacity-50">
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
