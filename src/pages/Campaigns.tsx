import { Search, Filter, AlertCircle, Plus } from 'lucide-react';

import { isGoogleAdsConnected } from '../services/googleAds';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Campaigns = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setIsConnected(isGoogleAdsConnected());
    }, []);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
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

    // Real state: No campaigns loaded yet (MVP without backend)
    return (
        <div>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Campagnes</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm">Gérez et analysez vos performances</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary btn-sm gap-2" disabled>
                        <Filter size={16} />
                        Filtrer
                    </button>
                    <button className="btn btn-primary btn-sm gap-2" disabled>
                        <Search size={16} />
                        Rechercher
                    </button>
                </div>
            </div>

            {/* Empty State for Connected Account */}
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
        </div>
    );
};

export default Campaigns;
