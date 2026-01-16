import React from 'react';

interface ChartBlockProps {
    config: {
        chartType?: 'line' | 'bar' | 'area';
        [key: string]: any;
    };
}

/**
 * Chart Block Component (Epic 13 - Story 13.2)
 * 
 * Displays charts (line, bar, area) from Google Ads data.
 * TODO: Implement with Recharts
 */
export const ChartBlock: React.FC<ChartBlockProps> = ({ config }) => {
    const chartType = config.chartType || 'line';

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📈 Chart ({chartType})
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded">
                <p className="text-gray-500 dark:text-gray-400">
                    Chart component - TODO: Implement with Recharts
                </p>
            </div>
        </div>
    );
};
