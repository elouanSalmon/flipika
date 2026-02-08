import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const NotFound = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { t: tSeo } = useTranslation('seo');
    const { currentUser } = useAuth();
    const isConnected = !!currentUser;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
            <SEO
                title={tSeo('notFound.title')}
                description={tSeo('notFound.description')}
                noIndex={true}
            />
            {/* Background Gradients using CSS variables */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div style={{ position: 'absolute', top: '25%', left: '25%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'var(--gradient-primary)', opacity: 0.1, filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'var(--color-secondary)', opacity: 0.1, filter: 'blur(100px)' }} />
            </div>

            <div className="container relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-[120px] md:text-[150px] font-bold leading-none gradient-text select-none">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <h2 className="text-3xl font-bold text-primary">{t('common:notFound.title')}</h2>
                    <p className="text-secondary max-w-md mx-auto text-lg">
                        {t('common:notFound.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-secondary gap-2"
                        >
                            <ArrowLeft size={18} />
                            {t('common:notFound.backButton')}
                        </button>
                        {isConnected ? (
                            <button
                                onClick={() => navigate('/app/clients')}
                                className="btn btn-primary gap-2"
                            >
                                <Users size={18} />
                                {t('common:appNavigation.clients')}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(i18n.language === 'fr' ? '/fr' : '/')}
                                className="btn btn-primary gap-2"
                            >
                                <Home size={18} />
                                {t('common:notFound.homeButton')}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
