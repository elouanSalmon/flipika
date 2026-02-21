import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const BigStatement: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="py-24 sm:py-32">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-neutral-200 leading-[1.15] tracking-tight"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" as const }}
                    viewport={{ once: true }}
                >
                    {t('bigStatement.title')}
                </motion.h2>
                <motion.p
                    className="mt-6 text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    viewport={{ once: true }}
                >
                    {t('bigStatement.subtitle')}
                </motion.p>
            </div>
        </section>
    );
};

export default BigStatement;
