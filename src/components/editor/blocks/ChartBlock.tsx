import { BarChart3 } from 'lucide-react';

interface ChartBlockProps {
    config: Record<string, unknown>;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ config }) => {
    const chartType = (config.chartType as string) || 'line';

    return (
        <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Chart ({chartType})
            </h3>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-gray-500 dark:text-gray-400">Chart placeholder</p>
            </div>
        </div>
    );
};
