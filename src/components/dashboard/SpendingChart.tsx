import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { TimeSeriesDataPoint } from '../../types/business';
import Spinner from '../common/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

interface SpendingChartProps {
    data: TimeSeriesDataPoint[];
    loading?: boolean;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data, loading = false }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Theme-aware colors
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
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
            <h3 className="text-lg font-bold mb-6 dark:text-neutral-200">Évolution des dépenses</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                        dataKey="date"
                        stroke={colors.axis}
                        tick={{ fill: colors.axis }}
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke={colors.axis}
                        tick={{ fill: colors.axis }}
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: colors.tooltipBg,
                            border: `1px solid ${colors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: colors.tooltipText,
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)} €`, 'Dépenses']}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="Dépenses"
                        stroke="#1963d5"
                        strokeWidth={2}
                        dot={{ fill: '#1963d5', r: 4 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;
