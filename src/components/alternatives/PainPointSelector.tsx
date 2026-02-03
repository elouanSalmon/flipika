import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import type { Competitor } from '../../data/competitors';

interface PainPointSelectorProps {
    competitor: Competitor;
}

const PainPointSelector: React.FC<PainPointSelectorProps> = ({ competitor }) => {
    const { t } = useTranslation();

    return (
        <section className="relative group">
            <div className="absolute inset-0 bg-red-500/5 rounded-3xl blur-xl" />
            <div className="relative glass-card border border-red-500/20 dark:border-red-900/30 rounded-3xl p-8 md:p-12 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="p-4 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight">
                            {t(`${competitor.slug}:page.painPointsTitle`, { competitor: competitor.name })}
                        </h3>
                        <p className="text-xl text-secondary leading-relaxed">
                            {t(`${competitor.slug}:page.painPointsSubtitle`, { competitor: competitor.name })}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PainPointSelector;
