import { AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { isGoogleAdsConnected } from '../services/googleAds';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Copilot = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setIsConnected(isGoogleAdsConnected());
    }, []);

    const auditItems = [
        {
            id: 1,
            severity: 'high',
            title: 'Scores de qualité faibles',
            description: '3 campagnes ont un score de qualité inférieur à 5/10.',
            action: 'Optimiser les annonces'
        },
        {
            id: 2,
            severity: 'medium',
            title: 'Budget limité',
            description: 'La campagne "Search - Paris" est limitée par le budget.',
            action: 'Ajuster le budget'
        },
        {
            id: 3,
            severity: 'low',
            title: 'Mots-clés en doublon',
            description: 'Détection de mots-clés similaires dans différents groupes.',
            action: 'Nettoyer'
        }
    ];

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center !min-h-[100vh] text-center space-y-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-full">
                    <AlertTriangle size={48} className="text-orange-500" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Source de données manquante</h2>
                    <p className="text-[var(--color-text-secondary)]">
                        L'IA a besoin d'accéder à votre compte Google Ads pour générer l'audit.
                    </p>
                </div>
                <Link to="/app/dashboard" className="btn btn-primary">
                    Connecter Google Ads
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header Score for Audit */}
            <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 border-none transform transition-transform hover:scale-[1.01]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Audit de Performance</h1>
                        <p className="opacity-90 max-w-lg">
                            Votre compte a été analysé. Voici les opportunités d'optimisation détectées pour améliorer votre ROAS.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="text-center">
                            <div className="text-4xl font-bold">72<span className="text-xl opacity-70">/100</span></div>
                            <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">Santé du Compte</div>
                        </div>
                        <div className="h-12 w-[1px] bg-white/20"></div>
                        <TrendingUp size={32} className="text-green-300" />
                    </div>
                </div>
            </div>

            {/* Audit List */}
            <div className="grid gap-4">
                <h2 className="text-xl font-bold mb-2">Recommandations Prioritaires</h2>
                {auditItems.map((item) => (
                    <div key={item.id} className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
                        <div className="flex items-start gap-4 p-5">
                            <div className={`mt-1 p-2 rounded-lg ${item.severity === 'high' ? 'bg-red-50 text-red-500' :
                                item.severity === 'medium' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                                }`}>
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <span className={`badge badge-sm uppercase font-bold ${item.severity === 'high' ? 'badge-error' :
                                        item.severity === 'medium' ? 'badge-warning' : 'badge-info'
                                        }`}>{item.severity}</span>
                                </div>
                                <p className="text-gray-500">{item.description}</p>
                            </div>
                            <button className="btn btn-ghost group-hover:bg-gray-100 dark:group-hover:bg-gray-700 self-center">
                                <span className="mr-2">{item.action}</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Copilot;
