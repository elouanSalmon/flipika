import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import type { Competitor } from '../../data/competitors';

interface ComparisonTableProps {
    competitor: Competitor;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ competitor }) => {
    const { t } = useTranslation();

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 dark:border-white/10 glass-card shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 dark:bg-white/5 border-b border-white/20 dark:border-white/10">
                                <th className="px-8 py-6 text-sm font-bold text-secondary uppercase tracking-widest">{t(`${competitor.slug}:page.comparisonTitle`)}</th>
                                <th className="px-8 py-6 text-sm font-bold text-secondary uppercase tracking-widest">{competitor.name}</th>
                                <th className="px-8 py-6 text-sm font-bold text-primary dark:text-primary-light uppercase tracking-widest bg-primary/5">
                                    Flipika
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 dark:divide-white/5">
                            {competitor.features.map((feature: any, index: number) => (
                                <tr key={index} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6 text-base font-semibold text-primary">
                                        {feature.name}
                                    </td>
                                    <td className="px-8 py-6">
                                        {feature.hasCompetitor ? (
                                            <div className="w-8 h-8 rounded-full bg-neutral-500/10 flex items-center justify-center">
                                                <Check className="w-5 h-5 text-neutral-500" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <X className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 bg-primary/5">
                                        {feature.hasFlipika ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                                <span className="text-base font-bold text-primary">Inclus</span>
                                            </div>
                                        ) : (
                                            <X className="w-5 h-5 text-secondary/30" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonTable;
