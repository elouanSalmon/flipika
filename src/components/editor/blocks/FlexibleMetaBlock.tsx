import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReportBlock from './ReportBlock';
import { useReportEditor, ReportEditorProvider } from '../../../contexts/ReportEditorContext';
import { useChartFont } from '../../../contexts/FontContext';
import { X, Info, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import type { ReportDesign } from '../../../types/reportTypes';
import { fetchMetaInsights } from '../../../services/metaAds';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#1963d5', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Configuration Interface (shared with FlexibleDataBlock for consistency)
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
    snapshot?: any[];
    snapshotComparison?: any[];
}

// ─── Meta-specific metrics available for config ─────────────────────────
const META_METRICS = [
    { id: 'metrics.impressions' },
    { id: 'metrics.clicks' },
    { id: 'metrics.spend' },
    { id: 'metrics.ctr' },
    { id: 'metrics.cpc' },
    { id: 'metrics.cpm' },
    { id: 'metrics.reach' },
    { id: 'metrics.frequency' },
    { id: 'metrics.conversions' },
    { id: 'metrics.purchases' },
    { id: 'metrics.leads' },
    { id: 'metrics.cost_per_purchase' },
    { id: 'metrics.cost_per_lead' },
];

// ─── Meta-specific dimensions ───────────────────────────────────────────
const META_DIMENSIONS = [
    { id: 'segments.date', labelKey: 'date' },
    { id: 'campaign.name', labelKey: 'campaign' },
    { id: 'adset.name', labelKey: 'adset' },
    { id: 'ad.name', labelKey: 'ad' },
    { id: 'segments.device', labelKey: 'device' },
    { id: 'segments.platform', labelKey: 'platform' },
    { id: 'segments.placement', labelKey: 'placement' },
];

// ═══════════════════════════════════════════════════════════════════════
// MetaDataRenderer — Inner component for data fetching & rendering
// ═══════════════════════════════════════════════════════════════════════
const MetaDataRenderer: React.FC<{
    config: FlexibleDataConfig;
    accountId: string;
    startDate: Date | string;
    endDate: Date | string;
    design?: ReportDesign;
    onDataLoaded?: (currentData: any[], comparisonData: any[]) => void;
    snapshot?: any[];
    snapshotComparison?: any[];
}> = React.memo(({ config, accountId, startDate, endDate, design, onDataLoaded, snapshot, snapshotComparison }) => {
    const { t } = useTranslation('reports');
    const context = useReportEditor();
    const { fontFamily: chartFontFamily, chartKey } = useChartFont();
    const effectiveFontFamily = design?.typography?.fontFamily || chartFontFamily;

    const chartColors = useMemo(() => {
        if (!design?.colorScheme) return COLORS;
        const { primary, secondary, accent } = design.colorScheme;
        return [primary, secondary, accent, '#FFBB28', '#FF8042', '#8884d8'];
    }, [design]);

    const [data, setData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
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
                const key = m.replace('metrics.', '');
                const currentVal = Number(item[key]) || 0;
                const prevVal = Number(prevItem?.[key]) || 0;
                merged[`${m}_prev`] = prevVal;
                merged[`${m}_delta`] = prevVal !== 0 ? ((currentVal - prevVal) / prevVal) * 100 : 0;
            });
            return merged;
        });
    }, [data, comparisonData, config.showComparison, config.dimension, config.metrics]);

    // Determine Meta API params from dimension
    const getMetaParams = useCallback(() => {
        let level: 'campaign' | 'adset' | 'ad' | 'account' = 'campaign';
        let timeIncrement: string | number | undefined = undefined;
        let breakdowns: string[] | undefined = undefined;

        if (config.dimension === 'segments.date') {
            level = 'account';
            timeIncrement = 1;
        } else if (config.dimension === 'campaign.name') {
            level = 'campaign';
        } else if (config.dimension === 'adset.name') {
            level = 'adset';
        } else if (config.dimension === 'ad.name') {
            level = 'ad';
        } else if (config.dimension === 'segments.device') {
            level = 'account';
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

    // Debounced fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [
        accountId,
        startDate?.toString(),
        endDate?.toString(),
        config.dimension,
        config.visualization,
        config.limit,
        config.showComparison,
        config.comparisonType,
        JSON.stringify(config.metrics),
        JSON.stringify(snapshot),
        JSON.stringify(snapshotComparison)
    ]);

    const processResults = useCallback((results: any[]) => {
        return (results || []).map(row => {
            const newRow: any = { ...row };
            if (config.dimension === 'segments.date') {
                newRow[config.dimension] = row.date_start;
            } else if (config.dimension === 'campaign.name') {
                newRow[config.dimension] = row.campaignName || row.campaign_name;
            } else if (config.dimension === 'adset.name') {
                newRow[config.dimension] = row.adset_name;
            } else if (config.dimension === 'ad.name') {
                newRow[config.dimension] = row.ad_name;
            } else if (config.dimension === 'segments.device') {
                newRow[config.dimension] = row.impression_device;
            } else if (config.dimension === 'segments.platform') {
                newRow[config.dimension] = row.publisher_platform;
            } else if (config.dimension === 'segments.placement') {
                newRow[config.dimension] = row.platform_position;
            }
            return newRow;
        });
    }, [config.dimension]);

    const fetchData = async () => {
        // Use snapshot data if available (Public Frozen View)
        if (snapshot) {
            const processed = processResults(snapshot);
            setData(processed);
            if (config.showComparison && snapshotComparison) {
                setComparisonData(processResults(snapshotComparison));
            }
            setLoading(false);
            onDataLoaded?.(processed, snapshotComparison ? processResults(snapshotComparison) : []);
            return;
        }

        if (!accountId || !startDate || !endDate) {
            generateMockData();
            return;
        }

        setLoading(true);
        setError(null);
        setIsMockData(false);

        try {
            const parseDate = (d: any): Date => {
                if (d instanceof Date) return d;
                if (d && typeof d.toDate === 'function') return d.toDate();
                return new Date(d);
            };

            const sDate = parseDate(startDate);
            const eDate = parseDate(endDate);

            if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
                console.warn('[MetaBlock] Invalid date:', { startDate, endDate });
                generateMockData();
                return;
            }

            if (sDate.getFullYear() < 2000) {
                console.warn('[MetaBlock] Date before 2000, fallback to mock');
                generateMockData();
                return;
            }

            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            const startStr = formatDate(sDate);
            const endStr = formatDate(eDate);
            const { level, timeIncrement, breakdowns } = getMetaParams();

            const response = await fetchMetaInsights(accountId, startStr, endStr, {
                level,
                timeIncrement,
                breakdowns
            });

            if (response.success) {
                const processed = processResults(response.insights || []);
                setData(processed);
                onDataLoaded?.(processed, []);
            } else {
                if (context.isTemplateMode) {
                    generateMockData();
                } else {
                    throw new Error(response.error || 'Failed to fetch Meta insights');
                }
            }

            // Comparison
            if (config.showComparison && response.success) {
                const prev = getPreviousPeriod(sDate, eDate, config.comparisonType || 'previous_period');
                const prevResponse = await fetchMetaInsights(accountId, formatDate(prev.startDate), formatDate(prev.endDate), {
                    level,
                    timeIncrement,
                    breakdowns
                });
                if (prevResponse.success) {
                    const processedPrev = processResults(prevResponse.insights || []);
                    setComparisonData(processedPrev);
                    onDataLoaded?.(data, processedPrev);
                }
            }
        } catch (err: any) {
            console.error('[MetaBlock] Fetch error:', err);
            if (context.isTemplateMode) {
                generateMockData();
            } else {
                setError(err.message || 'Failed to fetch data');
            }
        } finally {
            setLoading(false);
        }
    };


    const getPreviousPeriod = (s: Date, e: Date, type: 'previous_period' | 'previous_year') => {
        const start = new Date(s);
        const end = new Date(e);
        if (type === 'previous_year') {
            const prevStart = new Date(start); prevStart.setFullYear(prevStart.getFullYear() - 1);
            const prevEnd = new Date(end); prevEnd.setFullYear(prevEnd.getFullYear() - 1);
            return { startDate: prevStart, endDate: prevEnd };
        } else {
            const diff = end.getTime() - start.getTime();
            return {
                startDate: new Date(start.getTime() - diff - 86400000),
                endDate: new Date(start.getTime() - 86400000)
            };
        }
    };

    const generateMockData = () => {
        setIsMockData(true);
        setError(null);
        setLoading(false);

        const generateDateRange = (days: number) => {
            const dates = [];
            const end = new Date();
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(); d.setDate(end.getDate() - i);
                dates.push(d.toISOString().split('T')[0]);
            }
            return dates;
        };

        const dimensions: Record<string, string[]> = {
            'segments.date': generateDateRange(30),
            'campaign.name': ['Summer Sale', 'Retargeting FR', 'Prospection LAL', 'Brand Awareness', 'DPA Catalogue'],
            'adset.name': ['LAL 1% FR', 'Interest Fitness', 'Retarget 7j', 'Broad FR 25-45', 'Custom Audience'],
            'ad.name': ['Video Produit', 'Carrousel Multi', 'Image Lifestyle', 'Story Vertical', 'Collection Ad'],
            'segments.device': ['mobile', 'desktop', 'tablet'],
            'segments.platform': ['facebook', 'instagram', 'audience_network', 'messenger'],
            'segments.placement': ['feed', 'stories', 'reels', 'right_column', 'search']
        };

        const dimKey = config.dimension || 'campaign.name';
        const dimValues = dimensions[dimKey] || dimensions['campaign.name'];

        const currentData: any[] = [];
        const prevData: any[] = [];

        let lastVal = 1000;
        dimValues.forEach((val, i) => {
            const currRow: any = { [config.dimension || '']: val };
            const prevRow: any = { [config.dimension || '']: val };

            config.metrics.forEach(m => {
                const metricKey = m.replace('metrics.', '');
                let base: number;
                if (dimKey === 'segments.date') {
                    const change = (Math.random() - 0.5) * 200;
                    lastVal = Math.max(100, lastVal + change);
                    base = lastVal + Math.sin(i / 3) * 200;
                } else {
                    base = Math.random() * 1000 + 500;
                }

                const moneyFields = ['spend', 'cpc', 'cpm', 'cost_per_purchase', 'cost_per_lead'];
                const percentFields = ['ctr'];
                const ratioFields = ['frequency'];

                if (moneyFields.includes(metricKey)) {
                    currRow[metricKey] = +(base * 0.05).toFixed(2);
                } else if (percentFields.includes(metricKey)) {
                    currRow[metricKey] = +(Math.random() * 5 + 0.5).toFixed(2);
                } else if (ratioFields.includes(metricKey)) {
                    currRow[metricKey] = +(Math.random() * 3 + 1).toFixed(2);
                } else {
                    currRow[metricKey] = Math.round(base);
                }

                const prevBase = currRow[metricKey] * (0.8 + Math.random() * 0.4);
                prevRow[metricKey] = typeof currRow[metricKey] === 'number' && !Number.isInteger(currRow[metricKey])
                    ? +prevBase.toFixed(2)
                    : Math.round(prevBase);
            });

            currentData.push(currRow);
            prevData.push(prevRow);
        });

        setData(currentData);
        setComparisonData(prevData);
        onDataLoaded?.(currentData, prevData);
    };

    // ─── Format values ───────────────────────────────────────────────────
    const formatValue = (val: number, metricName: string) => {
        if (val === undefined || val === null) return '-';
        const key = metricName.replace('metrics.', '');
        const moneyFields = ['spend', 'cpc', 'cpm', 'cost_per_purchase', 'cost_per_lead'];
        const percentFields = ['ctr'];

        if (moneyFields.includes(key)) {
            return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20AC';
        }
        if (percentFields.includes(key)) {
            return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
        }
        return val.toLocaleString();
    };

    const tooltipStyle = {
        backgroundColor: design?.colorScheme?.background || 'var(--color-bg-primary)',
        borderRadius: '12px',
        border: `1px solid ${design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)'}`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '12px',
        color: design?.colorScheme?.text || '#050505'
    };

    // ─── Render states ───────────────────────────────────────────────────
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

    if (data.length === 0) return <div className="flex items-center justify-center p-8 text-neutral-400 text-sm border-2 border-dashed border-[var(--color-border)] rounded-2xl">{t('flexibleBlock.emptyState')}</div>;

    // ─── Visualization Rendering ─────────────────────────────────────────
    return (
        <div className="link-renderer-root flex-1 w-full flex flex-col min-h-[300px] relative" style={{ fontFamily: effectiveFontFamily }}>
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
                                                {config.dimension ? t(`flexibleBlock.dimensions.${config.dimension.split('.').pop()}`) : t('flexibleBlock.fields.none')}
                                            </th>
                                            {config.metrics.map((m: string) => (
                                                <React.Fragment key={m}>
                                                    <th className="text-right p-3 font-bold uppercase tracking-wider text-[10px]" style={{ color: design?.colorScheme?.primary || 'var(--color-text-muted)' }}>
                                                        {t(`flexibleBlock.metricsList.${m.replace('metrics.', '')}`)}
                                                    </th>
                                                    {config.showComparison && (
                                                        <>
                                                            <th className="text-right p-3 font-bold uppercase tracking-wider text-[10px] opacity-60">N-1</th>
                                                            <th className="text-right p-3 font-bold uppercase tracking-wider text-[10px] opacity-60">{'\u0394'}%</th>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row, idx) => (
                                            <tr key={idx} className="border-b last:border-0 transition-colors" style={{ borderColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)' }}>
                                                <td className="p-3" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>{row[config.dimension || ''] || '-'}</td>
                                                {config.metrics.map((m: string) => {
                                                    const key = m.replace('metrics.', '');
                                                    return (
                                                        <React.Fragment key={m}>
                                                            <td className="text-right p-3 font-medium" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>{formatValue(row[key], key)}</td>
                                                            {config.showComparison && (() => {
                                                                const delta = row[`${m}_delta`];
                                                                const formattedDelta = (delta !== undefined && delta !== null) ? delta.toFixed(1) : '0.0';
                                                                const isNeutral = formattedDelta === '0.0' || formattedDelta === '-0.0';
                                                                const isInverse = ['cpc', 'cpm', 'cost_per_purchase', 'cost_per_lead'].includes(key);
                                                                const isPos = isInverse ? delta < 0 : delta > 0;
                                                                const trendColor = isNeutral ? 'text-[var(--color-text-muted)]' : (isPos ? 'text-green-500' : 'text-red-500');
                                                                return (
                                                                    <>
                                                                        <td className="text-right p-3 text-[var(--color-text-muted)] opacity-70 italic">{formatValue(row[`${m}_prev`], key)}</td>
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
                            <div className="absolute inset-0" key={chartKey}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={tableData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                        <XAxis dataKey={config.dimension} tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b6e77', fontFamily: effectiveFontFamily }} axisLine={{ stroke: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)' }} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b6e77', fontFamily: effectiveFontFamily }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ ...tooltipStyle, fontFamily: effectiveFontFamily }} />
                                        <Legend wrapperStyle={{ fontSize: '10px', fontFamily: effectiveFontFamily, color: design?.colorScheme?.text || '#050505' }} />
                                        {config.metrics.map((m: string, i: number) => {
                                            const key = m.replace('metrics.', '');
                                            return (
                                                <React.Fragment key={m}>
                                                    <Bar dataKey={key} name={t(`flexibleBlock.metricsList.${key}`)} fill={chartColors[i % chartColors.length]} radius={[4, 4, 0, 0]} />
                                                    {config.showComparison && (
                                                        <Bar dataKey={`${m}_prev`} name={`${t(`flexibleBlock.metricsList.${key}`)} (N-1)`} fill={chartColors[i % chartColors.length]} opacity={0.3} radius={[4, 4, 0, 0]} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    case 'line':
                        return (
                            <div className="absolute inset-0" key={chartKey}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={tableData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                        <XAxis dataKey={config.dimension} tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b6e77', fontFamily: effectiveFontFamily }} axisLine={{ stroke: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--color-border)' }} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: design?.colorScheme?.secondary || '#6b6e77', fontFamily: effectiveFontFamily }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ ...tooltipStyle, fontFamily: effectiveFontFamily }} />
                                        <Legend wrapperStyle={{ fontSize: '10px', fontFamily: effectiveFontFamily, color: design?.colorScheme?.text || '#050505' }} />
                                        {config.metrics.map((m: string, i: number) => {
                                            const key = m.replace('metrics.', '');
                                            return (
                                                <React.Fragment key={m}>
                                                    <Line type="monotone" dataKey={key} name={t(`flexibleBlock.metricsList.${key}`)} stroke={chartColors[i % chartColors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                    {config.showComparison && (
                                                        <Line type="monotone" dataKey={`${m}_prev`} name={`${t(`flexibleBlock.metricsList.${key}`)} (N-1)`} stroke={chartColors[i % chartColors.length]} strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    case 'pie':
                        return (
                            <div className="absolute inset-0" key={chartKey}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius="70%"
                                            fill={chartColors[0]}
                                            dataKey={config.metrics[0]?.replace('metrics.', '')}
                                            nameKey={config.dimension}
                                            label={(props: any) => (
                                                <text
                                                    x={props.x} y={props.y}
                                                    textAnchor={props.textAnchor}
                                                    dominantBaseline="central"
                                                    fill={design?.colorScheme?.text || '#050505'}
                                                    style={{ fontSize: 10, fontFamily: effectiveFontFamily }}
                                                >
                                                    {`${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                                </text>
                                            )}
                                        >
                                            {data.map((_, index) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ ...tooltipStyle, fontFamily: effectiveFontFamily }} />
                                        <Legend wrapperStyle={{ fontSize: '10px', fontFamily: effectiveFontFamily, color: design?.colorScheme?.text || '#050505' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    case 'scorecard': {
                        const gridCols = config.metrics.length <= 4 ? 'grid-cols-2' : config.metrics.length <= 6 ? 'grid-cols-3' : 'grid-cols-4';
                        return (
                            <div className={`grid ${gridCols} gap-4 h-full items-center`}>
                                {config.metrics.map((m: string) => {
                                    const key = m.replace('metrics.', '');
                                    const total = data.reduce((sum, r) => sum + (Number(r[key]) || 0), 0);
                                    const prevTotal = comparisonData.reduce((sum, r) => sum + (Number(r[key]) || 0), 0);

                                    const diff = total - prevTotal;
                                    const percentChange = prevTotal !== 0 ? (diff / prevTotal) * 100 : 0;
                                    const formattedPercent = percentChange.toFixed(1);
                                    const isNeutral = formattedPercent === '0.0' || formattedPercent === '-0.0';

                                    const isInverse = ['cpc', 'cpm', 'cost_per_purchase', 'cost_per_lead'].includes(key);
                                    const isPositive = isInverse ? diff < 0 : diff > 0;
                                    const trendColor = isNeutral ? 'text-[var(--color-text-muted)]' : (isPositive ? 'text-green-500' : 'text-red-500');

                                    return (
                                        <div key={m} className="p-5 rounded-2xl text-center border shadow-sm flex flex-col justify-center gap-1" style={{ borderColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', backgroundColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)' }}>
                                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: design?.colorScheme?.secondary || 'var(--color-text-muted)' }}>
                                                {t(`flexibleBlock.metricsList.${key}`)}
                                            </div>
                                            <div className="text-2xl font-bold" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>
                                                {formatValue(total, key)}
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
                    }
                    default:
                        return null;
                }
            })()}
        </div>
    );
});

// ═══════════════════════════════════════════════════════════════════════
// FlexibleMetaBlock — Main exported component with config panel
// ═══════════════════════════════════════════════════════════════════════
export const FlexibleMetaBlock: React.FC<FlexibleMetaBlockProps> = React.memo(({
    config,
    onUpdateConfig,
    editable = false,
    selected = false,
    onDelete,
    accountId: propAccountId,
    campaignIds: _propCampaignIds,
    startDate: propStartDate,
    endDate: propEndDate,
    design: propDesign,
    variant,
}) => {
    const { t } = useTranslation('reports');
    const blockVariant = variant || 'chromeless';
    const context = useReportEditor();

    const accountId = propAccountId || context.metaAccountId || '';
    // campaignIds reserved for future per-campaign Meta filtering
    void _propCampaignIds;
    const startDate = propStartDate || context.startDate;
    const endDate = propEndDate || context.endDate;
    const design = propDesign || context.design;

    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const activeConfig: FlexibleDataConfig = useMemo(() => ({
        title: config.title || 'Meta Ads Block',
        metrics: config.metrics || ['metrics.impressions', 'metrics.clicks'],
        dimension: config.dimension || 'segments.date',
        visualization: config.visualization || 'table',
        limit: config.limit || 10,
        sortBy: config.sortBy || 'metrics.impressions',
        sortOrder: config.sortOrder || 'DESC',
        isNew: config.isNew,
        isConfigActive: config.isConfigActive,
        showComparison: config.showComparison,
        comparisonType: config.comparisonType,
        description: config.description,
    }), [config]);

    const [editConfig, setEditConfig] = useState<FlexibleDataConfig>(activeConfig);

    useEffect(() => {
        if (isConfigOpen) {
            setEditConfig(activeConfig);
        }
    }, [isConfigOpen, activeConfig]);

    // Auto-open config panel for new blocks
    useEffect(() => {
        if (editable && (config.isNew || config.isConfigActive)) {
            setIsConfigOpen(true);
            if (config.isNew || config.isConfigActive) {
                setTimeout(() => {
                    onUpdateConfig({
                        ...config,
                        isNew: false,
                        isConfigActive: false
                    });
                }, 0);
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

    // ─── Config Modal ────────────────────────────────────────────────────
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

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[var(--color-bg-primary)] rounded-3xl shadow-2xl flex flex-col w-[1400px] max-w-[95vw] h-[90vh] overflow-hidden border border-[var(--color-border)]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                                <div>
                                    <h4 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('flexibleBlock.metaModalTitle', 'Configuration Meta Ads')}</h4>
                                    <p className="text-sm text-[var(--color-text-muted)]">{t('flexibleBlock.metaModalSubtitle', 'Personnalisez les metriques et la visualisation')}</p>
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
                                        {/* Title */}
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

                                        {/* Visualization Type */}
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

                                        {/* Dimension & Limit */}
                                        <section className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.dimension')}</label>
                                                <select
                                                    value={editConfig.dimension || ''}
                                                    onChange={(e) => setEditConfig({ ...editConfig, dimension: e.target.value || undefined })}
                                                    className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                                >
                                                    <option value="">{t('flexibleBlock.fields.none')}</option>
                                                    {META_DIMENSIONS.map(dim => (
                                                        <option key={dim.id} value={dim.id}>
                                                            {t(`flexibleBlock.dimensions.${dim.labelKey}`)}
                                                        </option>
                                                    ))}
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

                                        {/* Comparison Toggle */}
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

                                        {/* Metrics Selection */}
                                        <section>
                                            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.metrics')}</label>
                                            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                                {META_METRICS.map((m) => {
                                                    const metricKey = m.id.replace('metrics.', '');
                                                    const exists = editConfig.metrics.includes(m.id);
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => setEditConfig({
                                                                ...editConfig,
                                                                metrics: exists
                                                                    ? editConfig.metrics.filter(x => x !== m.id)
                                                                    : [...editConfig.metrics, m.id]
                                                            })}
                                                            className={`flex items-center justify-center text-center px-3 py-2.5 rounded-xl border transition-all ${exists ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]' : 'border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'}`}
                                                        >
                                                            <span className="text-[10px] font-bold">{t(`flexibleBlock.metricsList.${metricKey}`)}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </section>

                                        {/* Description */}
                                        <section>
                                            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.ai.title', 'Analyse / Description')}</label>
                                            <textarea
                                                value={editConfig.description || ''}
                                                onChange={(e) => setEditConfig({ ...editConfig, description: e.target.value })}
                                                placeholder={t('flexibleBlock.ai.placeholder', 'Ajoutez une description ou une analyse...')}
                                                rows={3}
                                                className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[var(--color-text-muted)]/50 resize-none"
                                            />
                                        </section>
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div className="flex-1 bg-[var(--color-bg-secondary)] p-6 lg:p-8 flex flex-col min-h-0">
                                    <div className="flex items-center gap-3 mb-4 text-[var(--color-text-muted)]">
                                        <div className="p-1.5 bg-primary/10 rounded-lg"><Info size={16} className="text-primary" /></div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('flexibleBlock.previewTitle')}</span>
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
                                                <h3 className="text-xl font-bold leading-tight" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>{editConfig.title || 'Preview'}</h3>
                                                <p className="text-[10px]" style={{ color: design?.colorScheme?.secondary || 'var(--color-text-muted)' }}>
                                                    {accountId ? `Meta Account: ${accountId}` : 'Compte non selectionne'}
                                                </p>
                                            </div>
                                            <div
                                                className="text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border"
                                                style={{
                                                    backgroundColor: 'rgba(25, 99, 213, 0.1)',
                                                    borderColor: 'rgba(25, 99, 213, 0.2)',
                                                    color: design?.colorScheme?.primary || 'var(--color-primary)'
                                                }}
                                            >
                                                {t(`flexibleBlock.visualizations.${editConfig.visualization}`)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-0 overflow-hidden relative w-full h-full flex flex-col">
                                            <MetaDataRenderer
                                                config={editConfig}
                                                accountId={accountId}
                                                startDate={startDate || ''}
                                                endDate={endDate || ''}
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

    // ─── Main Render ─────────────────────────────────────────────────────
    return (
        <div className="h-full">
            <ReportBlock
                title={activeConfig.title}
                design={design!}
                editable={editable}
                selected={selected}
                onEdit={() => setIsConfigOpen(true)}
                onDelete={onDelete}
                description={activeConfig.description}
                minHeight={['bar', 'line', 'pie'].includes(activeConfig.visualization) ? (activeConfig.description ? 450 : 350) : 300}
                variant={blockVariant}
            >
                <div
                    className={`flex-1 w-full min-h-0 flex flex-col ${['table', 'scorecard'].includes(activeConfig.visualization) ? 'overflow-auto report-scrollbar' : 'overflow-hidden'}`}
                    style={['table', 'scorecard'].includes(activeConfig.visualization) ? {
                        '--scrollbar-track': design?.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        '--scrollbar-thumb': design?.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                        '--scrollbar-thumb-hover': design?.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                    } as React.CSSProperties : undefined}
                >
                    <MetaDataRenderer
                        config={activeConfig}
                        accountId={accountId}
                        startDate={startDate || ''}
                        endDate={endDate || ''}
                        design={design || undefined}
                    />
                </div>
            </ReportBlock>

            {typeof document !== 'undefined' && createPortal(ConfigModal, document.body)}
        </div>
    );
});

export default FlexibleMetaBlock;
