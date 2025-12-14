
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '../../contexts/DemoModeContext';

const EmptyDashboardState = () => {
    const navigate = useNavigate();
    const { toggleDemoMode } = useDemoMode();

    const handleConnectGoogleAds = () => {
        navigate('/app/settings');
    };

    const handleEnableDemoMode = () => {
        toggleDemoMode();
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                {/* Glassmorphism Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 shadow-2xl p-12">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 text-center space-y-6">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-12 h-12 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Aucun compte connecté
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">
                            Connectez votre compte Google Ads pour visualiser vos données ou activez le mode démo pour explorer l'application.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            {/* Primary Button - Connect Google Ads */}
                            <button
                                onClick={handleConnectGoogleAds}
                                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Connecter Google Ads
                                </span>
                            </button>

                            {/* Secondary Button - Demo Mode */}
                            <button
                                onClick={handleEnableDemoMode}
                                className="px-8 py-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 text-gray-700 dark:text-gray-200 font-semibold hover:bg-white/70 dark:hover:bg-gray-800/70 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 shadow-md"
                            >
                                Activer le mode démo
                            </button>
                        </div>

                        {/* Info Text */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">
                            Le mode démo vous permet d'explorer toutes les fonctionnalités avec des données fictives
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyDashboardState;
