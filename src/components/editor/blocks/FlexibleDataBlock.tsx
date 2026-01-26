import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useReportEditor, ReportEditorProvider } from '../../../contexts/ReportEditorContext';
import { Settings, Loader2, X, Info, TrendingUp, TrendingDown } from 'lucide-react';
import type { ReportDesign } from '../../../types/reportTypes';
import { executeQuery } from '../../../services/googleAds';
import { buildFlexibleQuery } from '../../../services/gaql';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0066ff', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Computed Metrics Definition
const COMPUTED_METRICS: Record<string, { dependencies: string[], calculate: (row: any) => number }> = {
    'metrics.ctr': {
        dependencies: ['metrics.clicks', 'metrics.impressions'],
        calculate: (row) => row['metrics.impressions'] > 0 ? (row['metrics.clicks'] / row['metrics.impressions']) * 100 : 0
    },
    'metrics.average_cpc': {
        dependencies: ['metrics.cost_micros', 'metrics.clicks'],
        calculate: (row) => row['metrics.clicks'] > 0 ? (row['metrics.cost_micros'] / row['metrics.clicks']) : 0
    },
    'metrics.cost_per_conversion': {
        dependencies: ['metrics.cost_micros', 'metrics.conversions'],
        calculate: (row) => row['metrics.conversions'] > 0 ? (row['metrics.cost_micros'] / row['metrics.conversions']) : 0
    },
    'metrics.conversions_value_per_cost': {
        dependencies: ['metrics.conversions_value', 'metrics.cost_micros'],
        calculate: (row) => row['metrics.cost_micros'] > 0 ? (row['metrics.conversions_value'] / (row['metrics.cost_micros'] / 1000000)) : 0
    }
};

// Configuration Interface
export interface FlexibleDataConfig {
    title: string;
    metrics: string[];
    dimension?: string;
    visualization: 'table' | 'bar' | 'line' | 'pie' | 'scorecard';
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    isNew?: boolean;
    isConfigActive?: boolean;
    showComparison?: boolean;
    comparisonType?: 'previous_period' | 'previous_year';
}

export interface FlexibleDataBlockProps {
    config: FlexibleDataConfig;
    onUpdateConfig: (newConfig: FlexibleDataConfig) => void;
    editable?: boolean;
    accountId?: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    design?: ReportDesign;
}

// Internal component for the Preview section to share data fetching logic
const DataRenderer: React.FC<{
    config: FlexibleDataConfig;
    accountId: string;
    campaignIds: string[];
    startDate: Date | string;
    endDate: Date | string;
    height?: number | string;
    showRawData?: boolean;
    design?: ReportDesign;
}> = React.memo(({ config, accountId, campaignIds, startDate, endDate, height = '100%', showRawData = false, design }) => {
    const { t } = useTranslation('reports');

    // Generate colors based on design or fallback to defaults
    const chartColors = useMemo(() => {
        if (!design?.colorScheme) return COLORS;
        const { primary, secondary, accent } = design.colorScheme;
        return [primary, secondary, accent, '#FFBB28', '#FF8042', '#8884d8'];
    }, [design]);

    const [data, setData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [rawResults, setRawResults] = useState<any[]>([]);
    const [queries, setQueries] = useState<{ current: string; comparison?: string }>({ current: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);

    const tableData = useMemo(() => {
        if (!config.showComparison || !config.dimension) return data;
        return data.map(item => {
            const joinKey = item[config.dimension!];
            const prevItem = comparisonData.find(p => p[config.dimension!] === joinKey);
            const merged = { ...item };
            config.metrics.forEach(m => {
                const prevVal = Number(prevItem?.[m]) || 0;
                merged[`${m}_prev`] = prevVal;
                merged[`${m}_delta`] = prevVal !== 0 ? ((Number(item[m]) - prevVal) / prevVal) * 100 : 0;
            });
            return merged;
        });
    }, [data, comparisonData, config.showComparison, config.dimension, config.metrics]);

    // Debounced fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [
        accountId,
        JSON.stringify(campaignIds),
        startDate?.toString(),
        endDate?.toString(),
        config.dimension,
        config.visualization,
        config.limit,
        config.sortBy,
        config.sortOrder,
        config.showComparison,
        config.comparisonType,
        JSON.stringify(config.metrics)
    ]);

    const fetchData = async () => {
        // If missing context, use mock data (Template Mode)
        if (!accountId || !startDate || !endDate) {
            generateMockData();
            return;
        }

        setLoading(true);
        setError(null);
        setIsMockData(false);
        try {
            // Ensure dates are parsed correctly, handling both Date objects and strings
            const sDate = new Date(startDate);
            const eDate = new Date(endDate);

            if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
                console.warn("Invalid Date detected:", { startDate, endDate });
                throw new Error('Invalid date range');
            }

            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            const startStr = formatDate(sDate);
            const endStr = formatDate(eDate);

            const query = buildFlexibleQuery({
                ...config,
                metrics: getEffectiveMetrics(config.metrics, config.visualization)
            }, {
                startDate: startStr,
                endDate: endStr,
                campaignIds: campaignIds
            });

            const newQueries: { current: string; comparison?: string } = { current: query };

            // Fetch Current Period
            const currentPromise = executeQuery(accountId, query);

            // Fetch Comparison Period if enabled
            let comparisonPromise = Promise.resolve({ success: true, results: [] } as any);
            if (config.showComparison) {
                const prev = getPreviousPeriod(sDate, eDate, config.comparisonType || 'previous_period');
                const comparisonQuery = buildFlexibleQuery({
                    ...config,
                    metrics: getEffectiveMetrics(config.metrics, config.visualization)
                }, {
                    startDate: formatDate(prev.startDate),
                    endDate: formatDate(prev.endDate),
                    campaignIds: campaignIds
                });
                newQueries.comparison = comparisonQuery;
                comparisonPromise = executeQuery(accountId, comparisonQuery);
            }

            setQueries(newQueries);

            const [result, comparisonResult] = await Promise.all([currentPromise, comparisonPromise]);

            if (!result.success) throw new Error(result.error || 'Failed to fetch data');
            if (config.showComparison && !comparisonResult.success) {
                console.warn('Comparison fetch failed:', comparisonResult.error);
            }

            setRawResults(result.results || []);

            const processResults = (results: any[]) => {
                return (results || []).map((row: any) => {
                    const flatRow: any = {};
                    if (config.dimension) {
                        const dimParts = config.dimension.split('.');
                        if (dimParts.length === 2 && row[dimParts[0]]) {
                            flatRow[config.dimension] = row[dimParts[0]][dimParts[1]];
                        } else if (dimParts[0] === 'segments' && row.segments) {
                            flatRow[config.dimension] = row.segments[dimParts[1]];
                        }
                    }
                    config.metrics.forEach((m: string) => {
                        const parts = m.split('.');
                        if (row[parts[0]]) {
                            flatRow[m] = row[parts[0]][parts[1]];
                        }
                    });

                    // Also ensure dependencies are present for client-side calc
                    if (config.visualization === 'scorecard') {
                        getEffectiveMetrics(config.metrics, config.visualization).forEach(m => {
                            const parts = m.split('.');
                            if (row[parts[0]]) flatRow[m] = row[parts[0]][parts[1]];
                        });
                    }

                    return flatRow;
                });
            };

            setData(processResults(result.results));
            if (config.showComparison) {
                setComparisonData(processResults(comparisonResult.results));
            } else {
                setComparisonData([]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            generateMockData(); // Fallback to mock on error
        } finally {
            setLoading(false);
        }
    };

    const getEffectiveMetrics = (metrics: string[], visualization: string) => {
        // For scorecard, we MUST fetch dependencies instead of rate metrics to aggregate correctly
        if (visualization === 'scorecard') {
            const effective = new Set<string>();
            metrics.forEach(m => {
                if (COMPUTED_METRICS[m]) {
                    COMPUTED_METRICS[m].dependencies.forEach(d => effective.add(d));
                } else {
                    effective.add(m);
                }
            });
            return Array.from(effective);
        }
        return metrics;
    };

    const generateMockData = () => {
        setIsMockData(true);
        setError(null);
        setLoading(false);

        // Generate last 30 days for date dimension
        const generateDateRange = (days: number) => {
            const dates = [];
            const end = new Date();
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(end.getDate() - i);
                dates.push(d.toISOString().split('T')[0]);
            }
            return dates;
        };

        const dimensions: Record<string, string[]> = {
            'segments.date': generateDateRange(30),
            'campaign.name': ['Hiver Promo 2024', 'Search France', 'Display Retargeting', 'Video Awareness', 'Perf Max All'],
            'ad_group.name': ['Groupe A - Premium', 'Groupe B - Eco', 'Annonces Dynamiques', 'Remarketing List', 'Generic Search'],
            'segments.device': ['MOBILE', 'DESKTOP', 'TABLET', 'CONNECTED_TV', 'OTHER']
        };

        const dimKey = config.dimension || 'campaign.name';
        const dimValues = dimensions[dimKey] || dimensions['campaign.name'];

        const currentData: any[] = [];
        const prevData: any[] = [];

        // Seed for consistent pseudo-randomness (optional, but good for demo stability)
        // For simplicity, we just use Math.random() but smooth it for dates

        let lastVal = 1000;
        dimValues.forEach((val, i) => {
            const currRow: any = { [config.dimension || '']: val };
            const prevRow: any = { [config.dimension || '']: val };

            config.metrics.forEach(m => {
                const metricKey = m.split('.')[1];

                // Smoother trend for dates
                let base;
                if (dimKey === 'segments.date') {
                    // Random walk
                    const change = (Math.random() - 0.5) * 200;
                    lastVal = Math.max(100, lastVal + change);
                    base = lastVal + Math.sin(i / 3) * 200; // Add some seasonality
                } else {
                    base = Math.random() * 1000 + 500;
                }

                const isMoney = metricKey.includes('micros') || ['cost', 'average_cpc', 'cost_per_conversion'].includes(metricKey);
                currRow[m] = isMoney ? base * 1000000 : base;

                // N-1 Data
                const prevBase = base * (0.8 + Math.random() * 0.4); // +/- 20% variation
                prevRow[m] = isMoney ? prevBase * 1000000 : prevBase;
            });
            currentData.push(currRow);
            prevData.push(prevRow);
        });

        setData(currentData);
        setComparisonData(prevData);
    };

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

    if ((!accountId || !startDate || !endDate) && !isMockData) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-[var(--color-text-muted)] italic text-sm">
                <Info size={24} className="mb-2 opacity-30" />
                <p>{t('flexibleBlock.waitingContext')}</p>
            </div>
        );
    }

    if (loading) return <div className="flex items-center justify-center p-8 glass rounded-2xl h-full"><Loader2 className="animate-spin text-primary" /></div>;
    if (error) return <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm"><p>{error}</p></div>;

    if (showRawData) {
        return (
            <div className="h-full overflow-hidden flex flex-col gap-4">
                <div className="flex-1 overflow-hidden flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">GAQL Queries</span>
                    <div className="space-y-2 overflow-auto custom-scrollbar">
                        <div className="space-y-1">
                            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter">Current Period</span>
                            <pre className="bg-gray-800 text-blue-200 p-3 rounded-xl text-[10px] border border-white/5 font-mono whitespace-pre-wrap">
                                {queries.current}
                            </pre>
                        </div>
                        {queries.comparison && (
                            <div className="space-y-1">
                                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-tighter">Comparison Period</span>
                                <pre className="bg-gray-800 text-purple-200 p-3 rounded-xl text-[10px] border border-white/5 font-mono whitespace-pre-wrap">
                                    {queries.comparison}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Raw JSON Output ({rawResults.length} records)</span>
                    <pre className="flex-1 bg-gray-900 text-green-400 p-4 rounded-xl text-[10px] overflow-auto custom-scrollbar font-mono border border-white/5">
                        {JSON.stringify(rawResults, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    if (data.length === 0) return <div className="flex items-center justify-center p-8 text-gray-400 text-sm border-2 border-dashed border-[var(--color-border)] rounded-2xl">{t('flexibleBlock.emptyState')}</div>;

    const tooltipStyle = {
        backgroundColor: design?.colorScheme?.background || 'var(--color-bg-primary)',
        borderRadius: '12px',
        border: `1px solid ${design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)'}`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        fontSize: '12px',
        color: design?.colorScheme?.text || '#111827'
    };

    const formatValue = (val: number, metricName: string) => {
        if (val === undefined || val === null) return '-';
        let displayVal = val;

        // Convert micros to units for money fields
        const moneyFields = ['cost_micros', 'average_cpc', 'cost_per_conversion', 'conversions_value', 'cost'];
        if (moneyFields.includes(metricName) && Math.abs(val) > 1000) {
            displayVal = val / 1000000;
        }

        // Special handling for ROAS (ratio) - it's already a regular number, usually around 0-10 or 100
        if (metricName === 'conversions_value_per_cost') {
            // Google Ads API returns ROAS as a number (e.g. 5.2). 
            // If we calculated it manually: (Value / Cost).
            // Let's assume input is already the ratio.
            return displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        if (moneyFields.includes(metricName)) {
            return displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        }
        if (metricName === 'ctr') {
            return displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
        }
        return displayVal.toLocaleString();
    };

    return (
        <div className="h-full w-full overflow-hidden relative" style={{ fontFamily: design?.typography?.fontFamily }}>
            {isMockData && (
                <div
                    className="absolute top-2 right-2 z-10 text-[8px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 shadow-sm"
                    style={{
                        backgroundColor: design?.mode === 'dark' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(234, 88, 12, 0.1)',
                        borderColor: design?.mode === 'dark' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(234, 88, 12, 0.2)',
                        color: design?.mode === 'dark' ? '#fb923c' : '#ea580c'
                    }}
                >
                    <Info size={10} />
                    DEMO MODE
                </div>
            )}
            {(() => {
                switch (config.visualization) {
                    case 'table':
                        return (
                            <div
                                className="overflow-x-auto h-full report-scrollbar"
                                style={{
                                    '--scrollbar-track': design?.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    '--scrollbar-thumb': design?.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                                    '--scrollbar-thumb-hover': design?.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                                } as React.CSSProperties}
                            >
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0" style={{ backgroundColor: design?.colorScheme?.background || 'var(--color-bg-primary)' }}>
                                        <tr className="border-b border-[var(--color-border)]">
                                            <th className="text-left p-3 font-bold uppercase tracking-wider text-[10px]" style={{ color: design?.colorScheme?.primary || 'var(--color-text-muted)' }}>
                                                {config.dimension ? t(`flexibleBlock.dimensions.${config.dimension.split('.')[0] === 'segments' ? config.dimension.split('.')[1] : config.dimension.split('.')[0]}`) : t('flexibleBlock.fields.none')}
                                            </th>
                                            {config.metrics.map((m: string) => (
                                                <React.Fragment key={m}>
                                                    <th className="text-right p-3 font-bold uppercase tracking-wider text-[10px]" style={{ color: design?.colorScheme?.primary || 'var(--color-text-muted)' }}>
                                                        {t(`flexibleBlock.metricsList.${m.split('.')[1]}`)}
                                                    </th>
                                                    {config.showComparison && (
                                                        <>
                                                            <th className="text-right p-3 font-bold uppercase tracking-wider text-[10px] opacity-60">N-1</th>
                                                            <th className="text-right p-3 font-bold uppercase tracking-wider text-[10px] opacity-60">Δ%</th>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="report-scrollbar">
                                        {tableData.map((row, idx) => (
                                            <tr key={idx} className="border-b last:border-0 transition-colors" style={{ borderColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)', backgroundColor: 'transparent' }}>
                                                <td className="p-3" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>{row[config.dimension || ''] || '-'}</td>
                                                {config.metrics.map((m: string) => {
                                                    const metricName = m.split('.')[1];

                                                    return (
                                                        <React.Fragment key={m}>
                                                            <td className="text-right p-3 font-medium" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>{formatValue(row[m], metricName)}</td>
                                                            {config.showComparison && (() => {
                                                                const delta = row[`${m}_delta`];
                                                                const isInverse = ['average_cpc', 'cost_per_conversion'].includes(metricName);
                                                                // Safe access with fallback
                                                                const formattedDelta = (delta !== undefined && delta !== null) ? delta.toFixed(1) : '0.0';
                                                                const isNeutral = formattedDelta === '0.0' || formattedDelta === '-0.0';
                                                                const isPos = isInverse ? delta < 0 : delta > 0;
                                                                const trendColor = isNeutral ? 'text-[var(--color-text-muted)]' : (isPos ? 'text-green-500' : 'text-red-500');

                                                                return (
                                                                    <>
                                                                        <td className="text-right p-3 text-[var(--color-text-muted)] opacity-70 italic">{formatValue(row[`${m}_prev`], metricName)}</td>
                                                                        <td className={`text-right p-3 font-bold ${trendColor}`}>
                                                                            {!isNeutral && (delta > 0 ? '+' : '')}{formattedDelta}%
                                                                        </td>
                                                                    </>
                                                                );
                                                            })()}
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
                            <ResponsiveContainer width="100%" height={height as any}>
                                <BarChart data={tableData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis dataKey={config.dimension} tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b7280', fontFamily: design?.typography?.fontFamily }} axisLine={{ stroke: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)' }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b7280', fontFamily: design?.typography?.fontFamily }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ ...tooltipStyle, fontFamily: design?.typography?.fontFamily }} />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: design?.typography?.fontFamily, color: design?.colorScheme?.text || '#111827' }} />
                                    {config.metrics.map((m: string, i: number) => (
                                        <React.Fragment key={m}>
                                            <Bar dataKey={m} name={t(`flexibleBlock.metricsList.${m.split('.')[1]}`)} fill={chartColors[i % chartColors.length]} radius={[4, 4, 0, 0]} />
                                            {config.showComparison && (
                                                <Bar dataKey={`${m}_prev`} name={`${t(`flexibleBlock.metricsList.${m.split('.')[1]}`)} (N-1)`} fill={chartColors[i % chartColors.length]} opacity={0.3} radius={[4, 4, 0, 0]} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        );
                    case 'line':
                        return (
                            <ResponsiveContainer width="100%" height={height as any}>
                                <LineChart data={tableData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis dataKey={config.dimension} tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b7280', fontFamily: design?.typography?.fontFamily }} axisLine={{ stroke: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)' }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b7280', fontFamily: design?.typography?.fontFamily }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ ...tooltipStyle, fontFamily: design?.typography?.fontFamily }} />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: design?.typography?.fontFamily, color: design?.colorScheme?.text || '#111827' }} />
                                    {config.metrics.map((m: string, i: number) => (
                                        <React.Fragment key={m}>
                                            <Line type="monotone" dataKey={m} name={t(`flexibleBlock.metricsList.${m.split('.')[1]}`)} stroke={chartColors[i % chartColors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            {config.showComparison && (
                                                <Line type="monotone" dataKey={`${m}_prev`} name={`${t(`flexibleBlock.metricsList.${m.split('.')[1]}`)} (N-1)`} stroke={chartColors[i % chartColors.length]} strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        );
                    case 'pie':
                        const pieRadius = typeof height === 'number' ? height / 3 : 100;
                        return (
                            <ResponsiveContainer width="100%" height={height as any}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={pieRadius}
                                        fill={chartColors[0]}
                                        dataKey={config.metrics[0]}
                                        nameKey={config.dimension}
                                        label={(props: any) => (
                                            <text
                                                x={props.x}
                                                y={props.y}
                                                textAnchor={props.textAnchor}
                                                dominantBaseline="central"
                                                fill={design?.colorScheme?.text || '#111827'}
                                                style={{ fontSize: 10, fontFamily: design?.typography?.fontFamily }}
                                            >
                                                {`${props.name} ${(props.percent * 100).toFixed(0)}% `}
                                            </text>
                                        )}
                                    >
                                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ ...tooltipStyle, fontFamily: design?.typography?.fontFamily }} />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: design?.typography?.fontFamily, color: design?.colorScheme?.text || '#111827' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        );
                    case 'scorecard':
                        const gridCols = config.metrics.length <= 4 ? 'grid-cols-2' : config.metrics.length <= 6 ? 'grid-cols-3' : 'grid-cols-4';
                        return (
                            <div className={`grid ${gridCols} gap-4 h-full items-center`}>
                                {config.metrics.map((m: string) => {
                                    // Helper for aggregation
                                    const aggregate = (dataset: any[]) => {
                                        if (COMPUTED_METRICS[m]) {
                                            // Sum dependencies first
                                            const summedDeps: any = {};
                                            COMPUTED_METRICS[m].dependencies.forEach(dep => {
                                                summedDeps[dep] = dataset.reduce((sum, row) => sum + (Number(row[dep]) || 0), 0);
                                            });
                                            // Calculate rate from sums
                                            return COMPUTED_METRICS[m].calculate(summedDeps);
                                        }
                                        return dataset.reduce((sum, row) => sum + (Number(row[m]) || 0), 0);
                                    };

                                    const total = aggregate(data);
                                    const prevTotal = aggregate(comparisonData);

                                    const diff = total - prevTotal;
                                    const percentChange = prevTotal !== 0 ? (diff / prevTotal) * 100 : 0;
                                    const formattedPercent = percentChange.toFixed(1);
                                    const isNeutral = formattedPercent === '0.0' || formattedPercent === '-0.0';

                                    const metricName = m.split('.')[1];
                                    const isInverse = ['average_cpc', 'cost_per_conversion'].includes(metricName);
                                    const isPositive = isInverse ? diff < 0 : diff > 0;
                                    const trendColor = isNeutral ? 'text-[var(--color-text-muted)]' : (isPositive ? 'text-green-500' : 'text-red-500');

                                    return (
                                        <div key={m} className="p-5 rounded-2xl text-center border shadow-sm flex flex-col justify-center gap-1" style={{ borderColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', backgroundColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)' }}>
                                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: design?.colorScheme?.secondary || 'var(--color-text-muted)' }}>
                                                {t(`flexibleBlock.metricsList.${metricName}`)}
                                            </div>
                                            <div className="text-2xl font-bold" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>
                                                {formatValue(total, metricName)}
                                            </div>
                                            {config.showComparison && (
                                                <div className={`flex items-center justify-center gap-1 text-[10px] font-bold ${trendColor}`}>
                                                    {!isNeutral && (isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                                                    <span>{!isNeutral && percentChange > 0 ? '+' : ''}{formattedPercent}%</span>
                                                    <span className="text-[var(--color-text-muted)] font-normal ml-1">vs N-1</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    default:
                        return null;
                }
            })()}
        </div >
    );
});

export const FlexibleDataBlock: React.FC<FlexibleDataBlockProps> = React.memo(({
    config,
    onUpdateConfig,
    editable = false,
    accountId: propAccountId,
    campaignIds: propCampaignIds,
    startDate: propStartDate,
    endDate: propEndDate,
    design: propDesign,
}) => {
    const { t } = useTranslation('reports');
    const context = useReportEditor();

    // Props take precedence over context for specific block consistency
    const accountId = propAccountId || context.accountId || '';
    const campaignIds = propCampaignIds || context.campaignIds || [];
    const startDate = propStartDate || context.startDate;
    const endDate = propEndDate || context.endDate;
    const design = propDesign || context.design;

    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const [showRawData, setShowRawData] = useState(false);

    const activeConfig: FlexibleDataConfig = useMemo(() => ({
        title: config.title || t('flexibleBlock.modalTitle'),
        metrics: config.metrics || ['metrics.impressions', 'metrics.clicks'],
        dimension: config.dimension || 'segments.date',
        visualization: config.visualization || 'table',
        limit: config.limit || 10,
        sortBy: config.sortBy || 'metrics.impressions',
        sortOrder: config.sortOrder || 'DESC',
        isNew: config.isNew,
        isConfigActive: config.isConfigActive,
        showComparison: config.showComparison,
        comparisonType: config.comparisonType
    }), [config, t]);

    const [editConfig, setEditConfig] = useState<FlexibleDataConfig>(activeConfig);

    useEffect(() => {
        if (isConfigOpen) {
            setEditConfig(activeConfig);
            setShowRawData(false);
        }
    }, [isConfigOpen, activeConfig]);

    useEffect(() => {
        if (editable && (config.isNew || config.isConfigActive)) {
            setIsConfigOpen(true);

            // Immediately clear the flags to avoid re-opening on remount or report load
            if (config.isNew || config.isConfigActive) {
                onUpdateConfig({
                    ...config,
                    isNew: false,
                    isConfigActive: false
                });
            }
        }
    }, [editable, config.isNew, config.isConfigActive]);

    const handleSave = () => {
        const { isNew, isConfigActive, ...cleanConfig } = editConfig;
        onUpdateConfig({ ...cleanConfig, isConfigActive: false });
        setIsConfigOpen(false);
    };

    const handleCancel = () => {
        if (config.isConfigActive) {
            onUpdateConfig({ ...config, isConfigActive: false });
        }
        setIsConfigOpen(false);
    };

    const ConfigModal = (
        <AnimatePresence>
            {isConfigOpen && (
                <ReportEditorProvider {...context}>
                    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 xl:p-8" onClick={(e) => e.stopPropagation()}>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCancel}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[var(--color-bg-primary)] rounded-3xl shadow-2xl flex flex-col w-[1400px] max-w-[95vw] h-[90vh] overflow-hidden border border-[var(--color-border)]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                                <div>
                                    <h4 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('flexibleBlock.modalTitle')}</h4>
                                    <p className="text-sm text-[var(--color-text-muted)]">{t('flexibleBlock.modalSubtitle')}</p>
                                </div>
                                <button onClick={handleCancel} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors text-[var(--color-text-muted)]">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                                {/* Settings Panel */}
                                <div className="border-r border-[var(--color-border)] overflow-y-auto p-6 lg:p-8 bg-transparent custom-scrollbar">
                                    <div className="space-y-5">
                                        <section>
                                            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.title')}</label>
                                            <input
                                                type="text"
                                                value={editConfig.title}
                                                onChange={(e) => setEditConfig({ ...editConfig, title: e.target.value })}
                                                className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[var(--color-text-muted)]/50"
                                                placeholder={t('flexibleBlock.fields.titlePlaceholder')}
                                            />
                                        </section>

                                        <section>
                                            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.visualStyle')}</label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {(['table', 'bar', 'line', 'pie', 'scorecard'] as const).map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setEditConfig({ ...editConfig, visualization: type })}
                                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${editConfig.visualization === type ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10' : 'border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'}`}
                                                    >
                                                        <span className="capitalize text-[10px] font-bold">{t(`flexibleBlock.visualizations.${type}`)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.dimension')}</label>
                                                <select
                                                    value={editConfig.dimension || ''}
                                                    onChange={(e) => setEditConfig({ ...editConfig, dimension: e.target.value || undefined })}
                                                    className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                                >
                                                    <option value="">{t('flexibleBlock.fields.none')}</option>
                                                    <option value="segments.date">{t('flexibleBlock.dimensions.date')}</option>
                                                    <option value="campaign.name">{t('flexibleBlock.dimensions.campaign')}</option>
                                                    <option value="ad_group.name">{t('flexibleBlock.dimensions.ad_group')}</option>
                                                    <option value="segments.device">{t('flexibleBlock.dimensions.device')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.limit')}</label>
                                                <input
                                                    type="number"
                                                    value={editConfig.limit}
                                                    min="1"
                                                    max="100"
                                                    onChange={(e) => setEditConfig({ ...editConfig, limit: parseInt(e.target.value) || 10 })}
                                                    className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                        </section>

                                        <section className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{t('flexibleBlock.fields.comparison')}</label>
                                                    <p className="text-[10px] text-[var(--color-text-muted)]">{t('flexibleBlock.fields.comparisonDescription')}</p>
                                                </div>
                                                <button
                                                    onClick={() => setEditConfig({ ...editConfig, showComparison: !editConfig.showComparison })}
                                                    className={`w-10 h-5 rounded-full transition-colors relative ${editConfig.showComparison ? 'bg-primary' : 'bg-[var(--color-bg-tertiary)]'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editConfig.showComparison ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            {editConfig.showComparison && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(['previous_period', 'previous_year'] as const).map((type) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => setEditConfig({ ...editConfig, comparisonType: type })}
                                                            className={`p-2 rounded-xl text-[10px] font-bold border transition-all ${editConfig.comparisonType === type ? 'border-primary bg-primary text-white' : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'}`}
                                                        >
                                                            {t(`flexibleBlock.comparisonTypes.${type}`)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        <section>
                                            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.metrics')}</label>
                                            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                                {[
                                                    { id: 'metrics.impressions' },
                                                    { id: 'metrics.clicks' },
                                                    { id: 'metrics.cost_micros' },
                                                    { id: 'metrics.ctr' },
                                                    { id: 'metrics.average_cpc' },
                                                    { id: 'metrics.conversions' },
                                                    { id: 'metrics.conversions_value' },
                                                    { id: 'metrics.cost_per_conversion' },
                                                    { id: 'metrics.conversions_value_per_cost' },
                                                ].map((m) => {
                                                    const metricKey = m.id.split('.')[1];
                                                    const exists = editConfig.metrics.includes(m.id);
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => setEditConfig({ ...editConfig, metrics: exists ? editConfig.metrics.filter(x => x !== m.id) : [...editConfig.metrics, m.id] })}
                                                            className={`flex items-center justify-center text-center px-3 py-2.5 rounded-xl border transition-all ${exists ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]' : 'border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'}`}
                                                        >
                                                            <span className="text-[10px] font-bold">{t(`flexibleBlock.metricsList.${metricKey}`)}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                {/* Live Preview Panel */}
                                <div className="flex-1 bg-[var(--color-bg-secondary)] p-6 lg:p-8 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                                            <div className="p-1.5 bg-primary/10 rounded-lg"><Info size={16} className="text-primary" /></div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('flexibleBlock.previewTitle')}</span>
                                        </div>
                                        <button
                                            onClick={() => setShowRawData(!showRawData)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border ${showRawData ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'}`}
                                        >
                                            {showRawData ? 'Visual' : 'RAW JSON'}
                                        </button>
                                    </div>
                                    <div
                                        className="flex-1 rounded-2xl shadow-xl flex flex-col p-6 lg:p-8 overflow-hidden"
                                        style={{
                                            backgroundColor: design?.colorScheme?.background || 'var(--color-bg-primary)',
                                            border: `1px solid ${design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)'}`,
                                            color: design?.colorScheme?.text || 'var(--color-text-primary)'
                                        }}
                                    >
                                        <div className="mb-6 flex justify-between items-end">
                                            <div className="space-y-0.5">
                                                <h3 className="text-xl font-bold leading-tight" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>{editConfig.title || t('flexibleBlock.previewSubtitle')}</h3>
                                                <p className="text-[10px]" style={{ color: design?.colorScheme?.secondary || 'var(--color-text-muted)' }}>
                                                    {accountId ? `Compte ID: ${accountId}` : 'Compte non sélectionné'}
                                                </p>
                                            </div>
                                            <div
                                                className="text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border"
                                                style={{
                                                    backgroundColor: design?.colorScheme?.primary ? `${design.colorScheme.primary}1A` : 'rgba(var(--primary-rgb), 0.1)',
                                                    borderColor: design?.colorScheme?.primary ? `${design.colorScheme.primary}33` : 'rgba(var(--primary-rgb), 0.2)',
                                                    color: design?.colorScheme?.primary || 'var(--color-primary)'
                                                }}
                                            >
                                                {t(`flexibleBlock.visualizations.${editConfig.visualization}`)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-0 overflow-hidden">
                                            <DataRenderer
                                                config={editConfig}
                                                accountId={accountId}
                                                campaignIds={campaignIds}
                                                startDate={startDate || ''}
                                                endDate={endDate || ''}
                                                height="100%"
                                                showRawData={showRawData}
                                                design={design || undefined}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-6 border-t border-[var(--color-border)] flex justify-end gap-4 bg-[var(--color-bg-secondary)]/50 backdrop-blur-md">
                                <button onClick={handleCancel} className="btn btn-secondary px-8">{t('flexibleBlock.actions.cancel')}</button>
                                <button onClick={handleSave} className="btn btn-primary px-10 shadow-xl shadow-primary/25">
                                    {activeConfig.isNew ? t('flexibleBlock.actions.create') : t('flexibleBlock.actions.update')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </ReportEditorProvider>
            )}
        </AnimatePresence>
    );

    return (
        <div className="flexible-data-block relative group">
            <div
                className="overflow-hidden rounded-2xl transition-all"
                style={{
                    backgroundColor: design?.colorScheme?.background || '#ffffff',
                    border: 'none',
                    color: design?.colorScheme?.text || '#111827',
                    boxShadow: design?.mode === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div className="px-5 py-4 border-b flex justify-between items-center" style={{
                    borderColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                    backgroundColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                }}>
                    <h3 className="font-bold" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>{activeConfig.title}</h3>
                    {editable && (
                        <button
                            onClick={() => setIsConfigOpen(true)}
                            className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-xl transition-all text-[var(--color-text-muted)] hover:text-primary border border-transparent hover:border-[var(--color-border)] shadow-sm"
                        >
                            <Settings size={16} />
                        </button>
                    )}
                </div>

                <div
                    className="p-6 bg-transparent h-[320px] overflow-auto report-scrollbar"
                    style={{
                        '--scrollbar-track': design?.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        '--scrollbar-thumb': design?.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                        '--scrollbar-thumb-hover': design?.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                    } as React.CSSProperties}
                >
                    <DataRenderer
                        config={activeConfig}
                        accountId={accountId}
                        campaignIds={campaignIds}
                        startDate={startDate || ''}
                        endDate={endDate || ''}
                        design={design || undefined}
                        height={280}
                    />
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(ConfigModal, document.body)}
        </div>
    );
});

export default FlexibleDataBlock;
