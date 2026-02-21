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
        <section className="py-24 relative overflow-hidden bg-[var(--color-bg-primary)]">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                        {t('roadmapPreview.title', 'All your ad platforms, one place.')}
                    </h2>
                    <p className="text-lg text-[var(--color-text-secondary)] mb-8">
                        {t('roadmapPreview.description', 'From Google Ads to TikTok, we are building the ultimate reporting hub for every media buyer.')}
                    </p>

                    <Link
                        to={getLangPath('/roadmap')}
                        className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold transition-all hover:-translate-y-0.5"
                    >
                        {t('roadmapPreview.cta', 'See our Roadmap')}
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>

                {/* Logos Marquee */}
                <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] group">
                    <motion.div
                        className="flex w-max items-center gap-16 md:gap-24"
                        animate={{ x: "-50%" }}
                        transition={{
                            duration: 20,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                    >
                        {[...logos, ...logos].map((Logo, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ opacity: 1, scale: 1.1 }}
                                className="text-[var(--color-text-secondary)] opacity-60 grayscale hover:grayscale-0 hover:text-[var(--color-primary)] transition-all duration-300 flex items-center justify-center shrink-0"
                            >
                                <Logo size={40} className="md:w-12 md:h-12" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default RoadmapPreview;
