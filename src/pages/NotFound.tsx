import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import SimpleHeader from '../components/SimpleHeader';
import Footer from '../components/Footer';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] overflow-hidden flex flex-col">
            <SimpleHeader />

            {/* Spacer for fixed header */}
            <div className="h-20"></div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
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
                        <h2 className="text-3xl font-bold text-primary">Page introuvable</h2>
                        <p className="text-secondary max-w-md mx-auto text-lg">
                            Oups ! La page que vous recherchez semble avoir disparu dans le cyberespace.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="btn btn-secondary gap-2"
                            >
                                <ArrowLeft size={18} />
                                Retour
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-primary gap-2"
                            >
                                <Home size={18} />
                                Accueil
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default NotFound;
