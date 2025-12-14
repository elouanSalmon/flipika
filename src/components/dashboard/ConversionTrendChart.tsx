import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TimeSeriesDataPoint } from '../../types/business';

interface ConversionTrendChartProps {
    data: TimeSeriesDataPoint[];
    loading?: boolean;
}

const ConversionTrendChart: React.FC<ConversionTrendChartProps> = ({ data, loading = false }) => {
    const chartData = data.map(point => ({
        date: point.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        conversions: point.value,
    }));

    if (loading) {
        return (
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6 h-80 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-6">Tendance des conversions</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend />
                    <Bar dataKey="conversions" name="Conversions" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConversionTrendChart;
