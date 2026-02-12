import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Users, FileText, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      transition: { staggerChildren: 0.12 }
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

  return (
    <section id="testimonials" className="relative py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '-5%',
            width: '30vw',
            height: '30vw',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.06,
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '-10%',
            width: '25vw',
            height: '25vw',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            opacity: 0.04,
            filter: 'blur(100px)',
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
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight">
            {t('common:testimonials.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('common:testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-5 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-4 px-6 py-4 glass rounded-2xl border border-white/10 dark:border-white/5"
              variants={itemVariants}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                <stat.icon size={22} className="text-primary" />
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
          className="grid md:grid-cols-2 gap-6 mb-14"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="relative p-7 glass rounded-3xl border border-white/10 dark:border-white/5 overflow-hidden"
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

              {/* Quote icon */}
              <div className="absolute top-5 right-5 text-primary/15">
                <Quote size={36} />
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 pr-10 text-base">
                "{testimonial.content}"
              </p>

              {/* Metric badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-xl mb-6">
                <Clock size={14} />
                <span>{testimonial.metric}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  style={{ width: '52px', height: '52px' }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
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
            className="btn btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 shadow-lg shadow-primary/25"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span>{t('common:testimonials.cta')}</span>
            <ArrowRight size={18} />
          </motion.button>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {t('common:testimonials.ctaSubtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
