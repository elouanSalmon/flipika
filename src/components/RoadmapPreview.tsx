import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BarChart3, Target, Rocket, ArrowRight } from 'lucide-react';

const RoadmapPreview: React.FC = () => {
    const { t, i18n } = useTranslation();

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const phases = [
        {
            icon: BarChart3,
            color: 'green',
            title: t('common:roadmapPreview.now'),
            description: t('common:roadmapPreview.nowDescription'),
            dotClass: 'bg-green-500',
            textClass: 'text-green-600 dark:text-green-400',
            bgClass: 'bg-green-500/10',
        },
        {
            icon: Target,
            color: 'blue',
            title: t('common:roadmapPreview.soon'),
            description: t('common:roadmapPreview.soonDescription'),
            dotClass: 'bg-primary-500',
            textClass: 'text-primary dark:text-primary-light',
            bgClass: 'bg-primary-500/10',
        },
        {
            icon: Rocket,
            color: 'purple',
            title: t('common:roadmapPreview.future'),
            description: t('common:roadmapPreview.futureDescription'),
            dotClass: 'bg-purple-500',
            textClass: 'text-purple-600 dark:text-purple-400',
            bgClass: 'bg-purple-500/10',
        },
    ];

    return (
        <section className="section" style={{ padding: '80px 0' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-3">
                        {t('common:roadmapPreview.title')}
                    </h2>
                    <p className="text-lg text-[var(--color-text-secondary)]">
                        {t('common:roadmapPreview.description')}
                    </p>
                </motion.div>

                {/* Horizontal timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="relative mb-10"
                >
                    {/* Horizontal line */}
                    {/* Horizontal line */}
                    <div className="absolute top-6 left-[16%] right-[16%] h-px bg-gradient-to-r from-green-500/40 via-primary/40 to-purple-500/40" />

                    <div className="grid grid-cols-3 gap-4 md:gap-8">
                        {phases.map((phase, i) => {
                            const Icon = phase.icon;
                            return (
                                <div key={i} className="relative flex flex-col items-center text-center">
                                    {/* Dot */}
                                    <div className={`w-12 h-12 mb-4 ${phase.dotClass} rounded-full flex items-center justify-center shadow-lg relative z-10`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <h3 className="text-sm md:text-base font-bold text-[var(--color-text-primary)] mb-1">
                                        {phase.title}
                                    </h3>
                                    <p className={`text-xs md:text-sm font-medium ${phase.textClass}`}>
                                        {phase.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* CTA link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center"
                >
                    <Link
                        to={getLangPath('/roadmap')}
                        className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold transition-all hover:-translate-y-0.5"
                    >
                        {t('common:roadmapPreview.cta')}
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default RoadmapPreview;
