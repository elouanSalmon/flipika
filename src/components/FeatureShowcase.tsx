import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface FeatureShowcaseProps {
    badge: string;
    title: string;
    description: string;
    bullets: string[];
    imagePlaceholder: string;
    imagePosition: 'left' | 'right';
    illustration?: React.ReactNode;
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
    badge,
    title,
    description,
    bullets,
    imagePlaceholder,
    imagePosition,
    illustration,
}) => {
    const textContent = (
        <motion.div
            className="flex flex-col justify-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
            viewport={{ once: true }}
        >
            {/* Badge */}
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-primary bg-primary/8 dark:bg-primary/15 w-fit">
                {badge}
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-neutral-200 leading-tight tracking-tight">
                {title}
            </h3>

            {/* Description */}
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                {description}
            </p>

            {/* Bullets */}
            <ul className="flex flex-col gap-3 mt-1">
                {bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
                        <CheckCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );

    const imageContent = (
        <motion.div
            className="relative"
            initial={{ opacity: 0, x: imagePosition === 'right' ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" as const }}
            viewport={{ once: true }}
        >
            {illustration ? (
                illustration
            ) : (
                <div
                    className="w-full aspect-[4/3] rounded-2xl flex items-center justify-center overflow-hidden border border-neutral-200/60 dark:border-white/10 shadow-xl"
                    style={{
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8edff 50%, #dde5ff 100%)',
                    }}
                >
                    <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium px-6 text-center">
                        {imagePlaceholder}
                    </span>
                </div>
            )}
        </motion.div>
    );

    return (
        <section className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {imagePosition === 'right' ? (
                        <>
                            {textContent}
                            {imageContent}
                        </>
                    ) : (
                        <>
                            {imageContent}
                            {textContent}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
