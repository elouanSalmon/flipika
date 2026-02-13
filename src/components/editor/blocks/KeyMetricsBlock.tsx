import { TrendingUp, DollarSign, Target, Zap } from 'lucide-react';

interface KeyMetricsBlockProps {
    config: Record<string, unknown>;
}

export const KeyMetricsBlock: React.FC<KeyMetricsBlockProps> = () => {
    const metrics = [
        { label: 'ROAS', value: '4.2x', icon: <TrendingUp size={28} />, color: 'text-green-600', bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
        { label: 'CPA', value: '12.50€', icon: <Target size={28} />, color: 'text-blue-600', bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
        { label: 'CTR', value: '3.2%', icon: <Zap size={28} />, color: 'text-orange-600', bg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' },
        { label: 'Budget', value: '€5,000', icon: <DollarSign size={28} />, color: 'text-purple-600', bg: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20' },
    ];

    return (
        <div className="p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className={`p-4 bg-gradient-to-br ${metric.bg} rounded-lg border border-neutral-200/50 dark:border-neutral-600/50`}
                    >
                        <div className={`mb-2 ${metric.color}`}>{metric.icon}</div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{metric.label}</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metric.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
