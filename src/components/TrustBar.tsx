import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Simple Google Logo Component
const GoogleLogo = ({ size = 24, className }: { size?: number | string, className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const TrustBar: React.FC = () => {
    const { t } = useTranslation();

    const stats = [
        { icon: GoogleLogo, value: t('common:hero.stats.googleValidation.value'), label: t('common:hero.stats.googleValidation.label') },
        { icon: Lock, value: t('common:hero.stats.security.value'), label: t('common:hero.stats.security.label') },
        { icon: ShieldCheck, value: t('common:hero.stats.gdpr.value'), label: t('common:hero.stats.gdpr.label') },
        { icon: TrendingUp, value: t('common:hero.stats.reportsGenerated.value'), label: t('common:hero.stats.reportsGenerated.label') }
    ];

    return (
        <section className="py-10 border-y border-neutral-200/50 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-center justify-center sm:justify-start gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                                <stat.icon size={24} className="text-primary" />
                            </div>
                            <div className="text-left">
                                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-200 leading-tight">{stat.value}</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TrustBar;
