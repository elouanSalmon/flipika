import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import ThemeManager from '../components/themes/ThemeManager';
import InfoModal from '../components/common/InfoModal';
import dataService from '../services/dataService';
import type { Account } from '../types/business';
import './ThemesPage.css';

const ThemesPage: React.FC = () => {
    const { t } = useTranslation('themes');
    const { isConnected } = useGoogleAds();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [showInfoModal, setShowInfoModal] = useState(false);

    useEffect(() => {
        if (isConnected) {
            loadAccounts();
        }
    }, [isConnected]);

    const loadAccounts = async () => {
        try {
            const data = await dataService.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    return (
        <div className="themes-page">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div className="header-content">
                    <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1>{t('list.pageTitle')}</h1>
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="info-button"
                            style={{
                                padding: '0.5rem',
                                background: 'transparent',
                                border: '2px solid var(--color-border, #e5e7eb)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                color: 'var(--color-text-secondary, #6b7280)'
                            }}
                            title={t('info.buttonLabel')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary, #2563eb)';
                                e.currentTarget.style.color = 'var(--color-primary, #2563eb)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border, #e5e7eb)';
                                e.currentTarget.style.color = 'var(--color-text-secondary, #6b7280)';
                            }}
                        >
                            <Info size={20} />
                        </button>
                    </div>
                    <p className="header-subtitle">{t('list.pageSubtitle')}</p>
                </div>
            </div>
            <ThemeManager accounts={accounts} />

            <InfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title={t('info.modalTitle')}
                content={t('info.modalContent')}
            />
        </div>
    );
};

export default ThemesPage;
