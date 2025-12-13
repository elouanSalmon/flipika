import { useState, useEffect } from 'react';
import { BarChart3, ArrowRight, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isGoogleAdsConnected, getLinkedCustomerId, fetchAccessibleCustomers, fetchCampaigns } from '../services/googleAds';

const Dashboard = () => {
    const { linkGoogleAds } = useAuth();
    const [step, setStep] = useState<'LOADING' | 'CONNECT' | 'SELECT_ACCOUNT' | 'DASHBOARD'>('LOADING');
    const [customers, setCustomers] = useState<string[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Load Logic
    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = () => {
        const connected = isGoogleAdsConnected();
        const storedCid = getLinkedCustomerId();

        if (!connected) {
            setStep('CONNECT');
        } else if (!storedCid) {
            setStep('SELECT_ACCOUNT');
            loadCustomers();
        } else {
            setStep('DASHBOARD');
            loadCampaigns();
        }
    };

    const loadCustomers = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const result = await fetchAccessibleCustomers();
            const response = result as any;
            if (response.customers && response.customers.length > 0) {
                setCustomers(response.customers);
            } else {
                setError("Aucun compte trouvé. Assurez-vous d'avoir accès à un compte Google Ads.");
            }
        } catch (err: any) {
            console.error(err);
            setError("Impossible de charger les comptes.");
        } finally {
            setLoading(false);
        }
    };

    const loadCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            // @ts-ignore
            const result = await fetchCampaigns();
            const response = result as any;
            if (response.campaigns) {
                setCampaigns(response.campaigns);
            }
        } catch (err: any) {
            console.error(err);
            setError("Erreur lors du chargement des campagnes.");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            const success = await linkGoogleAds();
            if (success) {
                setStep('SELECT_ACCOUNT');
                loadCustomers();
            }
        } catch (error) {
            console.error("Connection failed", error);
        } finally {
            setLoading(false);
        }
    };

    const selectCustomer = (resourceName: string) => {
        const id = resourceName.split('/')[1];
        localStorage.setItem('google_ads_customer_id', id);
        setStep('DASHBOARD');
        loadCampaigns();
    };

    const handleLogoutAds = () => {
        localStorage.removeItem('google_ads_token');
        localStorage.removeItem('google_ads_customer_id');
        setStep('CONNECT');
        setCampaigns([]);
        setCustomers([]);
    };

    if (step === 'LOADING') return <div className="p-12 text-center">Chargement...</div>;

    if (step === 'CONNECT') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm !min-h-[100vh]">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <BarChart3 size={48} className="text-blue-600" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold">Connectez Google Ads</h2>
                    <p className="text-gray-500">Accédez à vos campagnes pour commencer l'optimisation.</p>
                </div>
                <button onClick={handleConnect} disabled={loading} className="btn btn-primary btn-wide">
                    {loading ? 'Connexion...' : 'Connecter un compte'}
                </button>
            </div>
        );
    }

    if (step === 'SELECT_ACCOUNT') {
        return (
            <div className="max-w-md mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-center">Choisissez un compte</h2>
                {error && <div className="text-red-500 text-center text-sm">{error}</div>}

                {loading ? (
                    <div className="text-center p-8">Recherche des comptes...</div>
                ) : (
                    <div className="grid gap-3">
                        {customers.map((cust, idx) => (
                            <button key={idx} onClick={() => selectCustomer(cust)} className="card p-4 hover:border-blue-500 transition-all flex items-center justify-between group text-left">
                                <span className="font-medium">Compte {cust.split('/')[1]}</span>
                                <ArrowRight className="opacity-0 group-hover:opacity-100 text-blue-500" />
                            </button>
                        ))}
                    </div>
                )}
                <button onClick={handleLogoutAds} className="btn btn-ghost w-full btn-sm">Annuler</button>
            </div>
        );
    }

    // DASHBOARD VIEW
    return (
        <div className="min-h-screen space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold">Vos Campagnes</h1>
                    <p className="text-gray-500 text-sm">Compte: {getLinkedCustomerId()}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => loadCampaigns()} className="btn btn-ghost btn-sm">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleLogoutAds} className="btn btn-ghost btn-sm text-red-500">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card overflow-hidden bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
                        <tr>
                            <th className="p-4">Nom</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-right">Dépenses</th>
                            <th className="p-4 text-right">Clics</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {campaigns.length > 0 ? campaigns.map((c) => (
                            <tr key={c.id}>
                                <td className="p-4 font-medium">{c.name}</td>
                                <td className="p-4"><span className="badge badge-sm">{c.status}</span></td>
                                <td className="p-4 text-right">{c.cost ? c.cost.toFixed(2) : 0} €</td>
                                <td className="p-4 text-right">{c.clicks}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Aucune campagne active.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
