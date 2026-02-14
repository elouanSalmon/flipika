import React from 'react';
import { motion } from 'framer-motion';
import { Link2, FileText, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Problem: React.FC = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const steps = [
    {
      number: '01',
      icon: Link2,
      title: t('common:workflow.step1.title'),
      description: t('common:workflow.step1.description'),
      bullets: t('common:workflow.step1.bullets', { returnObjects: true }) as string[]
    },
    {
      number: '02',
      icon: FileText,
      title: t('common:workflow.step2.title'),
      description: t('common:workflow.step2.description'),
      bullets: t('common:workflow.step2.bullets', { returnObjects: true }) as string[]
    },
    {
      number: '03',
      icon: Send,
      title: t('common:workflow.step3.title'),
      description: t('common:workflow.step3.description'),
      bullets: t('common:workflow.step3.bullets', { returnObjects: true }) as string[]
    }
  ];

  return (
    <section id="workflow" className="relative py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '-5%',
            width: '30vw',
            height: '30vw',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.06,
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Header */}
          <motion.div className="mb-14" variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass text-primary rounded-full text-sm font-medium mb-6 border border-white/10 dark:border-white/5">
              <span>{t('common:workflow.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-neutral-200 tracking-tight mb-5">
              {t('common:workflow.title')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              {t('common:workflow.subtitle')}
            </p>
          </motion.div>

          {/* Workflow Steps */}
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="group relative p-7 glass rounded-3xl border border-white/10 dark:border-white/5 overflow-hidden text-left"
                variants={itemVariants}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
              >
                {/* Top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                    opacity: 0.2,
                  }}
                />

                {/* Step number */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/10 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                    <step.icon size={24} className="text-primary" />
                  </div>
                  <span className="text-4xl font-black text-primary/15 dark:text-primary/10">{step.number}</span>
                </div>

                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-200 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">
                  {step.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-2.5">
                  {Array.isArray(step.bullets) && step.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                      <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;
