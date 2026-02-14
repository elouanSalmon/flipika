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
    isTemplateMode?: boolean;
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
        design?.colorScheme?.primary || '#1963d5',
        design?.colorScheme?.secondary || '#6b6e77',
        design?.colorScheme?.accent || '#a9d4fe',
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
                    <AlertTriangle size={32} color={design?.colorScheme?.text || '#050505'} />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="device-platform-split-slide"
            style={{
                // Inject local theme variables
                '--text-primary': design?.colorScheme?.text || '#050505',
                '--text-secondary': design?.colorScheme?.secondary || '#6b6e77',
                '--bg-primary': design?.colorScheme?.background || '#ffffff',
                '--bg-secondary': design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f6f6f7',
                '--border-color': design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',

                color: design?.colorScheme?.text || '#050505',
                backgroundColor: design?.colorScheme?.background || '#ffffff',
                padding: '24px',
                minHeight: '200px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                // Border only in dark mode
                border: design?.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            } as React.CSSProperties}
        >
            <div className="slide-header flex items-center justify-between mb-6">
                <h3 style={{
                    color: design?.colorScheme?.text || '#050505',
                    fontSize: '18px',
                    fontWeight: 600,
                    margin: 0
                }}>
                    Performance par Appareil et Plateforme
                </h3>
                {isMockData && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
                        style={{
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fcd34d'
                        }}
                        title="Données de démonstration"
                    >
                        <AlertTriangle size={12} />
                        Démo
                    </span>
                )}
            </div>

            <div className="split-charts-container grid grid-cols-2 gap-6 mb-6 h-64">
                {/* Device Chart (Pie) */}
                <div
                    className="chart-section flex flex-col items-center justify-center p-4 rounded-lg h-full"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                    <h4 className="mb-4 text-sm font-semibold opacity-70">Par Appareil (Clics)</h4>
                    <div className="chart-wrapper w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="clicks"
                                >
                                    {deviceData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => formatNumber(value)}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        backgroundColor: design.mode === 'dark' ? '#0a0a0a' : '#fff',
                                        color: design?.colorScheme?.text || '#050505'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Chart (Bar) */}
                <div
                    className="chart-section flex flex-col items-center justify-center p-4 rounded-lg h-full"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                    <h4 className="mb-4 text-sm font-semibold opacity-70">Par Plateforme (Coût)</h4>
                    <div className="chart-wrapper w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: design?.colorScheme?.text || '#050505' }} />
                                <RechartsTooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        backgroundColor: design.mode === 'dark' ? '#0a0a0a' : '#fff',
                                        color: design?.colorScheme?.text || '#050505'
                                    }}
                                />
                                <Bar dataKey="cost" fill={design?.colorScheme?.primary || '#1963d5'} radius={[0, 4, 4, 0]} barSize={20}>
                                    {platformData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="metrics-table-container flex-1 overflow-auto">
                <table className="metrics-table w-full text-sm">
                    <thead
                        className="sticky top-0 z-10"
                        style={{ backgroundColor: 'var(--bg-primary)' }}
                    >
                        <tr style={{
                            borderBottom: `1px solid ${design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <th className="py-2 px-3 text-left font-semibold opacity-70">Segment</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">Impr.</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">Clics</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">CTR</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">CPC</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">Coût</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">Conv.</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">CPA</th>
                            <th className="py-2 px-3 text-right font-semibold opacity-70">ROAS</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {/* Devices */}
                        {deviceData.map((row, index) => (
                            <tr key={`device-${index}`} style={{ borderBottom: `1px solid ${design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                                <td className="py-2 px-3 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {row.name}
                                </td>
                                <td className="py-2 px-3 text-right">{formatNumber(row.impressions)}</td>
                                <td className="py-2 px-3 text-right">{formatNumber(row.clicks)}</td>
                                <td className="py-2 px-3 text-right font-medium" style={{ color: design?.colorScheme?.primary || '#1963d5' }}>{formatPercentage(row.ctr)}</td>
                                <td className="py-2 px-3 text-right">{formatCurrency(row.cpc)}</td>
                                <td className="py-2 px-3 text-right font-medium">{formatCurrency(row.cost)}</td>
                                <td className="py-2 px-3 text-right font-bold" style={{ color: design?.colorScheme?.secondary || '#6b6e77' }}>{formatNumber(row.conversions)}</td>
                                <td className="py-2 px-3 text-right">{formatCurrency(row.cpa)}</td>
                                <td className="py-2 px-3 text-right font-bold">{row.roas.toFixed(2)}x</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DevicePlatformSplitSlide;
