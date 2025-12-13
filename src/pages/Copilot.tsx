import { Sparkles, Send, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { isGoogleAdsConnected } from '../services/googleAds';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Copilot = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setIsConnected(isGoogleAdsConnected());
    }, []);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center !min-h-[100vh] text-center space-y-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-full">
                    <AlertCircle size={48} className="text-orange-500" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Source de données manquante</h2>
                    <p className="text-[var(--color-text-secondary)]">
                        L'IA a besoin d'accéder à votre compte Google Ads pour générer des recommandations.
                    </p>
                </div>
                <Link to="/app/dashboard" className="btn btn-primary">
                    Connecter Google Ads
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="card flex-1 flex flex-col p-0 overflow-hidden relative">
                {/* Chat Header */}
                <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Flipika AI Copilot</h2>
                        <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online & Ready to optimize
                        </p>
                    </div>
                </div>

                {/* Chat Area - Connected State */}
                <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 mb-6 rounded-full bg-[var(--color-primary-light)]/10 flex items-center justify-center relative"
                    >
                        <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-10 blur-xl animate-pulse"></div>
                        <Sparkles className="text-[var(--color-primary)] relative z-10" size={40} />
                    </motion.div>

                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                        Prêt à analyser vos performances
                    </h3>
                    <p className="text-[var(--color-text-secondary)] max-w-md mb-8">
                        Posez-moi une question sur vos campagnes, vos dépenses, ou demandez-moi d'auditer votre compte.
                    </p>

                    {/* Suggestions Chips */}
                    <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                        {['Audit général du compte', 'Pourquoi mon CTR baisse ?', 'Optimiser mes mots-clés', 'Résumé des dépenses hier'].map((suggestion) => (
                            <button
                                key={suggestion}
                                className="chip cursor-pointer"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Message Flipika Copilot..."
                            className="w-full pl-6 pr-14 py-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all shadow-sm"
                        />
                        <button className="absolute right-2 top-2 p-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity">
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-3">
                        L'IA peut faire des erreurs. Vérifiez les informations importantes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Copilot;
