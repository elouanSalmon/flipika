import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TimeSeriesDataPoint } from '../../types/business';
import Spinner from '../common/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

interface ConversionTrendChartProps {
    data: TimeSeriesDataPoint[];
    loading?: boolean;
}

const ConversionTrendChart: React.FC<ConversionTrendChartProps> = ({ data, loading = false }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        grid: isDark ? '#1a1a1a' : '#dcdde0',
        axis: isDark ? '#8e9199' : '#6b6e77',
        tooltipBg: isDark ? '#0a0a0a' : '#ffffff',
        tooltipBorder: isDark ? '#1a1a1a' : '#dcdde0',
        tooltipText: isDark ? '#f0f1f2' : '#050505',
    };

    if (loading) {
        return (
            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6 h-80 flex items-center justify-center">
                <Spinner size={32} />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6 h-80 flex items-center justify-center">
                <div className="text-neutral-400">Aucune donnée disponible</div>
            </div>
        );
    }

    const chartData = data.map(point => {
        const dateObj = point.date instanceof Date ? point.date : new Date(point.date);
        return {
            date: dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            value: Number(point.value) || 0,
        };
    });

    return (
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6 min-h-[400px]">
            <h3 className="text-lg font-bold mb-6">Tendance des conversions</h3>
            <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis dataKey="date" stroke={colors.axis} tick={{ fill: colors.axis }} style={{ fontSize: '12px' }} />
                    <YAxis stroke={colors.axis} tick={{ fill: colors.axis }} style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: colors.tooltipBg,
                            border: `1px solid ${colors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: colors.tooltipText,
                        }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Conversions" fill="#10b981" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConversionTrendChart;
