import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, ArrowRight, RefreshCw, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLinkedCustomerId, fetchAccessibleCustomers, fetchCampaigns } from '../services/googleAds';

const Dashboard = () => {
    const { linkGoogleAds, currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState<'LOADING' | 'CONNECT' | 'SELECT_ACCOUNT' | 'DASHBOARD'>('LOADING');
    const [customers, setCustomers] = useState<string[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Load Logic
    useEffect(() => {
        const oauthError = searchParams.get('error');
        const oauthMessage = searchParams.get('message');
        const oauthSuccess = searchParams.get('oauth');

        if (oauthError) {
            setError(oauthMessage || "Erreur d'authentification OAuth");
            setStep('CONNECT');
        } else if (oauthSuccess === 'success') {
            // Give Firebase a moment to propagate the write if needed, then check
            setTimeout(() => {
                checkStatus(true);
            }, 1000);
        } else {
            checkStatus();
        }
    }, [searchParams]);

    const checkStatus = async (forceRefresh = false) => {
        const storedCid = getLinkedCustomerId();
        console.log("Checking status for User ID:", currentUser?.uid);
        // Debugging: Log current user ID
        // @ts-ignore
        // const currentUser = window.auth?.currentUser || { uid: 'unknown' }; // Hacky access or use hook if available properly in scope, but useAuth is cleaner
        // Better: use the auth from context if possible, but it's not in scope of checkStatus easily without refactoring.
        // Actually, checkStatus is inside the component, so we can access `useAuth` values if we destructured them.
        // We destructured `linkGoogleAds`. Let's destructure `currentUser` too.

        if (storedCid && !forceRefresh) {
            setStep('DASHBOARD');
            loadCampaigns();
            return;
        }

        // If no local CID, check if we are connected on backend
        await loadCustomers(true);
    };

    const loadCustomers = async (isCheck = false) => {
        setLoading(true);
        try {
            // @ts-ignore
            const result = await fetchAccessibleCustomers();
            const response = result as any;

            if (response.customers && response.customers.length > 0) {
                setCustomers(response.customers);
                setStep('SELECT_ACCOUNT');
                setError(null);
            } else if (response.customers && response.customers.length === 0) {
                setError("Aucun compte Google Ads trouvé associé à ce compte Google.");
                setStep('SELECT_ACCOUNT');
            } else {
                console.warn("Check status: Connected but no customers found or not connected", response);
                // Not connected
                if (isCheck) {
                    setStep('CONNECT');
                    // Optional: set a temporary error to see if something went wrong
                    if (response.error) {
                        // Simplify the 412 error for the user
                        if (response.error.includes("412") || response.error.includes("No Google Ads account")) {
                            setError("Compte non connecté. Veuillez relancer la connexion.");
                        } else {
                            setError(`Erreur connexion: ${response.error}`);
                        }
                    }
                }
                else setError("Aucun compte trouvé.");
            }
        } catch (err: any) {
            console.error("Check status error:", err);
            if (isCheck) {
                setStep('CONNECT');
                setError(`Erreur de vérification: ${err.message || 'Inconnue'}`);
            }
            else setError("Impossible de charger les comptes.");
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
        setError(null);
        try {
            const success = await linkGoogleAds();
            if (success) {
                // Determine next step based on result
                // But linkGoogleAds redirects, so we might not get here if redirect happens immediately
            }
        } catch (error) {
            console.error("Connection failed", error);
            setError("Échec de la connexion.");
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
        setError(null);
    };

    if (step === 'LOADING') return <div className="p-12 text-center">Chargement...</div>;

    if (step === 'CONNECT') {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <BarChart3 size={48} className="text-blue-600" />
                </div>
                <div className="max-w-md space-y-3">
                    <h2 className="text-2xl font-bold">Connectez Google Ads</h2>
                    <p className="text-gray-500">Accédez à vos campagnes pour commencer l'optimisation.</p>
                </div>

                {error && (
                    <div className="w-full max-w-md bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-2xl border-4 border-red-400">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <AlertCircle size={28} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    ⚠️ Erreur de connexion
                                </h3>
                                <p className="text-red-50 leading-relaxed font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={handleConnect} disabled={loading} className="btn btn-primary btn-wide mt-2">
                    {loading ? 'Connexion...' : 'Connecter un compte'}
                </button>
            </div>
        );
    }

    if (step === 'SELECT_ACCOUNT') {
        return (
            <div className="max-w-md mx-auto space-y-8">
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-center">Choisissez un compte</h2>
                    <p className="text-gray-500 text-center text-sm">Sélectionnez le compte Google Ads à utiliser</p>
                </div>

                {error && (
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-2xl border-4 border-red-400">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <AlertCircle size={24} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                                    ⚠️ Erreur
                                </h3>
                                <p className="text-red-50 leading-relaxed font-medium text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center p-12 text-gray-500">Recherche des comptes...</div>
                ) : (
                    <div className="grid gap-3">
                        {customers.map((cust, idx) => (
                            <button key={idx} onClick={() => selectCustomer(cust)} className="card p-5 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group text-left">
                                <span className="font-medium text-lg">Compte {cust.split('/')[1]}</span>
                                <ArrowRight className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                            </button>
                        ))}
                    </div>
                )}
                <button onClick={handleLogoutAds} className="btn btn-ghost w-full mt-4">Annuler</button>
            </div>
        );
    }

    // DASHBOARD VIEW
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Vos Campagnes</h1>
                    <p className="text-gray-500 text-sm">Compte: {getLinkedCustomerId()}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => loadCampaigns()} className="btn btn-ghost" title="Actualiser">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleLogoutAds} className="btn btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Déconnecter">
                        <LogOut size={18} />
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
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                ⚠️ Erreur
                            </h3>
                            <p className="text-red-50 leading-relaxed font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="card overflow-hidden bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="p-4">Nom</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-right">Dépenses</th>
                                <th className="p-4 text-right">Impr.</th>
                                <th className="p-4 text-right">Clics</th>
                                <th className="p-4 text-right">CTR</th>
                                <th className="p-4 text-right">CPC Moy.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {campaigns.length > 0 ? campaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-medium">{c.name}</td>
                                    <td className="p-4"><span className={`badge badge-sm ${c.status === 'ENABLED' ? 'badge-success' : 'badge-ghost'}`}>{c.status}</span></td>
                                    <td className="p-4 text-xs text-gray-500">{c.type || 'Inconnu'}</td>
                                    <td className="p-4 text-right font-medium">{c.cost ? c.cost.toFixed(2) + ' €' : '-'}</td>
                                    <td className="p-4 text-right">{c.impressions?.toLocaleString() || '-'}</td>
                                    <td className="p-4 text-right">{c.clicks?.toLocaleString() || '-'}</td>
                                    <td className="p-4 text-right">{c.ctr ? (c.ctr * 100).toFixed(2) + '%' : '-'}</td>
                                    <td className="p-4 text-right">{c.averageCpc ? c.averageCpc.toFixed(2) + ' €' : '-'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Aucune campagne active trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
