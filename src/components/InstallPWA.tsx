import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInstallDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Don't show if user previously dismissed
        if (isInstallDismissed) {
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            setShowInstallButton(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowInstallButton(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setShowInstallButton(false);
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstallButton(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't render if app is installed or install button shouldn't be shown
    if (isInstalled || !showInstallButton) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Fermer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Download className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 pr-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            Installer Flipika
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Accédez à Flipika comme une application native, sans barre d'URL.
                        </p>

                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Installer maintenant
                        </button>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Accès rapide depuis votre bureau ou écran d'accueil
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Expérience plein écran sans distractions
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Chargement plus rapide des pages
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
