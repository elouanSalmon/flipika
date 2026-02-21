import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Target, Zap, LayoutDashboard, Share2 } from 'lucide-react';
import { SiGoogleads } from 'react-icons/si';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PricingPreview from '../../components/PricingPreview';
import TrustBar from '../../components/TrustBar';
import SEO from '../../components/SEO';

const GoogleAdsLanding = () => {
    const { i18n } = useTranslation();
    const { t: tSeo } = useTranslation('seo-google-ads');
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        if (i18n.language === 'fr') return `/fr${path}`;
        if (i18n.language === 'es') return `/es${path}`;
        return path;
    };

    const isFr = i18n.language === 'fr';
    const isEs = i18n.language === 'es';

    const googleAdsSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Flipika - Google Ads Reporting",
        "applicationCategory": "BusinessApplication",
        "description": tSeo('landing.description'),
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock"
        },
        "featureList": [
            "Google Ads automated reporting",
            "Performance Max (PMax) campaign tracking",
            "Keyword analysis & Quality Score reporting",
            "ROAS & CPA automatic calculation",
            "AI-powered insights & narration",
            "White-label Google Ads reports",
            "PDF & PowerPoint export"
        ]
    };



    const title = isFr
        ? <>Vos rapports <span className="text-blue-600">Google Ads</span> générés en un clic.</>
        : isEs
            ? <>Tus informes de <span className="text-blue-600">Google Ads</span> en un clic.</>
            : <>Your <span className="text-blue-600">Google Ads</span> reports generated in one click.</>;

    const subtitle = isFr
        ? "Fini les copier-coller depuis l'interface Google. Centralisez vos CPC, CPA et conversions dans de magnifiques présentations générées par l'IA."
        : isEs
            ? "Basta de copiar y pegar desde Google Ads. Muestra tu CPC, CPA y conversiones en hermosas presentaciones generadas por IA."
            : "No more copy-pasting from Google Ads. Showcase your CPC, CPA, and conversions in beautiful AI-generated presentations.";

    const cta = isFr ? "Créer mon rapport Google Ads" : isEs ? "Crear informe de Google Ads" : "Build Google Ads Report";

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 selection:bg-primary/20 selection:text-primary pt-20">
            <SEO
                title={tSeo('landing.title')}
                description={tSeo('landing.description')}
                keywords={tSeo('landing.keywords')}
                canonicalPath="/google-ads-reporting"
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: isFr ? 'Reporting Google Ads' : 'Google Ads Reporting', path: '/google-ads-reporting' },
                ]}
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(googleAdsSchema)}
                </script>
            </Helmet>

            <Header />


            <main>
                {/* Custom Google Ads Hero */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-sm mb-8"
                            >
                                <SiGoogleads className="w-4 h-4" />
                                <span>{isFr ? "Intégration Officielle Google Ads" : "Official Google Ads Integration"}</span>
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
                                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    {cta} <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <TrustBar />

                {/* Custom Features for Google Ads */}
                <section className="py-24 bg-white dark:bg-neutral-800/20 border-y border-neutral-100 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                {isFr ? "L'outil de reporting pensé pour le Search & Display" : "Reporting built for Search & Display"}
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                {isFr ? "Des mots-clés jusqu'au retour sur l'Ad Spend (ROAS)." : "From Keywords down to Return on Ad Spend (ROAS)."}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                <Target className="w-10 h-10 text-blue-500 mb-6" />
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {isFr ? "Suivi du CPA & ROAS" : "CPA & ROAS Tracking"}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Vos coûts par acquisition et ROAS sont calculés et visualisés automatiquement pour chaque campagne, incluant PMax." : "Your cost per acquisition and ROAS are accurately visualized for every campaign, including PMax."}
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                <BarChart3 className="w-10 h-10 text-blue-500 mb-6" />
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {isFr ? "Analyse des Mots-Clés" : "Keyword Analysis"}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Identifiez les termes de recherche qui convertissent le mieux et mettez-les en valeur auprès de vos clients sans tableurs." : "Highlight your best-converting search terms and present them to clients without touching spreadsheets."}
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                <Zap className="w-10 h-10 text-blue-500 mb-6" />
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {isFr ? "Génération par l'IA" : "AI Narrative Generation"}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "L'intelligence artificielle détecte vos baisses de CTR ou hausses de CPC et rédige des insights." : "The AI detects CTR drops or CPC spikes and instantly writes actionable insights."}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow Section Tailored to Google Ads */}
                <section className="py-24 bg-neutral-50 dark:bg-neutral-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                {isFr ? "Comment ça marche ?" : "How it works"}
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                                    <SiGoogleads size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">1. {isFr ? "Liez votre compte Google" : "Connect Google Account"}</h4>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Connexion API sécurisée en un clic pour importer les données en temps réel." : "Secure 1-click API connection to sync real-time search data."}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                                    <LayoutDashboard size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">2. {isFr ? "Générez la Présentation" : "Generate Slide Deck"}</h4>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Les groupes d'annonces et Kpis se placent tous seuls dans la présentation." : "Ad groups and exact KPIs place themselves perfectly within the deck."}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                                    <Share2 size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">3. {isFr ? "Envoyez au client" : "Send to Client"}</h4>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {isFr ? "Partagez via un lien web direct, ou générez un PDF marque-blanche." : "Share via direct web link or export a beautiful white-label PDF."}
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

export default GoogleAdsLanding;
