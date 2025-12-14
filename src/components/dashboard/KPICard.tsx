import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number; // Percentage change
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    loading?: boolean;
    format?: 'number' | 'currency' | 'percent';
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    change,
    icon,
    trend = 'neutral',
    loading = false,
    format = 'number',
}) => {
    const formatValue = (val: string | number): string => {
        if (typeof val === 'string') return val;

        switch (format) {
            case 'currency':
                return `${val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
            case 'percent':
                return `${val.toFixed(2)}%`;
            default:
                return val.toLocaleString('fr-FR');
        }
    };

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={16} className="text-green-600 dark:text-green-400" />;
            case 'down':
                return <TrendingDown size={16} className="text-red-600 dark:text-red-400" />;
            default:
                return <Minus size={16} className="text-gray-400" />;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'text-green-600 dark:text-green-400';
            case 'down':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
        );
    }

    return (
        <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    {icon}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {formatValue(value)}
                </h3>

                {change !== undefined && (
                    <div className="flex items-center gap-1.5">
                        {getTrendIcon()}
                        <span className={`text-sm font-semibold ${getTrendColor()}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">vs période précédente</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KPICard;
