import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { useChartFont } from '../../../contexts/FontContext';
import { Loader2 } from 'lucide-react';
import type { ReportDesign } from '../../../types/reportTypes';
import { fetchMetaInsights } from '../../../services/metaAds';
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Colors for charts
const COLORS = ['#1963d5', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export interface FlexibleDataConfig {
    title: string;
    metrics: string[]; // e.g., 'metrics.impressions', 'metrics.spend'
    dimension?: string; // 'segments.date', 'campaign.name', 'adset.name'
    visualization: 'table' | 'bar' | 'line' | 'pie' | 'scorecard';
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    isNew?: boolean;
    isConfigActive?: boolean;
    showComparison?: boolean;
    comparisonType?: 'previous_period' | 'previous_year';
    description?: string;
}

export interface FlexibleMetaBlockProps {
    config: FlexibleDataConfig;
    onUpdateConfig: (newConfig: Partial<FlexibleDataConfig>) => void;
    editable?: boolean;
    selected?: boolean;
    onDelete?: () => void;
    accountId?: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    design?: ReportDesign;
    variant?: 'default' | 'chromeless';
}

export const FlexibleMetaBlock: React.FC<FlexibleMetaBlockProps> = ({
    config,
    accountId: propAccountId,
    startDate: propStartDate,
    endDate: propEndDate,
    design: propDesign,
    variant,
}) => {
    const { t } = useTranslation('reports');
    const context = useReportEditor();

    // Props take precedence over context
    const accountId = propAccountId || context.metaAccountId; // Use metaAccountId from context if available
    // Meta ads doesn't strictly filter by campaign IDs in the same way as Google Ads currently in the backend
    // but we can filter results client-side if needed or update backend further.
    // For now, let's assume account level with optional campaign filtering later.
    const startDate = propStartDate || context.startDate;
    const endDate = propEndDate || context.endDate;
    const design = propDesign || context.design;

    const { fontFamily: chartFontFamily } = useChartFont();
    const effectiveFontFamily = design?.typography?.fontFamily || chartFontFamily;

    const [data, setData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate colors
    const chartColors = useMemo(() => {
        if (!design?.colorScheme) return COLORS;
        const { primary, secondary, accent } = design.colorScheme;
        return [primary, secondary, accent, '#FFBB28', '#FF8042', '#8884d8'];
    }, [design]);

    // Determine dimensions and breakdowns for Meta API
    const getMetaParams = useCallback(() => {
        let level: 'campaign' | 'adset' | 'ad' | 'account' = 'campaign';
        let timeIncrement: string | number | undefined = undefined;
        let breakdowns: string[] | undefined = undefined;

        if (config.dimension === 'segments.date') {
            level = 'account'; // Aggregated over account over time
            timeIncrement = 1;
        } else if (config.dimension === 'campaign.name') {
            level = 'campaign';
        } else if (config.dimension === 'adset.name') {
            level = 'adset';
        } else if (config.dimension === 'ad.name') {
            level = 'ad';
        } else if (config.dimension === 'segments.device') {
            level = 'account'; // or campaign
            breakdowns = ['impression_device'];
        } else if (config.dimension === 'segments.platform') {
            level = 'account';
            breakdowns = ['publisher_platform'];
        } else if (config.dimension === 'segments.placement') {
            level = 'account';
            breakdowns = ['platform_position'];
        }

        return { level, timeIncrement, breakdowns };
    }, [config.dimension]);

    const fetchData = useCallback(async () => {
        if (!accountId || !startDate || !endDate) {
            generateMockData();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { level, timeIncrement, breakdowns } = getMetaParams();

            // Robust Date Parsing (handle Firestore Timestamp objects, Strings, or Date objects)
            const parseDate = (d: any): Date => {
                if (d instanceof Date) return d;
                if (d && typeof d.toDate === 'function') return d.toDate(); // Handle Firestore Timestamp
                return new Date(d);
            };

            const sDate = parseDate(startDate);
            const eDate = parseDate(endDate);

            // Additional Date Validation (Year 2000 Sanity Check)
            if (sDate.getFullYear() < 2000) {
                console.warn("[MetaBlock] Date detected before year 2000, falling back to mock data:", {
                    original: startDate,
                    parsed: sDate,
                    year: sDate.getFullYear()
                });
                generateMockData();
                return;
            }

            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            const startStr = formatDate(sDate);
            const endStr = formatDate(eDate);

            // Fetch Current Period
            const response = await fetchMetaInsights(accountId, startStr, endStr, {
                level,
                timeIncrement,
                breakdowns
            });

            if (!response.success && response.error !== 'Token expired') {
                // If specific logic for mock data in template mode is needed, add here
                throw new Error(response.error);
            }

            if (response.success) {
                let processed = processResults(response.insights || []);
                setData(processed);
            } else {
                // Fallback or error handling
                if (context.isTemplateMode) {
                    generateMockData();
                } else {
                    throw new Error(response.error);
                }
            }

            // Comparison Data
            if (config.showComparison && response.success) {
                const prev = getPreviousPeriod(startDate, endDate, config.comparisonType || 'previous_period');
                const prevResponse = await fetchMetaInsights(accountId, formatDate(prev.startDate), formatDate(prev.endDate), {
                    level,
                    timeIncrement,
                    breakdowns
                });

                if (prevResponse.success) {
                    setComparisonData(processResults(prevResponse.insights || []));
                }
            }

        } catch (err: any) {
            console.error("Meta Block Fetch Error:", err);
            if (context.isTemplateMode) {
                generateMockData();
            } else {
                setError(err.message || 'Failed to clean data');
            }
        } finally {
            setLoading(false);
        }
    }, [accountId, startDate, endDate, getMetaParams, config.showComparison, config.comparisonType, context.isTemplateMode]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const processResults = (results: any[]) => {
        return results.map(row => {
            const newRow: any = { ...row };

            // Normalize dimension key for charts
            if (config.dimension === 'segments.date') {
                newRow[config.dimension] = row.date_start; // Meta returns date_start
            } else if (config.dimension === 'campaign.name') {
                newRow[config.dimension] = row.campaignName;
            } else if (config.dimension === 'segments.device') {
                newRow[config.dimension] = row.impression_device;
            }
            // Add others as needed

            // Map metrics if needed (e.g. metrics.impressions -> impressions)
            // The service already returns clean keys like 'impressions', 'clicks', 'spend'.

            return newRow;
        });
    };

    // -- Helpers --
    const getPreviousPeriod = (s: Date, e: Date, type: 'previous_period' | 'previous_year') => {
        const start = new Date(s);
        const end = new Date(e);
        if (type === 'previous_year') {
            const prevStart = new Date(start);
            prevStart.setFullYear(prevStart.getFullYear() - 1);
            const prevEnd = new Date(end);
            prevEnd.setFullYear(prevEnd.getFullYear() - 1);
            return { startDate: prevStart, endDate: prevEnd };
        } else {
            const diff = end.getTime() - start.getTime();
            const prevStart = new Date(start.getTime() - diff - 86400000);
            const prevEnd = new Date(start.getTime() - 86400000);
            return { startDate: prevStart, endDate: prevEnd };
        }
    };

    const generateMockData = () => {
        // ... (Implement mock data generation similar to FlexibleDataBlock if needed)
        // For brevity, using simple mock
        const mock: any[] = [];
        const dim = config.dimension || 'campaign.name';
        for (let i = 0; i < 5; i++) {
            mock.push({
                [dim]: `Item ${i + 1}`,
                impressions: 1000 + i * 100,
                clicks: 50 + i * 10,
                spend: 100 + i * 20,
                conversions: 5 + i,
            });
        }
        setData(mock);
    };

    // Prepare table data with comparison logic (merging current and prev)
    const tableData = useMemo(() => {
        if (!config.showComparison || !config.dimension) return data;
        return data.map(item => {
            const joinKey = item[config.dimension!];
            // Find matching item in comparison data
            // Note: Meta/Google comparisons can be tricky with dates, usually we match by index or aligned date
            const prevItem = comparisonData.find(p => p[config.dimension!] === joinKey);

            const merged = { ...item };
            config.metrics.forEach(m => {
                const metricKey = m.replace('metrics.', ''); // Strip prefix to match data keys
                const currentVal = Number(item[metricKey]) || 0;
                const prevVal = Number(prevItem?.[metricKey]) || 0;

                merged[`${m}_prev`] = prevVal;
                merged[`${m}_delta`] = prevVal !== 0 ? ((currentVal - prevVal) / prevVal) * 100 : 0;
            });
            return merged;
        });
    }, [data, comparisonData, config.showComparison, config.dimension, config.metrics]);

    // --- Render Logic (Similar to FlexibleDataBlock) ---

    const formatValue = (val: number, metricName: string) => {
        if (val === undefined || val === null) return '-';
        let displayVal = val;

        const key = metricName.replace('metrics.', '');
        const moneyFields = ['spend', 'cpc', 'cpm', 'cost_per_purchase', 'cost_per_lead'];
        const percentageFields = ['ctr'];

        if (moneyFields.includes(key)) {
            return displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        }
        if (percentageFields.includes(key)) {
            return displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
        }
        return displayVal.toLocaleString();
    };

    const tooltipStyle = {
        backgroundColor: design?.colorScheme?.background || '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
        fontSize: '12px',
        color: design?.colorScheme?.text || '#000000'
    };

    if (loading) return <div className="flex items-center justify-center p-8 h-full"><Loader2 className="animate-spin text-primary" /></div>;
    if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg text-sm">{error}</div>;

    if (data.length === 0) return <div className="flex items-center justify-center p-8 text-neutral-400 border-2 border-dashed rounded-xl">No Data</div>;

    return (
        <div className="w-full h-full flex flex-col min-h-0 relative" style={{ fontFamily: effectiveFontFamily }}>
            {/* Title */}
            {!variant?.includes('chromeless') && (
                <div className="mb-4">
                    <h3 className="font-bold text-lg" style={{ color: design?.colorScheme?.text }}>{config.title}</h3>
                    {config.description && <p className="text-sm opacity-70">{config.description}</p>}
                </div>
            )}

            <div className="flex-1 min-h-[300px]">
                {(() => {
                    switch (config.visualization) {
                        case 'table':
                            return (
                                <div className="overflow-auto h-full">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-white dark:bg-black z-10">
                                            <tr className="border-b">
                                                <th className="text-left p-2">{t('flexibleBlock.dimensions.' + (config.dimension?.split('.').pop() || ''))}</th>
                                                {config.metrics.map(m => (
                                                    <React.Fragment key={m}>
                                                        <th className="text-right p-2">{t('flexibleBlock.metricsList.' + m.replace('metrics.', ''))}</th>
                                                        {config.showComparison && (
                                                            <>
                                                                <th className="text-right p-2 opacity-50">N-1</th>
                                                                <th className="text-right p-2 opacity-50">%</th>
                                                            </>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((row, idx) => (
                                                <tr key={idx} className="border-b last:border-0">
                                                    <td className="p-2">{row[config.dimension || ''] || '-'}</td>
                                                    {config.metrics.map(m => {
                                                        const key = m.replace('metrics.', '');
                                                        const delta = row[`${m}_delta`];
                                                        const isPos = delta > 0;
                                                        return (
                                                            <React.Fragment key={m}>
                                                                <td className="text-right p-2">{formatValue(row[key], key)}</td>
                                                                {config.showComparison && (
                                                                    <>
                                                                        <td className="text-right p-2 opacity-50">{formatValue(row[`${m}_prev`], key)}</td>
                                                                        <td className={`text-right p-2 ${isPos ? 'text-green-500' : 'text-red-500'}`}>
                                                                            {delta ? delta.toFixed(1) + '%' : '-'}
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        case 'bar':
                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={tableData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis dataKey={config.dimension} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        {config.metrics.map((m, i) => {
                                            const key = m.replace('metrics.', '');
                                            return (
                                                <Bar key={m} dataKey={key} name={t('flexibleBlock.metricsList.' + key)} fill={chartColors[i % chartColors.length]} radius={[4, 4, 0, 0]} />
                                            );
                                        })}
                                    </BarChart>
                                </ResponsiveContainer>
                            );
                        case 'line':
                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={tableData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis dataKey={config.dimension} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        {config.metrics.map((m, i) => {
                                            const key = m.replace('metrics.', '');
                                            return (
                                                <Line key={m} type="monotone" dataKey={key} name={t('flexibleBlock.metricsList.' + key)} stroke={chartColors[i % chartColors.length]} strokeWidth={2} dot={{ r: 3 }} />
                                            );
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            );
                        case 'scorecard':
                            return (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full items-center">
                                    {config.metrics.map(m => {
                                        const key = m.replace('metrics.', '');
                                        // Aggregate
                                        const total = data.reduce((sum, r) => sum + (Number(r[key]) || 0), 0);
                                        const prevTotal = comparisonData.reduce((sum, r) => sum + (Number(r[key]) || 0), 0);
                                        const delta = prevTotal !== 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

                                        return (
                                            <div key={m} className="p-4 rounded-xl border text-center bg-gray-50 dark:bg-white/5">
                                                <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{t('flexibleBlock.metricsList.' + key)}</div>
                                                <div className="text-2xl font-bold">{formatValue(total, key)}</div>
                                                {config.showComparison && (
                                                    <div className={`text-xs mt-1 font-bold ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        default:
                            return <div>Unsupported Visualization</div>;
                    }
                })()}
            </div>
        </div>
    );
};

export default FlexibleMetaBlock;
