import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import { generateBlockAnalysis } from '../../../services/aiService';
import { generateConfigHash } from '../../../hooks/useGenerateAnalysis';
import ReportBlock from '../../editor/blocks/ReportBlock';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './HeatmapSlide.css';

export interface HeatmapConfig {
    description?: string;
    aiAnalysisHash?: string;
}

interface HeatmapSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
    isTemplateMode?: boolean;
    onUpdateConfig?: (newConfig: Partial<HeatmapConfig>) => void;
}

interface HeatmapCellData {
    day: number; // 0-6 (Sunday-Saturday) or 1-7 (Monday-Sunday) - Google Ads uses 2 (Monday) to 8 (Sunday)? Or 0-6? We will normalize.
    hour: number; // 0-23
    metrics: {
        impressions: number;
        clicks: number;
        conversions: number;
        cost: number;
        ctr: number;
        avgCpc: number;
    };
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const METRIC_OPTIONS = [
    { value: 'clicks', label: 'Clics' },
    { value: 'impressions', label: 'Impressions' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'cost', label: 'Coût' },
    { value: 'ctr', label: 'CTR' },
];

const HeatmapSlide: React.FC<HeatmapSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    reportId,
    editable = false,
    onUpdateConfig,
}) => {

    const [heatmapData, setHeatmapData] = useState<HeatmapCellData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<string>(
        config.settings?.defaultMetric || 'clicks'
    );

    // AI Analysis generation state
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

    // Ref to store captured data for AI generation
    const capturedDataRef = useRef<HeatmapCellData[]>([]);

    // Get description from config settings
    const description = config.settings?.description as string | undefined;
    const aiAnalysisHash = config.settings?.aiAnalysisHash as string | undefined;

    // Check if description is stale
    const descriptionIsStale = description && aiAnalysisHash && (() => {
        const currentHash = generateConfigHash({
            title: 'Heatmap',
            metrics: ['metrics.clicks'],
            visualization: 'heatmap',
        }, startDate, endDate);
        return currentHash !== aiAnalysisHash;
    })();

    // Compute effective scope
    const effectiveAccountId = config.scope?.accountId || accountId || '';
    const effectiveCampaignIds = config.scope?.campaignIds || campaignIds || [];

    useEffect(() => {
        loadData();
    }, [config, effectiveAccountId, effectiveCampaignIds, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getSlideData(config, effectiveAccountId, effectiveCampaignIds, startDate, endDate, reportId);
            const heatmapResults = data.heatmapData || [];
            setHeatmapData(heatmapResults);
            setIsMockData(data.isMockData || false);

            // Capture data for AI generation
            capturedDataRef.current = heatmapResults;
        } catch (err) {
            console.error('Error loading heatmap data:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    // Calculate max value for the selected metric to determine color intensity
    const maxMetricValue = useMemo(() => {
        if (!heatmapData.length) return 0;
        return Math.max(...heatmapData.map(cell => (cell.metrics as any)[selectedMetric] || 0));
    }, [heatmapData, selectedMetric]);

    // Function to get color based on intensity
    const getCellColor = (value: number) => {
        if (value === 0) return design.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';



        // Use primary color with opacity
        // Assuming primary color is in hex, we might need to be smarter here.
        // For now, let's use the CSS variable or a simple interpolation if we can't parse easily.
        // Or cleaner: use HSL if available, or just opacity of the primary color.

        // Simpler approach: use style with opacity
        return design?.colorScheme?.primary || '#3b82f6';
        // We will apply opacity in the style attribute directly
    };

    const getCellOpacity = (value: number) => {
        if (value === 0) return 1; // For the empty bg color
        const intensity = maxMetricValue > 0 ? value / maxMetricValue : 0;
        // Min opacity 0.1, Max 1
        return 0.1 + (intensity * 0.9);
    };

    // Format tooltip value
    const formatValue = (value: number, metric: string) => {
        if (metric === 'cost' || metric === 'avgCpc') return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
        if (metric === 'ctr') return `${(value * 100).toFixed(2)}%`;
        return new Intl.NumberFormat('fr-FR').format(Math.round(value));
    };

    // Handle AI analysis generation (for bulk generation)
    const handleBulkGenerateAnalysis = useCallback(async () => {
        // Skip if already has description or no dates or not editable
        if (description || !startDate || !endDate || !editable || !onUpdateConfig) {
            return;
        }

        // Skip if no data captured yet
        if (capturedDataRef.current.length === 0) {
            return;
        }

        setIsGeneratingAnalysis(true);
        window.dispatchEvent(new CustomEvent('flipika:ai-generation-start'));

        try {
            const formatDate = (d: Date | string) => {
                const date = new Date(d);
                return date.toISOString().split('T')[0];
            };

            // Prepare heatmap data for AI - find best and worst performing hours/days
            const heatmapSummary = capturedDataRef.current.map(cell => ({
                day: DAYS[cell.day],
                hour: cell.hour,
                clicks: cell.metrics.clicks,
                impressions: cell.metrics.impressions,
                conversions: cell.metrics.conversions,
                ctr: cell.metrics.ctr
            }));

            // Find top 3 performing time slots
            const sorted = [...heatmapSummary].sort((a, b) => b.clicks - a.clicks);
            const topSlots = sorted.slice(0, 5);
            const bottomSlots = sorted.slice(-3);

            const result = await generateBlockAnalysis({
                blockTitle: 'Heatmap - Performance par jour et heure',
                visualization: 'heatmap',
                metrics: ['metrics.clicks', 'metrics.impressions', 'metrics.conversions'],
                dimension: 'day_hour',
                period: {
                    start: formatDate(startDate),
                    end: formatDate(endDate)
                },
                currentData: [
                    { type: 'top_performing', slots: JSON.stringify(topSlots) },
                    { type: 'low_performing', slots: JSON.stringify(bottomSlots) },
                    { type: 'total_cells', count: heatmapSummary.length }
                ],
                comparisonData: undefined,
                showComparison: false
            });

            // Generate hash for staleness detection
            const hash = generateConfigHash({
                title: 'Heatmap',
                metrics: ['metrics.clicks'],
                visualization: 'heatmap',
            }, startDate, endDate);

            // Update config directly
            onUpdateConfig({
                description: result.analysis,
                aiAnalysisHash: hash
            });

        } catch (error) {
            console.error('Error generating analysis (bulk) for heatmap:', error);
        } finally {
            setIsGeneratingAnalysis(false);
            window.dispatchEvent(new CustomEvent('flipika:ai-generation-end'));
        }
    }, [description, startDate, endDate, editable, onUpdateConfig]);

    // Listen for "Generate All" event
    useEffect(() => {
        const handleRequestAllAnalyses = () => {
            handleBulkGenerateAnalysis();
        };

        window.addEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        return () => {
            window.removeEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        };
    }, [handleBulkGenerateAnalysis]);

    // AI Generation overlay removed - handled by ReportBlock

    const headerContent = (
        <div className="flex items-center gap-2">
            <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="heatmap-metric-selector"
                onClick={(e) => e.stopPropagation()} // Prevent block drag when clicking select
                style={{
                    borderColor: design.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    backgroundColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    color: design?.colorScheme?.text || '#111827',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer',
                    border: '1px solid'
                }}
            >
                {METRIC_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: design?.colorScheme?.background || '#ffffff' }}>{opt.label}</option>
                ))}
            </select>
            {isMockData && (
                <span
                    className="flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-wider font-bold rounded-full border"
                    style={{
                        backgroundColor: design?.mode === 'dark' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(254, 252, 232, 1)',
                        color: design?.mode === 'dark' ? '#fb923c' : '#b45309',
                        borderColor: design?.mode === 'dark' ? 'rgba(249, 115, 22, 0.3)' : '#fcd34d'
                    }}
                    title="Données de démonstration - Connectez un compte Google Ads pour voir vos données réelles"
                >
                    <AlertTriangle size={10} />
                    Mode Démo
                </span>
            )}
        </div>
    );

    return (
        <ReportBlock
            title="Heatmap"
            design={design}
            loading={loading}
            error={error}
            editable={editable}
            headerContent={headerContent}
            description={description}
            descriptionIsStale={descriptionIsStale}
            onRegenerateAnalysis={handleBulkGenerateAnalysis}
            isGeneratingAnalysis={isGeneratingAnalysis}
            className="heatmap-container"
        >
            <div className="heatmap-content flex-1 flex flex-col justify-center overflow-auto report-scrollbar min-h-0 h-full">
                <div className="heatmap-grid h-full" style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto repeat(24, 1fr)',
                    gap: '2px',
                    paddingBottom: '4px',
                    alignContent: 'center'
                }}>
                    {/* Header Row: Hours */}
                    <div className="heatmap-header-cell empty"></div>
                    {HOURS.map(hour => (
                        <div key={`header-${hour}`} className="heatmap-header-cell text-xs opacity-50 text-center" style={{ fontSize: '9px' }}>
                            {hour}
                        </div>
                    ))}

                    {/* Data Rows: Days */}
                    {DAYS.map((dayLabel, dayIndex) => {
                        return (
                            <React.Fragment key={`row-${dayIndex}`}>
                                {/* Row Label */}
                                <div className="heatmap-row-label text-xs font-medium opacity-70 flex items-center" style={{ fontSize: '10px' }}>
                                    {dayLabel}
                                </div>

                                {/* Cells for this day */}
                                {HOURS.map(hour => {
                                    const cellData = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
                                    const value = cellData ? (cellData.metrics as any)[selectedMetric] || 0 : 0;

                                    return (
                                        <div
                                            key={`cell-${cellData ? cellData.day : dayIndex}-${hour}`}
                                            className="heatmap-cell relative group rounded-sm aspect-square"
                                            style={{
                                                backgroundColor: getCellColor(value),
                                                opacity: value === 0 ? 1 : getCellOpacity(value),
                                                cursor: 'help'
                                            }}
                                        >
                                            <div
                                                className="heatmap-tooltip opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded shadow-lg pointer-events-none transition-opacity z-50 whitespace-nowrap"
                                                style={{
                                                    backgroundColor: design?.colorScheme?.background || (design.mode === 'dark' ? '#fff' : '#1e293b'),
                                                    color: design?.colorScheme?.text || (design.mode === 'dark' ? '#1e293b' : '#fff'),
                                                    border: `1px solid ${design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                    fontSize: '11px'
                                                }}
                                            >
                                                <strong>{dayLabel} {hour}h:00 - {hour}h:59</strong><br />
                                                {formatValue(value, selectedMetric)} {METRIC_OPTIONS.find(o => o.value === selectedMetric)?.label}
                                                {/* Arrow */}
                                                <div
                                                    className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
                                                    style={{ borderTopColor: design?.colorScheme?.background || (design.mode === 'dark' ? '#fff' : '#1e293b') }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-center mt-1 opacity-50 text-[10px] flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={10} />
                        <span>7 derniers jours</span>
                    </div>
                </div>
            </div>
        </ReportBlock>
    );
};

export default HeatmapSlide;
