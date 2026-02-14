import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, ArrowRight, Lock, ChevronRight, ChevronDown, Check, User } from 'lucide-react';
import { leadMagnets } from '../../data/leadMagnets';
import SEO from '../../components/SEO';

const LeadMagnetPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t, i18n } = useTranslation(['lead-magnets']);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const magnet = leadMagnets.find(m => m.slug === slug);

    if (!magnet) {
        return <Navigate to="/" replace />;
    }

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                navigate(getLangPath('/login'));
            }, 1000);
        }, 1500);
    };

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const getIcon = () => {
        const Icon = magnet.icon;
        return <Icon className="w-8 h-8" />;
    };

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] min-h-screen font-sans text-primary">
            <SEO
                title={t(`pages.${magnet.slug}.title`)}
                description={t(`pages.${magnet.slug}.metaDescription`)}
                canonicalPath={`/resources/${magnet.slug}`}
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: t(`pages.${magnet.slug}.title`).split(' | ')[0], path: `/resources/${magnet.slug}` },
                ]}
            />

            {/* Fake App Container for "App-Like" Feel - No Sidebar */}
            <div className="flex min-h-screen flex-col">

                {/* Header */}
                <header className="h-20 border-b border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>Resources</span>
                        <ChevronRight size={16} />
                        <span className="text-primary font-medium">{t('common.preview')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
                            {i18n.language === 'fr' ? 'Disponible' : 'Available'}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="p-4 md:p-12 max-w-7xl mx-auto w-full">

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

                        {/* Main Card (Left) */}
                        <div className="xl:col-span-8 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-black rounded-3xl border border-neutral-200 dark:border-white/10 p-8 md:p-12 shadow-sm relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                    {getIcon()}
                                </div>

                                <div className="flex items-start gap-6 mb-8">
                                    <div className={`p-4 rounded-2xl shrink-0 ${magnet.format === 'excel' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' :
                                        magnet.format === 'ppt' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20' :
                                            'bg-red-100 text-red-600 dark:bg-red-900/20'
                                        }`}>
                                        {getIcon()}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
                                            {t(`pages.${magnet.slug}.h1`)}
                                        </h1>
                                        <p className="text-xl text-secondary leading-relaxed">
                                            {t(`pages.${magnet.slug}.subtitle`)}
                                        </p>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="mb-12">
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">{t('common.whatsInside')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(t(`pages.${magnet.slug}.features`, { returnObjects: true }) as string[]).map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-black/50 border border-neutral-100 dark:border-white/10">
                                                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary flex items-center justify-center shrink-0">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                                <span className="font-medium text-secondary">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* FAQ */}
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">{t('common.faq')}</h3>
                                    <div className="space-y-3">
                                        {(t(`pages.${magnet.slug}.faq`, { returnObjects: true }) as any[]).map((item, i) => (
                                            <div key={i} className="border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden">
                                                <button
                                                    onClick={() => toggleFaq(i)}
                                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                                >
                                                    <span className="font-bold text-primary">{item.q}</span>
                                                    <ChevronDown size={18} className={`text-neutral-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {activeFaq === i && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                        >
                                                            <div className="p-5 pt-0 text-secondary leading-relaxed border-t border-neutral-100 dark:border-white/10">
                                                                {item.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </motion.div>
                        </div>

                        {/* Sidebar Card (Right) - Sticky Form */}
                        <div className="xl:col-span-4 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-black rounded-3xl border border-neutral-200 dark:border-white/10 p-8 shadow-xl shadow-primary-dark/5 sticky top-28"
                            >
                                {status === 'success' ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                            <CheckCircle2 size={32} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-primary mb-2">{t('common.success')}</h3>
                                        <p className="text-secondary mb-6">{t('common.successMessage')}</p>
                                        <div className="flex justify-center">
                                            <span className="loading loading-dots loading-md text-primary"></span>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-primary mb-2">{t('common.downloadCTA')}</h2>
                                            <p className="text-sm text-secondary">{t(`pages.${magnet.slug}.trap.title`)}</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Email Professionnel</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder={t('common.emailPlaceholder')}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 custom-button"
                                        >
                                            {status === 'loading' ? t('common.downloading') : (
                                                <>
                                                    {t('common.downloadCTA')}
                                                    <ArrowRight size={16} />
                                                </>
                                            )}
                                        </button>

                                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                            <Lock size={10} />
                                            {t('common.secure')}
                                        </div>
                                    </form>
                                )}
                            </motion.div>

                            {/* Personas Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-white/10"
                            >
                                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">{t('common.whoFor')}</h3>
                                <div className="space-y-3">
                                    {(t(`pages.${magnet.slug}.personas`, { returnObjects: true }) as string[]).map((persona, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center shadow-sm">
                                                <User size={14} className="text-neutral-500" />
                                            </div>
                                            <span className="text-sm font-medium text-secondary">{persona}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadMagnetPage;
