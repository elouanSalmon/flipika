import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, ArrowRight, RefreshCw, LogOut } from 'lucide-react';
import ErrorCard from '../components/ErrorCard';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { fetchCampaigns } from '../services/googleAds';

const Dashboard = () => {
    const { t } = useTranslation('dashboard');
    const { linkGoogleAds } = useAuth();
    const { customerId, isConnected, setLinkedCustomerId, accounts, loading: contextLoading } = useGoogleAds(); // Use context accounts
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState<'LOADING' | 'CONNECT' | 'SELECT_ACCOUNT' | 'DASHBOARD'>('LOADING');
    // const [customers, setCustomers] = useState<string[]>([]); // Removed local customers state
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Load Logic
    useEffect(() => {
        const oauthError = searchParams.get('error');
        const oauthMessage = searchParams.get('message');
        const oauthSuccess = searchParams.get('oauth');

        if (oauthError) {
            setError(oauthMessage || t('errors.auth'));
            setStep('CONNECT');
        } else if (oauthSuccess === 'success') {
            // Give Firebase a moment to propagate the write if needed, then check
            setTimeout(() => {
                checkStatus(true);
            }, 1000);
        } else {
            checkStatus();
        }
    }, [searchParams, isConnected, customerId, accounts]);

    const checkStatus = async (forceRefresh = false) => {
        // If connected and has default account, go to dashboard
        if (isConnected && customerId && !forceRefresh) {
            setStep('DASHBOARD');
            loadCampaigns(customerId);
            return;
        }

        // If connected but no default account, show selection if accounts managed by context are present
        if (isConnected && !customerId) {
            if (accounts.length > 0) {
                setStep('SELECT_ACCOUNT');
            } else {
                // Still loading accounts or none found...
                // Context loading should handle brief wait, but if accounts empty after load:
                if (!contextLoading && accounts.length === 0) {
                    setError(t('accountSelector.noAccounts'));
                    setStep('SELECT_ACCOUNT');
                }
            }
            return;
        }

        if (!isConnected && !contextLoading) {
            setStep('CONNECT');
        }
    };

    // loadCustomers is mostly redundant now as context handles fetching. 
    // However, Dashboard logic for "SELECT_ACCOUNT" step needs to map accounts from context.

    const loadCampaigns = async (cid?: string) => {
        const idToUse = cid || customerId;
        if (!idToUse) return;

        setLoading(true);
        setError(null);
        try {
            // @ts-ignore
            const result = await fetchCampaigns(idToUse);
            const response = result as any;
            if (response.campaigns) {
                setCampaigns(response.campaigns);
            }
        } catch (err: any) {
            console.error(err);
            if (err?.message?.includes('invalid_grant') || err?.message?.includes('UNAUTHENTICATED')) {
                setStep('CONNECT');
                setError(t('errors.sessionExpired'));
            } else {
                setError(t('errors.loadingCampaigns'));
            }
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
            setError(t('errors.connectionFailed'));
        } finally {
            setLoading(false);
        }
    };

    const selectCustomer = (id: string) => {
        setLinkedCustomerId(id);
        setStep('DASHBOARD');
        loadCampaigns(id);
    };

    const handleLogoutAds = () => {
        localStorage.removeItem('google_ads_token');
        localStorage.removeItem('google_ads_customer_id');
        setStep('CONNECT');
        localStorage.removeItem('google_ads_token');
        localStorage.removeItem('google_ads_customer_id');
        setStep('CONNECT');
        setCampaigns([]);
        // setCustomers([]); // Removed local customers state
        setError(null);
    };

    if (step === 'LOADING') return (
        <div className="flex items-center justify-center p-12">
            <Spinner size={48} />
        </div>
    );

    if (step === 'CONNECT') {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-8 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-12">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <BarChart3 size={48} className="text-blue-600" />
                </div>
                <div className="max-w-md space-y-3">
                    <h2 className="text-2xl font-bold">{t('connect.title')}</h2>
                    <p className="text-neutral-500">{t('connect.description')}</p>
                </div>

                {error && <ErrorCard title={t('errors.connection')} message={error} />}

                <button onClick={handleConnect} disabled={loading} className="btn btn-primary btn-wide mt-2 flex items-center justify-center gap-2">
                    {loading && <Spinner size={20} className="text-white" />}
                    <span>{loading ? t('connect.connecting') : t('connect.button')}</span>
                </button>
            </div>
        );
    }

    if (step === 'SELECT_ACCOUNT') {
        return (
            <div className="max-w-md mx-auto space-y-8">
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-center">{t('accountSelector.title')}</h2>
                    <p className="text-neutral-500 text-center text-sm">{t('accountSelector.description')}</p>
                </div>

                {error && <ErrorCard message={error} />}

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Spinner size={32} />
                    </div>
                ) : (
                    <div className="grid gap-3">
                        <div className="grid gap-3">
                            {accounts.map((cust) => (
                                <button key={cust.id} onClick={() => selectCustomer(cust.id)} className="card p-5 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group text-left">
                                    <span className="font-medium text-lg">{cust.name} ({cust.id})</span>
                                    <ArrowRight className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={handleLogoutAds} className="btn btn-ghost w-full mt-4">{t('connect.cancel')}</button>
            </div>
        );
    }

    // DASHBOARD VIEW
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">{t('campaigns.title')}</h1>
                    <p className="text-neutral-500 text-sm">{t('accountSelector.accountLabel', { name: accounts.find(a => a.id === customerId)?.name || customerId })}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => loadCampaigns()} className="btn btn-ghost" title={t('campaigns.refresh')}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleLogoutAds} className="btn btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title={t('actions.disconnect')}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {error && <ErrorCard message={error} />}

            <div className="card overflow-hidden bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-700/50 text-left text-xs uppercase tracking-wider text-neutral-500">
                            <tr>
                                <th className="p-4">{t('table.headers.name')}</th>
                                <th className="p-4">{t('table.headers.status')}</th>
                                <th className="p-4">{t('table.headers.type')}</th>
                                <th className="p-4 text-right">{t('table.headers.spend')}</th>
                                <th className="p-4 text-right">{t('table.headers.impressions')}</th>
                                <th className="p-4 text-right">{t('table.headers.clicks')}</th>
                                <th className="p-4 text-right">{t('table.headers.ctr')}</th>
                                <th className="p-4 text-right">{t('table.headers.averageCpc')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                            {campaigns.length > 0 ? campaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                    <td className="p-4 font-medium">{c.name}</td>
                                    <td className="p-4"><span className={`badge badge-sm ${c.status === 'ENABLED' ? 'badge-success' : 'badge-ghost'}`}>{c.status}</span></td>
                                    <td className="p-4 text-xs text-neutral-500">{c.type || t('table.unknown')}</td>
                                    <td className="p-4 text-right font-medium">{c.cost ? c.cost.toFixed(2) + ' €' : '-'}</td>
                                    <td className="p-4 text-right">{c.impressions?.toLocaleString() || '-'}</td>
                                    <td className="p-4 text-right">{c.clicks?.toLocaleString() || '-'}</td>
                                    <td className="p-4 text-right">{c.ctr ? (c.ctr * 100).toFixed(2) + '%' : '-'}</td>
                                    <td className="p-4 text-right">{c.averageCpc ? c.averageCpc.toFixed(2) + ' €' : '-'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={8} className="p-8 text-center text-neutral-500">{t('campaigns.noCampaigns')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
