import React, { useState } from 'react';
import { Check, X, TrendingUp, Wrench, StickyNote } from 'lucide-react';
import type { Recommendation } from '../../types/business';

interface RecommendationCardProps {
    recommendation: Recommendation;
    onMarkAsCompleted?: (id: string) => void;
    onAddNote?: (id: string, note: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
    recommendation,
    onMarkAsCompleted,
    onAddNote,
}) => {
    const [showNotes, setShowNotes] = useState(false);
    const [noteText, setNoteText] = useState(recommendation.notes || '');

    const getImpactBadge = (impact: Recommendation['impact']) => {
        const styles = {
            HIGH: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            MEDIUM: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
            LOW: 'bg-primary-100 dark:bg-primary-900/30 text-primary-dark dark:text-primary-light',
        };

        const labels = {
            HIGH: 'Impact élevé',
            MEDIUM: 'Impact moyen',
            LOW: 'Impact faible',
        };

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[impact]}`}>
                {labels[impact]}
            </span>
        );
    };

    const getPriorityBadge = (priority: Recommendation['priority']) => {
        const styles = {
            URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            IMPORTANT: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
            MINOR: 'bg-neutral-100 dark:bg-black text-neutral-700 dark:text-neutral-400',
        };

        const labels = {
            URGENT: 'Urgent',
            IMPORTANT: 'Important',
            MINOR: 'Mineur',
        };

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[priority]}`}>
                {labels[priority]}
            </span>
        );
    };

    const getDifficultyBadge = (difficulty: Recommendation['difficulty']) => {
        const styles = {
            EASY: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            COMPLEX: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
        };

        const labels = {
            EASY: 'Facile',
            MEDIUM: 'Moyen',
            COMPLEX: 'Complexe',
        };

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[difficulty]}`}>
                {labels[difficulty]}
            </span>
        );
    };

    const handleSaveNote = () => {
        onAddNote?.(recommendation.id, noteText);
        setShowNotes(false);
    };

    return (
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">{recommendation.title}</h4>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{recommendation.description}</p>
                    </div>
                    {recommendation.status === 'COMPLETED' && (
                        <div className="shrink-0 p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Check size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    {getImpactBadge(recommendation.impact)}
                    {getPriorityBadge(recommendation.priority)}
                    {getDifficultyBadge(recommendation.difficulty)}
                </div>

                {/* Impact value */}
                {recommendation.impactValue && (
                    <div className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                        <TrendingUp size={18} className="text-primary dark:text-primary-light" />
                        <span className="font-semibold text-primary-dark dark:text-primary-light">
                            Impact estimé :{' '}
                            {recommendation.impactValue.unit === 'EUR'
                                ? `${recommendation.impactValue.amount.toFixed(2)} €/mois`
                                : `+${recommendation.impactValue.amount}%`}
                        </span>
                    </div>
                )}

                {/* Action items */}
                {recommendation.actionItems.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                            <Wrench size={16} />
                            Actions à entreprendre
                        </h5>
                        <ul className="space-y-1.5 ml-6">
                            {recommendation.actionItems.map((item, index) => (
                                <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 list-disc">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Notes section */}
                {showNotes && (
                    <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-white/10">
                        <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                            <StickyNote size={16} />
                            Notes personnelles
                        </label>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black text-sm"
                            rows={3}
                            placeholder="Ajoutez vos notes..."
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSaveNote} className="btn btn-primary btn-sm">
                                Sauvegarder
                            </button>
                            <button onClick={() => setShowNotes(false)} className="btn btn-ghost btn-sm">
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    {recommendation.status !== 'COMPLETED' && onMarkAsCompleted && (
                        <button
                            onClick={() => onMarkAsCompleted(recommendation.id)}
                            className="btn btn-primary btn-sm"
                        >
                            <Check size={16} />
                            Marquer comme traité
                        </button>
                    )}
                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        className="btn btn-ghost btn-sm"
                    >
                        <StickyNote size={16} />
                        {showNotes ? 'Masquer notes' : 'Ajouter une note'}
                    </button>
                    <button className="btn btn-ghost btn-sm text-red-600 dark:text-red-400">
                        <X size={16} />
                        Ignorer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
