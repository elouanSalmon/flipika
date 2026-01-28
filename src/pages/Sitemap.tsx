import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, ChevronRight, Globe, Shield, Zap } from 'lucide-react';
import { competitors } from '../data/competitors';
import SEO from '../components/SEO';

const Sitemap: React.FC = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const sections = [
        {
            title: i18n.language === 'fr' ? 'Pages Principales' : 'Main Pages',
            icon: <Globe className="w-5 h-5 text-blue-500" />,
            links: [
                { name: i18n.language === 'fr' ? 'Accueil' : 'Home', path: '/' },
                { name: i18n.language === 'fr' ? 'Connexion' : 'Login', path: '/login' },
            ]
        },
        {
            title: i18n.language === 'fr' ? 'Alternatives & Comparatifs' : 'Alternatives & Comparisons',
            icon: <Zap className="w-5 h-5 text-amber-500" />,
            links: [
                { name: i18n.language === 'fr' ? 'Toutes les Alternatives' : 'All Alternatives', path: '/alternatives' },
                ...competitors.map(c => ({
                    name: i18n.language === 'fr' ? `Flipika vs ${c.name}` : `Flipika vs ${c.name}`,
                    path: `/alternatives/${c.slug}`
                }))
            ]
        },
        {
            title: i18n.language === 'fr' ? 'Légal & Confidentialité' : 'Legal & Privacy',
            icon: <Shield className="w-5 h-5 text-emerald-500" />,
            links: [
                { name: i18n.language === 'fr' ? 'Mentions Légales' : 'Legal Notices', path: '/legal-notices' },
                { name: i18n.language === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy', path: '/privacy-policy' },
                { name: i18n.language === 'fr' ? 'Conditions d\'Utilisation' : 'Terms of Service', path: '/terms-of-service' },
            ]
        }
    ];

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] py-20 px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <SEO
                title={i18n.language === 'fr' ? 'Plan du site | Flipika' : 'Sitemap | Flipika'}
                description={i18n.language === 'fr' ? 'Parcourez toutes les pages de Flipika.com pour trouver facilement l\'information que vous cherchez.' : 'Browse all pages of Flipika.com to easily find the information you are looking for.'}
            />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6"
                    >
                        <Map size={16} />
                        <span>Sitemap</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tight"
                    >
                        {i18n.language === 'fr' ? 'Plan du site' : 'Site Structure'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-secondary max-w-2xl mx-auto"
                    >
                        {i18n.language === 'fr'
                            ? 'Retrouvez l\'ensemble de nos pages publiques pour une navigation fluide et efficace.'
                            : 'Explore all our public pages for a smooth and efficient discovery experience.'}
                    </motion.p>
                </div>

                <div className="space-y-12">
                    {sections.map((section, sIndex) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + sIndex * 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 backdrop-blur-sm">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-bold text-primary uppercase tracking-wider">{section.title}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.links.map((link) => (
                                    <button
                                        key={link.path}
                                        onClick={() => navigate(getLangPath(link.path))}
                                        className="group flex items-center justify-between p-5 rounded-2xl glass-card border border-white/20 dark:border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-blue-600/20 group-hover:bg-blue-600 transition-colors" />
                                            <span className="text-lg font-semibold text-secondary group-hover:text-primary transition-colors">
                                                {link.name}
                                            </span>
                                        </div>
                                        <ChevronRight size={18} className="text-secondary/30 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 p-8 rounded-3xl bg-blue-600/5 border border-blue-600/10 text-center"
                >
                    <p className="text-secondary leading-relaxed">
                        {i18n.language === 'fr'
                            ? 'Besoin d\'aide ou d\'un acces à l\'application ?'
                            : 'Need help or access to the application?'}
                        <br />
                        <span
                            onClick={() => navigate(getLangPath('/login'))}
                            className="text-blue-600 font-bold cursor-pointer hover:underline underline-offset-4 ml-1"
                        >
                            {i18n.language === 'fr' ? 'Accéder à votre espace' : 'Go to your workspace'}
                        </span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Sitemap;
