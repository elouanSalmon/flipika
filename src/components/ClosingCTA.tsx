import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ClosingCTA: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    return (
        <section className="relative py-24 sm:py-32 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #4f46e5 50%, #7c3aed 100%)',
            }} />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px',
            }} />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6"
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    {t('common:closingCta.title')}
                </motion.h2>

                <motion.p
                    className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                >
                    {t('common:closingCta.subtitle')}
                </motion.p>

                <motion.button
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-neutral-900 font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-shadow text-base"
                    onClick={() => navigate(getLangPath('/login'))}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <span>{t('common:closingCta.cta')}</span>
                    <ArrowRight size={18} />
                </motion.button>
            </div>
        </section>
    );
};

export default ClosingCTA;
