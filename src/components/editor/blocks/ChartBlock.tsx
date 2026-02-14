import { BarChart3 } from 'lucide-react';

interface ChartBlockProps {
    config: Record<string, unknown>;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ config }) => {
    const chartType = (config.chartType as string) || 'line';

    return (
        <div className="p-6 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-white/10 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Chart ({chartType})
            </h3>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 rounded-lg border border-neutral-200/50 dark:border-white/10">
                <p className="text-neutral-500 dark:text-neutral-400">Chart placeholder</p>
            </div>
        </div>
    );
};
