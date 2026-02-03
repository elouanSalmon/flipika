import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import type { Competitor } from '../../data/competitors';

interface MigrationCTAProps {
    competitor: Competitor;
}

const MigrationCTA: React.FC<MigrationCTAProps> = ({ competitor }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    return (
        <div className="relative group mt-32">
            <div className="absolute inset-0 bg-blue-600/10 rounded-[3rem] blur-3xl group-hover:bg-blue-600/15 transition-all duration-700" />
            <div className="relative glass-card border border-white/20 dark:border-white/10 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl overflow-hidden">
                {/* Visual accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />

                <div className="relative z-10 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-10 tracking-widest uppercase"
                    >
                        <Zap className="w-5 h-5 fill-blue-600" />
                        <span>{t('alternatives:common.migrationGuarantee')}</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl font-black text-primary mb-8 leading-[1.1] tracking-tight">
                        {t(`${competitor.slug}:page.migrationCtaTitle`, { competitor: competitor.name })}
                    </h2>

                    <p className="text-xl md:text-2xl text-secondary mb-12 leading-relaxed opacity-80">
                        {t(`${competitor.slug}:page.migrationCtaDesc`, { competitor: competitor.name })}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={() => navigate(getLangPath('/login'))}
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3"
                        >
                            {t('alternatives:common.tryFlipika')}
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="mt-10 text-base text-secondary font-semibold opacity-60">
                        No credit card required • Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MigrationCTA;
