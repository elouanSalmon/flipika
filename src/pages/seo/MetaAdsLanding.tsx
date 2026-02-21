import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ImagePlus, UserCircle, MessageSquare, LayoutDashboard, Share2 } from 'lucide-react';
import { SiMeta } from 'react-icons/si';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PricingPreview from '../../components/PricingPreview';
import TrustBar from '../../components/TrustBar';

const MetaAdsLanding = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        if (i18n.language === 'fr') return `/fr${path}`;
        if (i18n.language === 'es') return `/es${path}`;
        return path;
    };

    const isFr = i18n.language === 'fr';
    const isEs = i18n.language === 'es';

    const title = isFr
        ? <>Vos rapports <span className="text-indigo-600">Meta Ads</span> 100% automatisés.</>
        : isEs
            ? <>Tus informes de <span className="text-indigo-600">Meta Ads</span> 100% automatizados.</>
            : <>Your <span className="text-indigo-600">Meta Ads</span> reports, 100% automated.</>;

    const subtitle = isFr
        ? "Quittez le gestionnaire de publicités Facebook. Visualisez CPM, CPA, ROAS et les performances de vos créas directement dans vos slides."
        : isEs
            ? "Sal del administrador de anuncios de Facebook. Visualiza tu CPM, CPA y el rendimiento de creatividades en diapositivas hermosas."
            : "Leave the Facebook Ads Manager. Visualize CPM, CPA, ROAS and creative performance directly in your pitch slides.";

    const cta = isFr ? "Créer mon rapport Meta" : isEs ? "Crear informe de Meta" : "Build Meta Ads Report";

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 selection:bg-primary/20 selection:text-primary pt-20">
            <Helmet>
                <title>{isFr ? "Reporting Meta Ads Automatisé | Flipika" : "Automated Meta Ads Reporting | Flipika"}</title>
                <meta name="description" content={isFr ? "Automatisez vos rapports Meta Ads. Suivez les audiences, le ROAS et les créatives." : "Automate your Meta Ads reporting. Track audiences, ROAS and creative assets."} />
                <link rel="canonical" href="https://flipika.com/meta-ads-reporting" />
            </Helmet>

            <Header />

            <main>
                {/* Custom Meta Ads Hero */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-8"
                            >
                                <SiMeta className="w-4 h-4" />
                                <span>{isFr ? "Intégration Facebook & Instagram" : "Facebook & Instagram Integration"}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-6 leading-tight"
                            >
                                {title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-neutral-600 dark:text-neutral-400 mb-10"
                            >
                                {subtitle}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <button
                                    onClick={() => navigate(getLangPath('/login'))}
                                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    {cta} <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <TrustBar />

                {/* Custom Features for Meta Ads */}
                <section className="py-24 bg-white dark:bg-neutral-800/20 border-y border-neutral-100 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                {isFr ? "Référez-vous aux données sociales qui comptent" : "Focus on Social Metrics"}
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                {isFr ? "De l'analyse des créatives (UGC) jusqu'à vos coûts de répétition." : "From UGC creative analysis down to frequency rates."}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                <ImagePlus className="w-10 h-10 text-indigo-500 mb-6" />
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {isFr ? "Analyse des Créatives" : "Creatives Analysis"}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Visualisez l'impact visuel avec images et vidéos directement extraites du Business Manager." : "Visualize visual impact as images and videos are pulled instantly from Business Manager."}
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                <UserCircle className="w-10 h-10 text-indigo-500 mb-6" />
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {isFr ? "Couverture et Répétition" : "Reach & Frequency"}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Montrez à vos clients l'évolution de la couverture unique et si la répétition augmente." : "Show clients how unique reach evolves and track frequency increases seamlessly."}
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                <MessageSquare className="w-10 h-10 text-indigo-500 mb-6" />
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {isFr ? "CPA & ROAS par Audience" : "ROAS by Audience"}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Bénéficiez de graphiques générés seuls expliquant quels sont les achats les plus rentables." : "Benefit from auto-generated charts that explain which purchases are the most profitable."}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow Section Tailored to Meta Ads */}
                <section className="py-24 bg-neutral-50 dark:bg-neutral-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                {isFr ? "En 3 étapes simples" : "In 3 simple steps"}
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                                    <SiMeta size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">1. {isFr ? "Liage au Business Manager" : "Link Business Manager"}</h4>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Importez les conversions Pixel, les dépenses, clics et données sociales." : "Import Pixel conversions, Ad spend, clicks and social metrics."}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                                    <LayoutDashboard size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">2. {isFr ? "Générez un Diaporama" : "Generate Slidedeck"}</h4>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Les images de vos annonces et KPIs s'encartent dans votre présentation." : "Your ad creative images and KPIs automatically populate your presentation."}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                                    <Share2 size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">3. {isFr ? "Diffusez en direct" : "Present Live"}</h4>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Utilisez le mode diaporama de Flipika pour des rendez-vous clients éblouissants." : "Use Flipika's rich slideshow mode to dazzle your clients in your meetings."}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <PricingPreview />
            </main>

            <Footer />
        </div>
    );
};

export default MetaAdsLanding;
