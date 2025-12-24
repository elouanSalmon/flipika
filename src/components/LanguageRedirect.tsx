import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageRedirect = ({ targetLanguage }: { targetLanguage: 'en' | 'fr' }) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    useEffect(() => {
        // Change the language and wait for it to complete
        const changeLanguageAndRedirect = async () => {
            try {
                // Change language (this will update localStorage automatically via i18next-browser-languagedetector)
                await i18n.changeLanguage(targetLanguage);

                // Small delay to ensure localStorage is written
                await new Promise(resolve => setTimeout(resolve, 100));

                // Redirect to home
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Error changing language:', error);
                // Redirect anyway
                navigate('/', { replace: true });
            }
        };

        changeLanguageAndRedirect();
    }, [targetLanguage, i18n, navigate]);

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
};

export default LanguageRedirect;
