import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

interface PublicLayoutProps {
    lang?: 'en' | 'fr' | 'es';
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ lang }) => {
    const { i18n } = useTranslation();

    useEffect(() => {
        if (lang && i18n.language !== lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n]);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
            <SimpleHeader />

            {/* Spacer for fixed header */}
            <div className="h-20"></div>

            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default PublicLayout;
