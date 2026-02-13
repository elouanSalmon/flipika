import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, ShoppingBag, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TemplateGallery: React.FC = () => {
    const { t, i18n } = useTranslation('templates-pillar');
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const templates = [
        {
            id: 'executive',
            icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
            color: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            id: 'ecommerce',
            icon: <ShoppingBag className="w-8 h-8 text-purple-500" />,
            color: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20'
        },
        {
            id: 'agency',
            icon: <Briefcase className="w-8 h-8 text-emerald-500" />,
            color: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.map((template, index) => (
                <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`group relative p-8 rounded-3xl backdrop-blur-sm border ${template.borderColor} ${template.color} hover:shadow-xl transition-all duration-300 cursor-pointer`}
                    onClick={() => navigate(getLangPath('/login'))}
                >
                    <div className="mb-6 p-4 rounded-2xl bg-white/50 dark:bg-black/20 w-fit backdrop-blur-md">
                        {template.icon}
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                        {t(`gallery.${template.id}.title`)}
                    </h3>

                    <p className="text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
                        {t(`gallery.${template.id}.description`)}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                        {t('page.cta')}
                        <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
            ))}
        </div>
    );
};

export default TemplateGallery;
