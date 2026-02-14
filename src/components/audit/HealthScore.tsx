import React from 'react';

interface HealthScoreProps {
    score: number; // 0-100
    previousScore?: number;
    breakdown: {
        structure: number;
        targeting: number;
        keywords: number;
        ads: number;
        budget: number;
        extensions: number;
        landingPages: number;
    };
}

const HealthScore: React.FC<HealthScoreProps> = ({ score, previousScore, breakdown }) => {
    const getScoreColor = (s: number): string => {
        if (s >= 71) return 'text-green-600 dark:text-green-400';
        if (s >= 41) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (s: number): string => {
        if (s >= 71) return 'from-green-500 to-emerald-500';
        if (s >= 41) return 'from-orange-500 to-amber-500';
        return 'from-red-500 to-rose-500';
    };

    const change = previousScore ? score - previousScore : 0;

    return (
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-8">
            <h3 className="text-lg font-bold mb-6">Score de santé global</h3>

            <div className="flex items-center gap-8">
                {/* Circular gauge */}
                <div className="relative w-48 h-48 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-neutral-200 dark:text-neutral-700"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="url(#scoreGradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(score / 100) * 553} 553`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className={`${getScoreBg(score).split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
                                <stop offset="100%" className={`${getScoreBg(score).split(' ')[1].replace('to-', 'text-')}`} stopColor="currentColor" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</span>
                        <span className="text-sm text-neutral-500">/100</span>
                        {change !== 0 && (
                            <span className={`text-sm font-semibold mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {change > 0 ? '+' : ''}{change}
                            </span>
                        )}
                    </div>
                </div>

                {/* Category breakdown */}
                <div className="flex-1 space-y-3">
                    <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Détail par catégorie</h4>
                    {Object.entries(breakdown).map(([key, value]) => {
                        const labels: Record<string, string> = {
                            structure: 'Structure',
                            targeting: 'Ciblage',
                            keywords: 'Mots-clés',
                            ads: 'Annonces',
                            budget: 'Budget',
                            extensions: 'Extensions',
                            landingPages: 'Pages de destination',
                        };

                        return (
                            <div key={key} className="flex items-center gap-3">
                                <span className="text-sm font-medium w-32">{labels[key]}</span>
                                <div className="flex-1 bg-neutral-200 dark:bg-black rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full bg-gradient-to-r ${getScoreBg(value)}`}
                                        style={{ width: `${value}%` }}
                                    ></div>
                                </div>
                                <span className={`text-sm font-semibold w-12 text-right ${getScoreColor(value)}`}>
                                    {value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HealthScore;
