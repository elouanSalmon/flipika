import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, MousePointerClick, Eye } from 'lucide-react';
import type { ReportDesign } from '../../../types/reportTypes';

interface PerformanceBlockProps {
    config: {
        accountId?: string;
        campaignIds?: string[];
        startDate?: string;
        endDate?: string;
        metrics?: string[];
    };
    design?: ReportDesign;
}

interface MetricData {
    label: string;
    value: string;
    change?: string;
    icon: React.ReactNode;
    color: string;
}

/**
 * Performance Block Component (Epic 13 - Story 13.2)
 * 
 * Displays a grid of performance metrics from Google Ads.
 * Uses report design colors when available.
 * TODO: Connect to actual Google Ads API
 */
export const PerformanceBlock: React.FC<PerformanceBlockProps> = ({ config, design }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<MetricData[]>([]);

    // Use report design colors or fallback to defaults
    const primaryColor = design?.colorScheme?.primary || '#3b82f6';
    const accentColor = design?.colorScheme?.accent || '#10b981';

    useEffect(() => {
        // TODO: Fetch real data from Google Ads API
        // For now, use mock data
        setTimeout(() => {
            setMetrics([
                {
                    label: 'Cost',
                    value: '5,234€',
                    change: '+12%',
                    icon: <DollarSign size={20} />,
                    color: 'text-blue-600 dark:text-blue-400',
                },
                {
                    label: 'Clicks',
                    value: '1,234',
                    change: '+8%',
                    icon: <MousePointerClick size={20} />,
                    color: 'text-green-600 dark:text-green-400',
                },
                {
                    label: 'Impressions',
                    value: '45,678',
                    change: '+15%',
                    icon: <Eye size={20} />,
                    color: 'text-purple-600 dark:text-purple-400',
                },
                {
                    label: 'CTR',
                    value: '2.7%',
                    change: '-0.3%',
                    icon: <TrendingUp size={20} />,
                    color: 'text-orange-600 dark:text-orange-400',
                },
            ]);
            setIsLoading(false);
        }, 500);
    }, [config]);

    if (isLoading) {
        return (
            <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} style={{ color: primaryColor }} />
                Performance Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={metric.color}>
                                {metric.icon}
                            </div>
                            {metric.change && (
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full ${metric.change.startsWith('+')
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {metric.change}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
