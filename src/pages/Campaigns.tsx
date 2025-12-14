import { Search, Filter, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { isGoogleAdsConnected, fetchCampaigns, getLinkedCustomerId } from '../services/googleAds';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Campaigns = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const connected = isGoogleAdsConnected();
        setIsConnected(connected);
        if (connected) {
            loadCampaigns();
        }
    }, []);

    const loadCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            // @ts-ignore
            const result = await fetchCampaigns();
            const response = result as any;
            if (response.success && response.campaigns) {
                setCampaigns(response.campaigns);
            } else {
                setError("Impossible de charger les campagnes.");
            }
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des campagnes.");
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center !min-h-[100vh] text-center space-y-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-full">
                    <AlertCircle size={48} className="text-orange-500" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Source de données manquante</h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Vous devez connecter votre compte Google Ads pour voir et gérer vos campagnes.
                    </p>
                </div>
                <Link to="/app/dashboard" className="btn btn-primary">
                    Connecter Google Ads
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Campagnes</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                        Compte: {getLinkedCustomerId()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadCampaigns} className="btn btn-ghost" title="Actualiser">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="btn btn-secondary gap-2" disabled>
                        <Filter size={16} />
                        Filtrer
                    </button>
                    <button className="btn btn-primary gap-2" disabled>
                        <Search size={16} />
                        Rechercher
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-2xl border-4 border-red-400">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <AlertCircle size={28} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">Erreur de connexion</h3>
                            <p className="text-red-50 leading-relaxed font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : campaigns.length > 0 ? (
                <div className="card overflow-hidden bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="p-4">Nom</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Dépenses</th>
                                <th className="p-4 text-right">Impressions</th>
                                <th className="p-4 text-right">Clics</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {campaigns.map((c) => (
                                <tr key={c.id}>
                                    <td className="p-4 font-medium">{c.name}</td>
                                    <td className="p-4"><span className={`badge badge-sm ${c.status === 'ENABLED' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span></td>
                                    <td className="p-4 text-right">{c.cost ? c.cost.toFixed(2) : 0} €</td>
                                    <td className="p-4 text-right">{c.impressions}</td>
                                    <td className="p-4 text-right">{c.clicks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Empty State for Connected Account */
                <div className="card py-16 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center mb-2">
                        <Search size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Aucune campagne trouvée
                    </h3>
                    <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto">
                        Nous n'avons trouvé aucune campagne active sur ce compte pour le moment.
                    </p>
                    <button className="btn btn-primary mt-4">
                        <Plus size={18} />
                        Créer une campagne
                    </button>
                </div>
            )}
        </div>
    );
};

export default Campaigns;
