import { useState, useEffect } from 'react';
import { BarChart3, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isGoogleAdsConnected } from '../services/googleAds';

const Dashboard = () => {
    const { currentUser, linkGoogleAds } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsConnected(isGoogleAdsConnected());
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const success = await linkGoogleAds();
            if (success) {
                setIsConnected(true);
            }
        } catch (error) {
            console.error("Connection failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-full animate-pulse">
                    <BarChart3 size={48} className="text-[var(--color-primary)]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Connectez votre compte Google Ads</h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Pour commencer à optimiser vos campagnes avec l'IA, nous avons besoin d'accéder à vos performances.
                    </p>
                </div>
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn btn-primary btn-wide group"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Connexion...
                        </span>
                    ) : (
                        <>
                            Connecter Google Ads
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
                <p className="text-xs text-[var(--color-text-muted)] mt-4">
                    Sécurisé par Google • Lecture seule par défaut
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                    Bonjour, {currentUser?.displayName?.split(' ')[0] || 'User'} 👋
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                    Voici l'état de vos campagnes aujourd'hui.
                </p>
            </div>

            {/* Empty State - Connected but no Data (MVP) */}
            <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-muted)] mb-2">
                    <BarChart3 size={32} />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    En attente de données
                </h3>
                <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto">
                    Votre compte est connecté ! Nous analysons actuellement vos campagnes. Les premières recommandations apparaîtront ici bientôt.
                </p>
                <div className="flex gap-4 pt-4">
                    <button className="btn btn-outline" onClick={() => window.location.reload()}>
                        Actualiser
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Créer une campagne
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
