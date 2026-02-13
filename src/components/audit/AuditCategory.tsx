import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import type { CategoryScore } from '../../types/business';

interface AuditCategoryProps {
    name: string;
    score: number;
    categoryData: CategoryScore;
    expanded?: boolean;
    onMarkAsCompleted?: (recId: string) => void;
    onAddNote?: (recId: string, note: string) => void;
}

const AuditCategory: React.FC<AuditCategoryProps> = ({
    name,
    score,
    categoryData,
    expanded = false,
    onMarkAsCompleted,
    onAddNote,
}) => {
    const [isExpanded, setIsExpanded] = useState(expanded);

    const getScoreColor = (s: number): string => {
        if (s >= 71) return 'text-green-600 dark:text-green-400';
        if (s >= 41) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (s: number): string => {
        if (s >= 71) return 'bg-green-500';
        if (s >= 41) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const categoryLabels: Record<string, string> = {
        structure: 'Structure de campagne',
        targeting: 'Ciblage et audiences',
        keywords: 'Mots-clés',
        ads: 'Annonces',
        budget: 'Budget et enchères',
        extensions: 'Extensions d\'annonces',
        landingPages: 'Pages de destination',
    };

    return (
        <div className="card bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getScoreBg(score)}`}></div>
                        <h3 className="text-lg font-bold">{categoryLabels[name] || name}</h3>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}/100</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-500">
                        {categoryData.recommendations.length} recommandation{categoryData.recommendations.length > 1 ? 's' : ''}
                    </span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>

            {isExpanded && categoryData.recommendations.length > 0 && (
                <div className="border-t border-neutral-100 dark:border-neutral-700 p-6 space-y-4 bg-neutral-50 dark:bg-neutral-700/20">
                    {categoryData.recommendations.map(rec => (
                        <RecommendationCard
                            key={rec.id}
                            recommendation={rec}
                            onMarkAsCompleted={onMarkAsCompleted}
                            onAddNote={onAddNote}
                        />
                    ))}
                </div>
            )}

            {isExpanded && categoryData.recommendations.length === 0 && (
                <div className="border-t border-neutral-100 dark:border-neutral-700 p-6 text-center text-neutral-500">
                    <p>Aucune recommandation pour cette catégorie. Excellent travail ! 🎉</p>
                </div>
            )}
        </div>
    );
};

export default AuditCategory;
