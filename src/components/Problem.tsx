import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Problem: React.FC = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const problems = [
    {
      icon: Clock,
      title: t('common:problem.issues.timeManagement'),
      description: t('common:problem.issues.budgetWaste')
    },
    {
      icon: TrendingDown,
      title: t('common:problem.issues.inconsistentCampaigns'),
      description: t('common:problem.issues.difficultToScale')
    },
    {
      icon: DollarSign,
      title: t('common:problem.issues.expensiveAgency'),
      description: t('common:problem.issues.costlyAndTime')
    }
  ];

  return (
    <section id="problem" className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 102, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 102, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse 100% 100% at 50% 100%, black 40%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 100%, black 40%, transparent 70%)'
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Header */}
          <motion.div className="mb-12" variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <AlertTriangle size={18} />
              <span>{t('common:problem.title')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t('common:problem.subtitle')}
            </h2>
          </motion.div>

          {/* Problem Cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
          >
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                className="group relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/10 mb-5 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <problem.icon size={24} className="text-primary" />
                </div>

                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
