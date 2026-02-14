import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import {
    SiGoogleads, SiMeta, SiTiktok, SiLinkedin,
    SiPinterest, SiAmazon, SiSnapchat, SiX, SiReddit
} from 'react-icons/si';

const RoadmapPreview: React.FC = () => {
    const { t, i18n } = useTranslation('common');

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const logos = [
        SiGoogleads, SiMeta, SiTiktok,
        SiLinkedin, SiPinterest, SiAmazon,
        SiSnapchat, SiX, SiReddit
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                        {t('common:roadmapPreview.title', 'All your ad platforms, one place.')}
                    </h2>
                    <p className="text-lg text-[var(--color-text-secondary)] mb-8">
                        {t('common:roadmapPreview.description', 'From Google Ads to TikTok, we are building the ultimate reporting hub for every media buyer.')}
                    </p>

                    <Link
                        to={getLangPath('/roadmap')}
                        className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold transition-all hover:-translate-y-0.5"
                    >
                        {t('common:roadmapPreview.cta', 'See our Roadmap')}
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
                >
                    {logos.map((Logo, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.1, opacity: 1 }}
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                        >
                            <Logo size={40} className="md:w-14 md:h-14" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default RoadmapPreview;
