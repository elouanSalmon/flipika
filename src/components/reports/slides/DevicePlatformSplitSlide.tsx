import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './DevicePlatformSplitSlide.css';

interface DevicePlatformSplitSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
}

const DevicePlatformSplitSlide: React.FC<DevicePlatformSplitSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,

    reportId,
}) => {
    const [deviceData, setDeviceData] = useState<any[]>([]);
    const [platformData, setPlatformData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);

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
            setDeviceData(data.deviceData || []);
            setPlatformData(data.platformData || []);
            setIsMockData(data.isMockData || false);
        } catch (err) {
            console.error('Error loading device/platform data:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = [
        design.colorScheme.primary,
        design.colorScheme.secondary,
        design.colorScheme.accent,
        '#10b981',
        '#f59e0b',
        '#ef4444',
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(Math.round(value));
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    if (loading) {
        return (
            <div className="device-platform-split-slide loading">
                <div className="loading-container">
                    <Spinner size={32} />
                    <p>Chargement des données...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="device-platform-split-slide error">
                <div className="error-container">
                    <AlertTriangle size={32} color={design.colorScheme.text} />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="device-platform-split-slide" style={{ color: design.colorScheme.text }}>
            <div className="slide-header">
                <h3>
                    Performance par Appareil et Plateforme
                    {isMockData && (
                        <span className="mock-data-badge" title="Données de démonstration">
                            <AlertTriangle size={14} />
                            Démo
                        </span>
                    )}
                </h3>
            </div>

            <div className="split-charts-container">
                {/* Device Chart (Pie) */}
                <div className="chart-section">
                    <h4>Par Appareil (Clics)</h4>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="clicks"
                                >
                                    {deviceData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => formatNumber(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Chart (Bar) */}
                <div className="chart-section">
                    <h4>Par Plateforme (Coût)</h4>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="cost" fill={design.colorScheme.primary} radius={[0, 4, 4, 0]} barSize={20}>
                                    {platformData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="metrics-table-container">
                <table className="metrics-table">
                    <thead>
                        <tr>
                            <th>Segment</th>
                            <th>Impressions</th>
                            <th>Clics</th>
                            <th>CTR</th>
                            <th>CPC</th>
                            <th>Coût</th>
                            <th>Conv.</th>
                            <th>CPA</th>
                            <th>ROAS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Devices */}
                        {deviceData.map((row, index) => (
                            <tr key={`device-${index}`}>
                                <td style={{ fontWeight: 500 }}>{row.name}</td>
                                <td>{formatNumber(row.impressions)}</td>
                                <td>{formatNumber(row.clicks)}</td>
                                <td>{formatPercentage(row.ctr)}</td>
                                <td>{formatCurrency(row.cpc)}</td>
                                <td>{formatCurrency(row.cost)}</td>
                                <td>{formatNumber(row.conversions)}</td>
                                <td>{formatCurrency(row.cpa)}</td>
                                <td>{row.roas.toFixed(2)}x</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DevicePlatformSplitSlide;
