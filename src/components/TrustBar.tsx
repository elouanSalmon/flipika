import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrustBar: React.FC = () => {
    const { t } = useTranslation();

    const stats = [
        { icon: Zap, value: t('common:hero.stats.reportTime.value'), label: t('common:hero.stats.reportTime.label') },
        { icon: TrendingUp, value: t('common:hero.stats.reportsGenerated.value'), label: t('common:hero.stats.reportsGenerated.label') },
        { icon: Sparkles, value: t('common:hero.stats.zeroFormatting.value'), label: t('common:hero.stats.zeroFormatting.label') }
    ];

    return (
        <section className="py-10 border-y border-gray-200/50 dark:border-gray-700/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="flex flex-wrap justify-center gap-10 sm:gap-16"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/8 dark:bg-primary/15">
                                <stat.icon size={20} className="text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TrustBar;
