import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { initiateGoogleAdsOAuth } from '../../services/googleAds';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ConnectionsCard = () => {
    const { isConnected, refreshConnectionStatus } = useGoogleAds();
    const { currentUser, loginWithGoogle, logout } = useAuth();

    const handleConnectGoogleAds = async () => {
        try {
            await initiateGoogleAdsOAuth();
            toast.success('Connexion à Google Ads initiée');
            refreshConnectionStatus();
        } catch (error) {
            console.error('Error connecting Google Ads:', error);
            toast.error('Erreur lors de la connexion à Google Ads');
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

    const handleDisconnectGoogle = async () => {
        try {
            await logout();
            toast.success('Compte Google déconnecté');
        } catch (error) {
            console.error('Error disconnecting Google:', error);
            toast.error('Erreur lors de la déconnexion');
        }
    };

    return (
        <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6">Connexions</h2>

            <div className="space-y-6">
                {/* Google Account */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
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
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Compte Google</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {currentUser ? currentUser.email : 'Non connecté'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentUser
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                            {currentUser ? 'Connecté' : 'Non connecté'}
                        </span>
                        {currentUser ? (
                            <button
                                onClick={handleDisconnectGoogle}
                                className="btn btn-ghost btn-sm"
                            >
                                Déconnecter
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectGoogle}
                                className="btn btn-primary btn-sm"
                            >
                                Connecter
                            </button>
                        )}
                    </div>
                </div>

                {/* Google Ads */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                            <img src="/google-ads.svg" alt="Google Ads" className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Google Ads</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
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
                                onClick={() => {
                                    if (confirm('Voulez-vous vraiment déconnecter votre compte Google Ads ?')) {
                                        localStorage.removeItem('googleAdsConnected');
                                        localStorage.removeItem('linkedCustomerId');
                                        refreshConnectionStatus();
                                        toast.success('Compte Google Ads déconnecté');
                                    }
                                }}
                                className="btn btn-ghost btn-sm"
                            >
                                Déconnecter
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectGoogleAds}
                                className="btn btn-primary btn-sm"
                            >
                                Connecter
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionsCard;
