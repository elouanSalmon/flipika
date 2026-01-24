import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useReportEditor, ReportEditorProvider } from '../../../contexts/ReportEditorContext';
import { Settings, Loader2, X, Info } from 'lucide-react';
import { executeQuery } from '../../../services/googleAds';
import { buildFlexibleQuery } from '../../../services/gaql';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0066ff', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
}

export interface FlexibleDataBlockProps {
    config: FlexibleDataConfig;
    onUpdateConfig: (newConfig: FlexibleDataConfig) => void;
    editable?: boolean;
    accountId?: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
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
}> = ({ config, accountId, campaignIds, startDate, endDate, height = '100%', showRawData = false }) => {
    const { t } = useTranslation('reports');
    const [data, setData] = useState<any[]>([]);
    const [rawResults, setRawResults] = useState<any[]>([]);
    const [generatedQuery, setGeneratedQuery] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        JSON.stringify(config.metrics)
    ]);

    const fetchData = async () => {
        if (!accountId || !startDate || !endDate) return;
        setLoading(true);
        setError(null);
        try {
            const sDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
            const eDate = typeof endDate === 'string' ? new Date(endDate) : endDate;

            if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
                throw new Error('Invalid date range');
            }

            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            const query = buildFlexibleQuery(config, {
                startDate: formatDate(sDate),
                endDate: formatDate(eDate),
                campaignIds: campaignIds
            });
            setGeneratedQuery(query);
            const result = await executeQuery(accountId, query);
            if (!result.success) throw new Error(result.error || 'Failed to fetch data');

            setRawResults(result.results || []);

            const flatData = (result.results || []).map((row: any) => {
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
                    if (row[parts[0]]) flatRow[m] = row[parts[0]][parts[1]];
                });
                return flatRow;
            });
            setData(flatData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    if (!accountId || !startDate || !endDate) {
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
                <div className="flex-1 overflow-hidden flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">GAQL Query</span>
                    <pre className="bg-gray-800 text-blue-300 p-4 rounded-xl text-[10px] overflow-auto border border-white/5 font-mono">
                        {generatedQuery}
                    </pre>
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
        backgroundColor: 'var(--color-bg-primary)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '12px',
        color: 'var(--color-text-primary)'
    };

    return (
        <div className="h-full w-full overflow-hidden">
            {(() => {
                switch (config.visualization) {
                    case 'table':
                        return (
                            <div className="overflow-x-auto h-full custom-scrollbar">
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0 bg-[var(--color-bg-primary)]">
                                        <tr className="border-b border-[var(--color-border)]">
                                            <th className="text-left p-3 font-semibold text-[var(--color-text-muted)]">
                                                {config.dimension ? t(`flexibleBlock.dimensions.${config.dimension.split('.')[1]}`) : t('flexibleBlock.fields.none')}
                                            </th>
                                            {config.metrics.map((m: string) => (
                                                <th key={m} className="text-right p-3 font-semibold text-[var(--color-text-muted)]">
                                                    {t(`flexibleBlock.metricsList.${m.split('.')[1]}`)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, idx) => (
                                            <tr key={idx} className="border-b last:border-0 border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                                <td className="p-3 text-[var(--color-text-primary)]">{row[config.dimension || ''] || '-'}</td>
                                                {config.metrics.map((m: string) => (
                                                    <td key={m} className="text-right p-3 font-medium text-[var(--color-text-primary)]">{Number(row[m])?.toLocaleString()}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    case 'bar':
                        return (
                            <ResponsiveContainer width="100%" height={height as any}>
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                                    <XAxis dataKey={config.dimension} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    {config.metrics.map((m: string, i: number) => (
                                        <Bar key={m} dataKey={m} name={t(`flexibleBlock.metricsList.${m.split('.')[1]}`)} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        );
                    case 'line':
                        return (
                            <ResponsiveContainer width="100%" height={height as any}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                                    <XAxis dataKey={config.dimension} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    {config.metrics.map((m: string, i: number) => (
                                        <Line key={m} type="monotone" dataKey={m} name={t(`flexibleBlock.metricsList.${m.split('.')[1]}`)} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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
                                        fill="#8884d8"
                                        dataKey={config.metrics[0]}
                                        nameKey={config.dimension}
                                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        fontSize={10}
                                    >
                                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        );
                    case 'scorecard':
                        return (
                            <div className="grid grid-cols-2 gap-4 h-full items-center">
                                {config.metrics.map((m: string) => {
                                    const total = data.reduce((sum, row) => sum + (Number(row[m]) || 0), 0);
                                    return (
                                        <div key={m} className="p-5 glass rounded-2xl text-center border shadow-sm">
                                            <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
                                                {t(`flexibleBlock.metricsList.${m.split('.')[1]}`)}
                                            </div>
                                            <div className="text-2xl font-bold text-[var(--color-text-primary)]">{total.toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    default:
                        return null;
                }
            })()}
        </div>
    );
};

export const FlexibleDataBlock: React.FC<FlexibleDataBlockProps> = ({
    config,
    onUpdateConfig,
    editable = false,
    accountId: propAccountId,
    campaignIds: propCampaignIds,
    startDate: propStartDate,
    endDate: propEndDate,
}) => {
    const { t } = useTranslation('reports');
    const context = useReportEditor();

    // Props take precedence over context for specific block consistency
    const accountId = propAccountId || context.accountId || '';
    const campaignIds = propCampaignIds || context.campaignIds || [];
    const startDate = propStartDate || context.startDate;
    const endDate = propEndDate || context.endDate;

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
        isConfigActive: config.isConfigActive
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
                                            <div className="grid grid-cols-3 gap-2">
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
                                                    <option value="ad_group.name">{t('flexibleBlock.dimensions.adGroup')}</option>
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
                                    <div className="flex-1 bg-[var(--color-bg-primary)] rounded-2xl shadow-xl border border-[var(--color-border)] flex flex-col p-6 lg:p-8 overflow-hidden">
                                        <div className="mb-6 flex justify-between items-end">
                                            <div className="space-y-0.5">
                                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] leading-tight">{editConfig.title || t('flexibleBlock.previewSubtitle')}</h3>
                                                <p className="text-[10px] text-[var(--color-text-muted)]">
                                                    {accountId ? `Compte ID: ${accountId}` : 'Compte non sélectionné'}
                                                </p>
                                            </div>
                                            <div className="text-[9px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
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
            <div className="app-card overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] transition-all hover:shadow-xl hover:border-primary/30">
                <div className="px-5 py-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-secondary)]/50">
                    <h3 className="font-bold text-[var(--color-text-primary)]">{activeConfig.title}</h3>
                    {editable && (
                        <button
                            onClick={() => setIsConfigOpen(true)}
                            className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-xl transition-all text-[var(--color-text-muted)] hover:text-primary border border-transparent hover:border-[var(--color-border)] shadow-sm"
                        >
                            <Settings size={16} />
                        </button>
                    )}
                </div>

                <div className="p-6 bg-transparent min-h-[150px]">
                    <DataRenderer
                        config={activeConfig}
                        accountId={accountId}
                        campaignIds={campaignIds}
                        startDate={startDate || ''}
                        endDate={endDate || ''}
                    />
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(ConfigModal, document.body)}
        </div>
    );
};

export default FlexibleDataBlock;
