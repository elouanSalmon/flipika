import { useState } from 'react';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { initiateGoogleAdsOAuth } from '../../services/googleAds';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ConfirmationModal from '../common/ConfirmationModal';
import Spinner from '../common/Spinner';

const ConnectionsCard = () => {
    // accounts is now provided by useGoogleAds
    const { isConnected, refreshConnectionStatus, disconnect, customerId, setLinkedCustomerId, accounts } = useGoogleAds();
    const { currentUser, loginWithGoogle } = useAuth();
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Removed local useEffect for loading accounts as context handles it

    const handleConnectGoogleAds = async () => {
        setIsConnecting(true);
        try {
            await initiateGoogleAdsOAuth();
            toast.success('Connexion à Google Ads initiée');
            refreshConnectionStatus();
        } catch (error) {
            console.error('Error connecting Google Ads:', error);
            toast.error('Erreur lors de la connexion à Google Ads');
            setIsConnecting(false);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            await loginWithGoogle();
            toast.success('Compte Google connecté avec succès');
        } catch (error) {
            console.error('Error connecting Google:', error);
            toast.error('Erreur lors de la connexion Google');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                    <svg className="w-5 h-5 text-primary dark:text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                Connexions
            </h2>

            <div className="space-y-6">
                {/* Google Account */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 shadow-lg shadow-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-primary/20">
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
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Compte Google</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {currentUser ? currentUser.email : 'Non connecté'}
                            </p>
                            {currentUser && (
                                <p className="text-xs text-primary dark:text-primary-light mt-1">
                                    Méthode d'authentification principale
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentUser ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                Connecté
                            </span>
                        ) : (
                            <>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                    Non connecté
                                </span>
                                <button
                                    onClick={handleConnectGoogle}
                                    className="btn btn-primary btn-sm"
                                >
                                    Connecter
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 shadow-lg shadow-primary/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-primary/20">
                                <img src="/google-ads.svg" alt="Google Ads" className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Google Ads</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Connectez votre compte publicitaire
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                {isConnected ? 'Connecté' : 'Non connecté'}
                            </span>
                            {isConnected ? (
                                <button
                                    onClick={() => setShowDisconnectModal(true)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Déconnecter
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnectGoogleAds}
                                    disabled={isConnecting}
                                    className="btn btn-primary btn-sm flex items-center gap-2"
                                >
                                    {isConnecting && <Spinner size={16} className="text-white" />}
                                    <span>{isConnecting ? 'Connexion...' : 'Connecter'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {isConnected && (
                        <div className="mt-4 border-t border-primary/20 dark:border-primary/30 pt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Compte par défaut
                            </label>
                            <div className="relative">
                                <select
                                    value={customerId || ''}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setLinkedCustomerId(newValue || null);
                                        if (newValue) {
                                            toast.success('Compte par défaut mis à jour');
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 border-2 border-primary/30 dark:border-primary/40 rounded-xl bg-white/10 dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-primary/40 dark:hover:border-primary/50"
                                >
                                    <option value="">-- Sélectionner un compte --</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name} ({account.id})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 dark:text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Ce compte sera utilisé par défaut dans le tableau de bord.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDisconnectModal}
                onClose={() => setShowDisconnectModal(false)}
                onConfirm={async () => {
                    try {
                        await disconnect();
                        toast.success('Compte Google Ads déconnecté');
                    } catch (error) {
                        console.error('Error disconnecting:', error);
                        toast.error('Erreur lors de la déconnexion');
                    }
                }}
                title="Déconnecter Google Ads"
                message="Voulez-vous vraiment déconnecter votre compte Google Ads ? Vous ne pourrez plus générer de rapports."
                confirmLabel="Déconnecter"
                isDestructive={true}
            />
        </motion.div >
    );
};

export default ConnectionsCard;
