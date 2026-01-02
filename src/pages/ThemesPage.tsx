import React, { useEffect, useState } from 'react';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import ThemeManager from '../components/themes/ThemeManager';
import dataService from '../services/dataService';
import type { Account } from '../types/business';
import FeatureAccessGuard from '../components/common/FeatureAccessGuard';
import './ThemesPage.css';

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
        <FeatureAccessGuard featureName="les thèmes">
            <div className="themes-page">
                <ThemeManager accounts={accounts} />
            </div>
        </FeatureAccessGuard>
    );
};

export default ThemesPage;
