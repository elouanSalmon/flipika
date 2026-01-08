import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Users, FileText, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  const scrollToEmailForm = () => {
    const emailSection = document.getElementById('email-capture');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const testimonials = [
    {
      id: 'pierre',
      name: t('common:testimonials.reviews.pierre.name'),
      role: t('common:testimonials.reviews.pierre.role'),
      company: t('common:testimonials.reviews.pierre.company'),
      content: t('common:testimonials.reviews.pierre.content'),
      metric: t('common:testimonials.reviews.pierre.metric'),
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'julien',
      name: t('common:testimonials.reviews.julien.name'),
      role: t('common:testimonials.reviews.julien.role'),
      company: t('common:testimonials.reviews.julien.company'),
      content: t('common:testimonials.reviews.julien.content'),
      metric: t('common:testimonials.reviews.julien.metric'),
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
    }
  ];

  const stats = [
    { value: '127', label: t('common:testimonials.stats.earlyAdopters'), icon: Users },
    { value: '+2 500', label: t('common:testimonials.stats.reportsGenerated'), icon: FileText },
    { value: '3h', label: t('common:testimonials.stats.timeSavedPerReport'), icon: Clock }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
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

  return (
    <section id="testimonials" className="relative py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t('common:testimonials.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('common:testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-4 px-6 py-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl"
              variants={itemVariants}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <stat.icon size={20} className="text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote size={32} />
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 pr-8">
                "{testimonial.content}"
              </p>

              {/* Metric badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
                <Clock size={14} />
                <span>{testimonial.metric}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="btn btn-primary inline-flex items-center gap-2"
            onClick={scrollToEmailForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{t('common:testimonials.cta')}</span>
            <ArrowRight size={18} />
          </motion.button>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {t('common:testimonials.ctaSubtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
