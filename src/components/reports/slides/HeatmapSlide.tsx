import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
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
                background: design.colorScheme.background,
                color: design.colorScheme.text,
            }}
        >
            <div className="heatmap-controls">
                {isMockData && (
                    <span className="mock-data-badge mr-auto flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                        <AlertTriangle size={12} />
                        Démo
                    </span>
                )}

                <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="heatmap-metric-selector"
                    style={{
                        borderColor: design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        background: design.mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : '#fff',
                        color: design.colorScheme.text,
                    }}
                >
                    {METRIC_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="heatmap-content">
                <div className="heatmap-grid">
                    {/* Header Row: Hours */}
                    <div className="heatmap-header-cell empty px-2">
                        <Clock size={14} />
                    </div>
                    {HOURS.map(hour => (
                        <div key={`header-${hour}`} className="heatmap-header-cell">
                            {hour}h
                        </div>
                    ))}

                    {/* Data Rows: Days */}
                    {DAYS.map((dayLabel, dayIndex) => {
                        // Google Ads Day of week: 0=Sunday? Actually usually Enum. 
                        // Let's assume our data normalizes to 0=Monday for array indexing simplicity if we map DAYS array.
                        // We will ensure data service maps correctly.

                        return (
                            <React.Fragment key={`row-${dayIndex}`}>
                                {/* Row Label */}
                                <div className="heatmap-row-label">
                                    {dayLabel}
                                </div>

                                {/* Cells for this day */}
                                {HOURS.map(hour => {
                                    // Find data for this day/hour
                                    // Assuming dayIndex 0 = Monday.
                                    const cellData = heatmapData.find(d => d.day === dayIndex && d.hour === hour);
                                    const value = cellData ? (cellData.metrics as any)[selectedMetric] || 0 : 0;

                                    return (
                                        <div
                                            key={`cell-${dayIndex}-${hour}`}
                                            className="heatmap-cell"
                                            style={{
                                                backgroundColor: getCellColor(value),
                                                opacity: value === 0 ? 1 : getCellOpacity(value),
                                                // If value is 0, we used a specific bg color in getCellColor, so opacity 1 is fine.
                                                // If value > 0, we returned primary color, so we modulate opacity.
                                            }}
                                        >
                                            <div className="heatmap-tooltip">
                                                <strong>{dayLabel} {hour}h:00 - {hour}h:59</strong><br />
                                                {formatValue(value, selectedMetric)} {METRIC_OPTIONS.find(o => o.value === selectedMetric)?.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="text-center text-xs opacity-50 mt-2">
                <div className="flex items-center justify-center gap-2">
                    <Calendar size={12} />
                    <span>7 jours</span>
                    <span className="mx-1">•</span>
                    <Clock size={12} />
                    <span>24 heures</span>
                </div>
            </div>
        </div>
    );
};

export default HeatmapSlide;
