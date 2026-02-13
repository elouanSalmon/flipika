import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, MousePointerClick, Eye } from 'lucide-react';

interface PerformanceBlockProps {
    config: Record<string, unknown>;
}

interface MetricData {
    label: string;
    value: string;
    change?: string;
    icon: React.ReactNode;
    color: string;
}

export const PerformanceBlock: React.FC<PerformanceBlockProps> = ({ config }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<MetricData[]>([]);

    useEffect(() => {
        // Mock data - TODO: connect to Google Ads API
        const timer = setTimeout(() => {
            setMetrics([
                {
                    label: 'Impressions',
                    value: '125,432',
                    change: '+12.5%',
                    icon: <Eye size={24} />,
                    color: 'text-blue-600 dark:text-blue-400',
                },
                {
                    label: 'Clicks',
                    value: '3,847',
                    change: '+8.3%',
                    icon: <MousePointerClick size={24} />,
                    color: 'text-green-600 dark:text-green-400',
                },
                {
                    label: 'Cost',
                    value: '€2,156.78',
                    change: '-2.1%',
                    icon: <DollarSign size={24} />,
                    color: 'text-orange-600 dark:text-orange-400',
                },
                {
                    label: 'Conversions',
                    value: '156',
                    change: '+15.7%',
                    icon: <TrendingUp size={24} />,
                    color: 'text-purple-600 dark:text-purple-400',
                },
            ]);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [config]);

    if (isLoading) {
        return (
            <div className="p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg animate-pulse">
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Performance Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="p-4 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-700 rounded-lg border border-neutral-200/50 dark:border-neutral-600/50"
                    >
                        <div className={`mb-2 ${metric.color}`}>{metric.icon}</div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{metric.label}</p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{metric.value}</p>
                        {metric.change && (
                            <p className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
