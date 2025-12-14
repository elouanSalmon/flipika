import ProfileCard from '../components/settings/ProfileCard';
import SecurityCard from '../components/settings/SecurityCard';
import ConnectionsCard from '../components/settings/ConnectionsCard';
import DemoModeCard from '../components/settings/DemoModeCard';
import AppearanceCard from '../components/settings/AppearanceCard';
import { motion } from 'framer-motion';

const Settings = () => {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Paramètres
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                    Gérez votre compte et vos préférences
                </p>
            </motion.div>

            <div className="space-y-6">
                {/* Profile Section */}
                <ProfileCard />

                {/* Security Section */}
                <SecurityCard />

                {/* Google Ads Connection */}
                <ConnectionsCard />

                {/* Preferences Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Demo Mode */}
                    <DemoModeCard />

                    {/* Appearance */}
                    <AppearanceCard />
                </div>
            </div>
        </div>
    );
};

export default Settings;
