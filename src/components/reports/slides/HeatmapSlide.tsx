import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './HeatmapSlide.css';

interface HeatmapSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
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
}) => {
    const [heatmapData, setHeatmapData] = useState<HeatmapCellData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<string>(
        config.settings?.defaultMetric || 'clicks'
    );

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
            setHeatmapData(data.heatmapData || []);
            setIsMockData(data.isMockData || false);
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
        return design.colorScheme.primary;
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

    if (loading) {
        return (
            <div className="heatmap-container loading">
                <div className="flex justify-center items-center h-full">
                    <Spinner size={32} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="heatmap-container error">
                <div className="error-message p-4 text-center">{error}</div>
            </div>
        );
    }

    return (
        <div
            className="heatmap-container"
            style={{
                backgroundColor: design.colorScheme.background,
                color: design.colorScheme.text,
                padding: '24px',
                height: '100%',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h3 style={{
                        color: design.colorScheme.text,
                        fontSize: '18px',
                        fontWeight: 600,
                        margin: 0
                    }}>
                        Heatmap
                    </h3>
                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="heatmap-metric-selector"
                        style={{
                            borderColor: design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            backgroundColor: design.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                            color: design.colorScheme.text,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {METRIC_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
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
                            <AlertTriangle size={12} />
                            Mode Démo
                        </span>
                    )}
                </div>
            </div>

            <div className="heatmap-content flex-1 flex flex-col justify-center overflow-hidden">
                <div className="heatmap-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto repeat(24, 1fr)',
                    gap: '2px',
                    height: '100%'
                }}>
                    {/* Header Row: Hours */}
                    <div className="heatmap-header-cell empty"></div>
                    {HOURS.map(hour => (
                        <div key={`header-${hour}`} className="heatmap-header-cell text-xs opacity-50 text-center" style={{ fontSize: '10px' }}>
                            {hour}
                        </div>
                    ))}

                    {/* Data Rows: Days */}
                    {DAYS.map((dayLabel, dayIndex) => {
                        return (
                            <React.Fragment key={`row-${dayIndex}`}>
                                {/* Row Label */}
                                <div className="heatmap-row-label text-xs font-medium opacity-70 flex items-center" style={{ fontSize: '11px' }}>
                                    {dayLabel}
                                </div>

                                {/* Cells for this day */}
                                {HOURS.map(hour => {
                                    const cellData = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
                                    const value = cellData ? (cellData.metrics as any)[selectedMetric] || 0 : 0;

                                    return (
                                        <div
                                            key={`cell-${dayIndex}-${hour}`}
                                            className="heatmap-cell relative group rounded-sm"
                                            style={{
                                                backgroundColor: getCellColor(value),
                                                opacity: value === 0 ? 1 : getCellOpacity(value),
                                                cursor: 'help'
                                            }}
                                        >
                                            <div
                                                className="heatmap-tooltip opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded shadow-lg pointer-events-none transition-opacity z-50 whitespace-nowrap"
                                                style={{
                                                    backgroundColor: design.mode === 'dark' ? '#fff' : '#1e293b',
                                                    color: design.mode === 'dark' ? '#1e293b' : '#fff',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <strong>{dayLabel} {hour}h:00 - {hour}h:59</strong><br />
                                                {formatValue(value, selectedMetric)} {METRIC_OPTIONS.find(o => o.value === selectedMetric)?.label}
                                                {/* Arrow */}
                                                <div
                                                    className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
                                                    style={{ borderTopColor: design.mode === 'dark' ? '#fff' : '#1e293b' }}
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

            <div className="flex justify-center mt-4 opacity-50 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>7 derniers jours</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatmapSlide;
