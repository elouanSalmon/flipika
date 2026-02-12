import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, RefreshCw, UserX } from 'lucide-react';
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

  const problems = [
    {
      icon: Clock,
      title: t('common:problem.issues.timeManagement'),
      description: t('common:problem.issues.budgetWaste')
    },
    {
      icon: RefreshCw,
      title: t('common:problem.issues.inconsistentCampaigns'),
      description: t('common:problem.issues.difficultToScale')
    },
    {
      icon: UserX,
      title: t('common:problem.issues.expensiveAgency'),
      description: t('common:problem.issues.costlyAndTime')
    }
  ];

  return (
    <section id="problem" className="relative py-28">
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
              <AlertTriangle size={18} />
              <span>{t('common:problem.title')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('common:problem.subtitle')}
            </h2>
          </motion.div>

          {/* Problem Cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-5 mb-14"
            variants={containerVariants}
          >
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                className="group relative p-7 glass rounded-3xl border border-white/10 dark:border-white/5 overflow-hidden"
                variants={itemVariants}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
              >
                {/* Subtle gradient accent on top */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                    opacity: 0.2,
                  }}
                />

                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/10 mb-6 mx-auto group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                  <problem.icon size={26} className="text-primary" />
                </div>

                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Transition */}
          <motion.div
            className="flex items-center gap-6 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <p className="text-lg font-medium bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent px-4 text-center">
              {t('common:problem.description')}
            </p>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;
