import React, { useEffect, useState } from 'react';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import ThemeManager from '../components/themes/ThemeManager';
import dataService from '../services/dataService';
import type { Account } from '../types/business';

const ThemesPage: React.FC = () => {
    const { isConnected } = useGoogleAds();
    const [accounts, setAccounts] = useState<Account[]>([]);

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
        <div className="themes-page" style={{
            minHeight: 'calc(100vh - 80px)',
            padding: '2rem 1rem',
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
            }}>
                {/* Theme Manager Component */}
                <ThemeManager accounts={accounts} />
            </div>
        </div>
    );
};

export default ThemesPage;
