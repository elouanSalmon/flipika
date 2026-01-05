import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProfileCard from '../components/settings/ProfileCard';
import SecurityCard from '../components/settings/SecurityCard';
import ConnectionsCard from '../components/settings/ConnectionsCard';
import SubscriptionCard from '../components/settings/SubscriptionCard';
import DemoModeCard from '../components/settings/DemoModeCard';
import AppearanceCard from '../components/settings/AppearanceCard';
import ThemesCard from '../components/settings/ThemesCard';
import LanguageCard from '../components/settings/LanguageCard';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

const Settings = () => {
    const { t } = useTranslation('settings');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { syncBilling } = useSubscription();

    useEffect(() => {
        const fromStripePortal = searchParams.get('from');

        if (fromStripePortal === 'stripe-portal') {
            // User returned from Stripe Customer Portal, sync billing data
            syncBilling().catch(err => {
                console.error('Error syncing billing after portal:', err);
            });
            // Remove query param
            searchParams.delete('from');
            navigate({ search: searchParams.toString() }, { replace: true });
        }
    }, [searchParams, syncBilling, navigate]);

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <SettingsIcon className="w-8 h-8 text-[var(--color-primary)]" />
                    <h1 className="text-[2rem] font-bold text-primary">
                        {t('title')}
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                    {t('description')}
                </p>
            </motion.div>

            <div className="space-y-6">
                {/* Profile Section */}
                <ProfileCard />

                {/* Security Section */}
                <SecurityCard />

                {/* Subscription & Billing */}
                <SubscriptionCard />

                {/* Google Ads Connection */}
                <ConnectionsCard />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Appearance */}
                    <AppearanceCard />

                    {/* Language */}
                    <LanguageCard />

                    {/* Demo Mode */}
                    <DemoModeCard />
                </div>

                {/* Report Themes */}
                <ThemesCard />
            </div>
        </div>
    );
};

export default Settings;
