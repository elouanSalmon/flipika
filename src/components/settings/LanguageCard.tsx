import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const LanguageCard = () => {
    const { t } = useTranslation('settings');
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-900 dark:text-neutral-200">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                    <Globe size={20} className="text-primary dark:text-primary-light" />
                </div>
                {t('language.title')}
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 bg-white/30 dark:bg-black/30 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-primary/5">
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">{t('language.interfaceLanguage')}</span>
                    <LanguageSwitcher />
                </div>
            </div>
        </motion.div>
    );
};

export default LanguageCard;
