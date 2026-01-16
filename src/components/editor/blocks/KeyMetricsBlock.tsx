import React from 'react';
import { TrendingUp, DollarSign, Target, Zap } from 'lucide-react';
import type { ReportDesign } from '../../../types/reportTypes';

interface KeyMetricsBlockProps {
    config: {
        [key: string]: any;
    };
    design?: ReportDesign;
}

/**
 * Key Metrics Block Component (Epic 13 - Story 13.2)
 * 
 * Displays a 2x2 grid of key KPIs.
 * Uses report design colors when available.
 * TODO: Connect to Google Ads API
 */
export const KeyMetricsBlock: React.FC<KeyMetricsBlockProps> = ({ design }) => {
    // Use report design colors or fallback to defaults
    const primaryColor = design?.colorScheme?.primary || '#3b82f6';
    const metrics = [
        { label: 'ROAS', value: '4.2x', icon: <TrendingUp size={28} />, color: 'text-green-600 dark:text-green-400', bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
        { label: 'CPA', value: '12.50€', icon: <Target size={28} />, color: 'text-blue-600 dark:text-blue-400', bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
        { label: 'Revenue', value: '21,980€', icon: <DollarSign size={28} />, color: 'text-purple-600 dark:text-purple-400', bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' },
        { label: 'Conversions', value: '1,758', icon: <Zap size={28} />, color: 'text-orange-600 dark:text-orange-400', bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' },
    ];

    return (
        <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={20} style={{ color: primaryColor }} />
                Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className={`p-6 bg-gradient-to-br ${metric.bgGradient} rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:scale-105 transition-transform duration-200`}
                    >
                        <div className={`flex justify-center mb-3 ${metric.color}`}>
                            {metric.icon}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">{metric.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
