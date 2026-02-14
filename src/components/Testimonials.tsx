import React from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { Star, Quote, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = React.useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

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
    },
    {
      id: 'sarah',
      name: t('common:testimonials.reviews.sarah.name'),
      role: t('common:testimonials.reviews.sarah.role'),
      company: t('common:testimonials.reviews.sarah.company'),
      content: t('common:testimonials.reviews.sarah.content'),
      metric: t('common:testimonials.reviews.sarah.metric'),
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'thomas',
      name: t('common:testimonials.reviews.thomas.name'),
      role: t('common:testimonials.reviews.thomas.role'),
      company: t('common:testimonials.reviews.thomas.company'),
      content: t('common:testimonials.reviews.thomas.content'),
      metric: t('common:testimonials.reviews.thomas.metric'),
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg'
    }
  ];

  // We duplicate enough times to ensure smooth scrolling on large screens
  // 4 items * 3 = 12 items. Enough for > 4000px width.
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const totalWidth = containerRef.current.scrollWidth;
        const oneSetWidth = totalWidth / 3;
        setContentWidth(oneSetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useAnimationFrame((_time: number, delta: number) => {
    if (isHovered || isDragging || contentWidth === 0) return;

    // Move left
    // Adjust speed here: Higher is faster. 0.05 is decent.
    const moveBy = 0.05 * delta;
    let newX = x.get() - moveBy;

    // Wrap logic
    // If we've scrolled past one full set width, reset by adding that width
    if (newX <= -contentWidth) {
      newX += contentWidth;
    }
    // If somehow we are positive (dragged right too much), wrap back
    else if (newX > 0) {
      newX -= contentWidth;
    }

    x.set(newX);
  });

  const handleDragEnd = () => {
    setIsDragging(false);
    // Align? Optional. For marquee we usually don't align.
    // Ensure we are within bounds?
    // The auto-scroll loop will handle bounds on next frame locally,
    // but if user dragged WAY off, we might want to wrap immediately.
    const currentX = x.get();
    if (currentX <= -contentWidth) {
      x.set(currentX % contentWidth);
    } else if (currentX > 0) {
      x.set(-contentWidth + (currentX % contentWidth));
    }
  };

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-[var(--color-bg-primary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-neutral-200 tracking-tight mb-4">
            {t('common:testimonials.title')}
          </h2>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
            {t('common:testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Marquee */}
        <div
          className="relative w-full group cursor-grab active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Scrolling Container */}
          <motion.div
            ref={containerRef}
            className="flex w-max"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -contentWidth * 2, right: 0 }} // Relaxed constraints
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            {duplicatedTestimonials.map((testimonial, i) => (
              <div key={`testimonial-${i}`} className="mr-6 h-full">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: any }) => (
  <div className="relative flex flex-col p-6 w-[350px] shrink-0 bg-white dark:bg-black/60 rounded-2xl border border-neutral-200/60 dark:border-white/10 shadow-sm transition-transform hover:-translate-y-1 duration-300 h-full select-none">
    {/* Quote */}
    <Quote size={24} className="text-primary/15 mb-3" />

    {/* Content */}
    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5 flex-1 line-clamp-5">
      "{testimonial.content}"
    </p>

    {/* Metric */}
    <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 dark:bg-primary/15 rounded-lg px-3 py-1.5 w-fit mb-4">
      <Clock size={12} />
      <span>{testimonial.metric}</span>
    </div>

    {/* Author */}
    <div className="flex items-center gap-3">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-10 h-10 rounded-full object-cover pointer-events-none"
      />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
            {testimonial.name}
          </span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="text-primary fill-primary" />
            ))}
          </div>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {testimonial.role} · {testimonial.company}
        </div>
      </div>
    </div>
  </div>
);

export default Testimonials;
