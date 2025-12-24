import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageRedirect = ({ targetLanguage }: { targetLanguage: 'en' | 'fr' }) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    useEffect(() => {
        // Change the language
        i18n.changeLanguage(targetLanguage);
        // Redirect to home
        navigate('/', { replace: true });
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
