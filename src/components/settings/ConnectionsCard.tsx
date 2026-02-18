import { useState } from 'react';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { SiMeta } from 'react-icons/si';
import { useMetaAds } from '../../contexts/MetaAdsContext';
import { initiateGoogleAdsOAuth } from '../../services/googleAds';
import { initiateMetaAdsOAuth } from '../../services/metaAds';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ConfirmationModal from '../common/ConfirmationModal';
import Spinner from '../common/Spinner';
import { useTranslation } from 'react-i18next';

const ConnectionsCard = () => {
    const { t } = useTranslation('settings');
    const { isConnected, refreshConnectionStatus, disconnect, customerId, setLinkedCustomerId, accounts } = useGoogleAds();
    const {
        isConnected: isMetaConnected,
        disconnect: disconnectMeta,
        tokenExpiresAt,
        isTokenExpired,
        refreshAccounts: refreshMetaAccounts,
    } = useMetaAds();
    const { currentUser, loginWithGoogle } = useAuth();
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [showMetaDisconnectModal, setShowMetaDisconnectModal] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMetaConnecting, setIsMetaConnecting] = useState(false);

    const handleConnectGoogleAds = async () => {
        setIsConnecting(true);
        try {
            await initiateGoogleAdsOAuth();
            toast.success(t('connections.toast.googleAdsInitiated'));
            refreshConnectionStatus();
        } catch (error) {
            console.error('Error connecting Google Ads:', error);
            toast.error(t('connections.toast.googleAdsError'));
            setIsConnecting(false);
        }
    };

    const handleConnectMetaAds = async () => {
        setIsMetaConnecting(true);
        try {
            await initiateMetaAdsOAuth();
            toast.success(t('connections.toast.metaAdsInitiated'));
            refreshMetaAccounts();
        } catch (error) {
            console.error('Error connecting Meta Ads:', error);
            toast.error(t('connections.toast.metaAdsError'));
            setIsMetaConnecting(false);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            await loginWithGoogle();
            toast.success(t('connections.toast.googleConnected'));
        } catch (error) {
            console.error('Error connecting Google:', error);
            toast.error(t('connections.toast.googleError'));
        }
    };

    const formatExpiryDate = (date: Date | null): string => {
        if (!date) return '';
        return date.toLocaleDateString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-900 dark:text-neutral-200">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                    <svg className="w-5 h-5 text-primary dark:text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                {t('connections.title')}
            </h2>

            <div className="space-y-6">
                {/* Google Account */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 bg-white/30 dark:bg-black/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/5 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 shadow-lg shadow-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center border-2 border-primary/20">
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-200">{t('connections.google.title')}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {currentUser ? currentUser.email : t('connections.google.notConnected')}
                            </p>
                            {currentUser && (
                                <p className="text-xs text-primary dark:text-primary-light mt-1">
                                    {t('connections.google.primaryAuth')}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentUser ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                {t('connections.status.connected')}
                            </span>
                        ) : (
                            <>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-black text-neutral-600 dark:text-neutral-400">
                                    {t('connections.status.notConnected')}
                                </span>
                                <button
                                    onClick={handleConnectGoogle}
                                    className="btn btn-primary btn-sm"
                                >
                                    {t('connections.actions.connect')}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Google Ads */}
                <div className="flex flex-col gap-4 p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 bg-white/30 dark:bg-black/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/5 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 shadow-lg shadow-primary/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center border-2 border-primary/20">
                                <img src="/google-ads.svg" alt="Google Ads" className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-200">{t('connections.googleAds.title')}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('connections.googleAds.description')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-neutral-100 dark:bg-black text-neutral-600 dark:text-neutral-400'
                                }`}>
                                {isConnected ? t('connections.status.connected') : t('connections.status.notConnected')}
                            </span>
                            {isConnected ? (
                                <button
                                    onClick={() => setShowDisconnectModal(true)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    {t('connections.actions.disconnect')}
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnectGoogleAds}
                                    disabled={isConnecting}
                                    className="btn btn-primary btn-sm flex items-center gap-2"
                                >
                                    {isConnecting && <Spinner size={16} className="text-white" />}
                                    <span>{isConnecting ? t('connections.actions.connecting') : t('connections.actions.connect')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {isConnected && (
                        <div className="mt-4 border-t border-primary/20 dark:border-primary/30 pt-4">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                {t('connections.googleAds.defaultAccount')}
                            </label>
                            <div className="relative">
                                <select
                                    value={customerId || ''}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setLinkedCustomerId(newValue || null);
                                        if (newValue) {
                                            toast.success(t('connections.toast.defaultAccountUpdated'));
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 border-2 border-primary/30 dark:border-primary/40 rounded-xl bg-white/10 dark:bg-white/5 text-neutral-900 dark:text-neutral-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-primary/40 dark:hover:border-primary/50"
                                >
                                    <option value="">{t('connections.googleAds.selectAccount')}</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name} ({account.id})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                {t('connections.googleAds.defaultAccountHelp')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Meta Ads */}
                <div className="relative flex flex-col gap-4 p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 bg-white/30 dark:bg-black/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/5 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 shadow-lg shadow-primary/5">
                    {import.meta.env.PROD && (
                        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">Coming Soon</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center border-2 border-primary/20">
                                <SiMeta className="w-7 h-7 text-[#0668E1]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-200">{t('connections.metaAds.title')}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('connections.metaAds.description')}
                                </p>
                                {isMetaConnected && tokenExpiresAt && (
                                    <p className={`text-xs mt-1 ${isTokenExpired ? 'text-red-500' : 'text-primary dark:text-primary-light'}`}>
                                        {isTokenExpired
                                            ? t('connections.metaAds.tokenExpired')
                                            : t('connections.metaAds.tokenExpiry', { date: formatExpiryDate(tokenExpiresAt) })
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isMetaConnected && !isTokenExpired
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : isMetaConnected && isTokenExpired
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                    : 'bg-neutral-100 dark:bg-black text-neutral-600 dark:text-neutral-400'
                                }`}>
                                {isMetaConnected && !isTokenExpired
                                    ? t('connections.status.connected')
                                    : isMetaConnected && isTokenExpired
                                        ? t('connections.metaAds.tokenExpired')
                                        : t('connections.status.notConnected')
                                }
                            </span>
                            {isMetaConnected ? (
                                <div className="flex items-center gap-2">
                                    {isTokenExpired && (
                                        <button
                                            onClick={handleConnectMetaAds}
                                            disabled={isMetaConnecting}
                                            className="btn btn-primary btn-sm flex items-center gap-2"
                                        >
                                            {isMetaConnecting && <Spinner size={16} className="text-white" />}
                                            <span>{isMetaConnecting ? t('connections.actions.connecting') : t('connections.actions.connect')}</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowMetaDisconnectModal(true)}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        {t('connections.actions.disconnect')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleConnectMetaAds}
                                    disabled={isMetaConnecting}
                                    className="btn btn-primary btn-sm flex items-center gap-2"
                                >
                                    {isMetaConnecting && <Spinner size={16} className="text-white" />}
                                    <span>{isMetaConnecting ? t('connections.actions.connecting') : t('connections.actions.connect')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Google Ads Disconnect Modal */}
            <ConfirmationModal
                isOpen={showDisconnectModal}
                onClose={() => setShowDisconnectModal(false)}
                onConfirm={async () => {
                    try {
                        await disconnect();
                        toast.success(t('connections.toast.googleAdsDisconnected'));
                    } catch (error) {
                        console.error('Error disconnecting:', error);
                        toast.error(t('connections.toast.disconnectError'));
                    }
                }}
                title={t('connections.modal.disconnectTitle')}
                message={t('connections.modal.disconnectMessage')}
                confirmLabel={t('connections.modal.disconnectConfirm')}
                isDestructive={true}
            />

            {/* Meta Ads Disconnect Modal */}
            <ConfirmationModal
                isOpen={showMetaDisconnectModal}
                onClose={() => setShowMetaDisconnectModal(false)}
                onConfirm={async () => {
                    try {
                        await disconnectMeta();
                        toast.success(t('connections.toast.metaAdsDisconnected'));
                    } catch (error) {
                        console.error('Error disconnecting Meta:', error);
                        toast.error(t('connections.toast.metaDisconnectError'));
                    }
                }}
                title={t('connections.metaModal.disconnectTitle')}
                message={t('connections.metaModal.disconnectMessage')}
                confirmLabel={t('connections.metaModal.disconnectConfirm')}
                isDestructive={true}
            />
        </motion.div>
    );
};

export default ConnectionsCard;
