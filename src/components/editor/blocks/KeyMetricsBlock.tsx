import React from 'react';
import { TrendingUp, DollarSign, Target, Zap } from 'lucide-react';

interface KeyMetricsBlockProps {
    config: {
        [key: string]: any;
    };
}

/**
 * Key Metrics Block Component (Epic 13 - Story 13.2)
 * 
 * Displays a 2x2 grid of key KPIs.
 * TODO: Connect to Google Ads API
 */
export const KeyMetricsBlock: React.FC<KeyMetricsBlockProps> = ({ config }) => {
    const metrics = [
        { label: 'ROAS', value: '4.2x', icon: <TrendingUp size={32} />, color: 'text-green-600' },
        { label: 'CPA', value: '12.50€', icon: <Target size={32} />, color: 'text-blue-600' },
        { label: 'Revenue', value: '21,980€', icon: <DollarSign size={32} />, color: 'text-purple-600' },
        { label: 'Conversions', value: '1,758', icon: <Zap size={32} />, color: 'text-orange-600' },
    ];

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🎯 Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg text-center"
                    >
                        <div className={`flex justify-center mb-3 ${metric.color}`}>
                            {metric.icon}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
