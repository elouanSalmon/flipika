import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, MousePointerClick, Eye } from 'lucide-react';

interface PerformanceBlockProps {
    config: {
        accountId?: string;
        campaignIds?: string[];
        startDate?: string;
        endDate?: string;
        metrics?: string[];
    };
}

interface MetricData {
    label: string;
    value: string;
    change?: string;
    icon: React.ReactNode;
}

/**
 * Performance Block Component (Epic 13 - Story 13.2)
 * 
 * Displays a grid of performance metrics from Google Ads.
 * TODO: Connect to actual Google Ads API
 */
export const PerformanceBlock: React.FC<PerformanceBlockProps> = ({ config }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<MetricData[]>([]);

    useEffect(() => {
        // TODO: Fetch real data from Google Ads API
        // For now, use mock data
        setTimeout(() => {
            setMetrics([
                {
                    label: 'Cost',
                    value: '5,234€',
                    change: '+12%',
                    icon: <DollarSign size={24} className="text-blue-600" />,
                },
                {
                    label: 'Clicks',
                    value: '1,234',
                    change: '+8%',
                    icon: <MousePointerClick size={24} className="text-green-600" />,
                },
                {
                    label: 'Impressions',
                    value: '45,678',
                    change: '+15%',
                    icon: <Eye size={24} className="text-purple-600" />,
                },
                {
                    label: 'CTR',
                    value: '2.7%',
                    change: '-0.3%',
                    icon: <TrendingUp size={24} className="text-orange-600" />,
                },
            ]);
            setIsLoading(false);
        }, 500);
    }, [config]);

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📊 Performance Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center justify-between mb-2">
                            {metric.icon}
                            {metric.change && (
                                <span
                                    className={`text-xs font-medium ${metric.change.startsWith('+')
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}
                                >
                                    {metric.change}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
