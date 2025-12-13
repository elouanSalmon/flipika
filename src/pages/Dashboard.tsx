import { useState } from 'react';
import { TrendingUp, Users, DollarSign, MousePointer, Plus, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <div className="card group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon size={64} className="text-[var(--color-text-primary)]" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trend === 'up' ? 'badge-positive' : 'badge-negative'}`}>
                <Icon size={24} />
            </div>
            <span className={`badge-change ${change.startsWith('+') ? 'is-up' : 'is-down'}`}>
                {change}
            </span>
        </div>
        <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1 relative z-10">{title}</h3>
        <p className="text-2xl font-bold text-[var(--color-text-primary)] relative z-10">{value}</p>
    </div>
);

const ConnectionModal = ({ isOpen, onClose, onConnect }: any) => {
    const [step, setStep] = useState('select'); // select, connecting, success

    const handleConnect = () => {
        setStep('connecting');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onConnect();
                onClose();
                setStep('select');
            }, 1500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--color-bg-primary)] rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border border-[var(--color-border)]"
            >
                <div className="p-8">
                    {step === 'select' && (
                        <>
                            <div className="w-16 h-16 bg-[var(--color-primary-light)]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto text-[var(--color-primary)]">
                                <BarChart3 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-2">
                                Connecter vos données
                            </h2>
                            <p className="text-center text-[var(--color-text-secondary)] mb-8">
                                Liez votre compte Google Ads pour permettre à l'IA d'analyser vos performances.
                            </p>

                            <button
                                onClick={handleConnect}
                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--glass-bg-hover)] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-[var(--color-text-primary)]">Google Ads & Analytics</h3>
                                        <p className="text-xs text-[var(--color-text-secondary)]">Import des campagnes et conversions</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                    <Plus size={18} />
                                </div>
                            </button>
                        </>
                    )}

                    {step === 'connecting' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-[var(--color-primary-light)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-6" />
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Connexion sécurisée en cours...</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Nous importons vos données historiques.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Compte connecté avec succès !</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Redirection vers votre dashboard...</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const Dashboard = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-8">
            {/* Header with Connection Status */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Vue d'ensemble</h2>
                    <p className="text-[var(--color-text-secondary)]">Dernière mise à jour : à l'instant</p>
                </div>
                {!isConnected ? (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <Plus size={18} />
                        Connecter une source
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium text-sm">Données synchronisées</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <ConnectionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onConnect={() => setIsConnected(true)}
                    />
                )}
            </AnimatePresence>

            {!isConnected ? (
                // Empty State
                <div className="card p-12 text-center flex flex-col items-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-[var(--color-primary-light)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 size={40} className="text-[var(--color-primary)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                            Aucune donnée disponible
                        </h3>
                        <p className="text-[var(--color-text-secondary)] mb-8">
                            Pour commencer à utiliser Flipika et recevoir des recommandations IA, connectez votre compte Google Ads.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-primary w-full"
                        >
                            Connecter Google Ads
                        </button>
                    </div>
                </div>
            ) : (
                // Connected Dashboard Logic
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Dépenses Totales"
                            value="12 450 €"
                            change="+12%"
                            icon={DollarSign}
                            trend="up"
                        />
                        <StatCard
                            title="Impressions"
                            value="45.2k"
                            change="+5.4%"
                            icon={Users}
                            trend="up"
                        />
                        <StatCard
                            title="Clics"
                            value="3,240"
                            change="+8.1%"
                            icon={MousePointer}
                            trend="up"
                        />
                        <StatCard
                            title="ROAS Moyen"
                            value="4.2x"
                            change="+14.5%"
                            icon={TrendingUp}
                            trend="up"
                        />
                    </div>

                    {/* AI Recommendations Preview */}
                    <div className="card p-0 overflow-hidden">
                        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                                    <AlertCircle size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Insights IA Récents</h2>
                            </div>
                            <button className="link text-sm">Voir tout</button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors cursor-pointer">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-[var(--color-primary)] shrink-0"></div>
                                        <div>
                                            <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">Opportunité d'ajustement d'enchères</h4>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                Le mot-clé "marketing automation" sous-performe. Nous recommandons de baisser le CPC max de 15% pour optimiser le budget.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
