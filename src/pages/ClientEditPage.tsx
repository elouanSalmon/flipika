import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientForm } from '../components/clients/ClientForm';
import { useClients } from '../hooks/useClients';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import type { Client } from '../types/client';
import { motion } from 'framer-motion';

export default function ClientEditPage() {
    const { t } = useTranslation('clients');
    const { id } = useParams();
    const navigate = useNavigate();
    const { clients, createClient, updateClient, isLoading: isLoadingClients } = useClients();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<Client | undefined>(undefined);
    const isEditing = !!id;

    // Load initial data if editing
    useEffect(() => {
        if (isEditing && clients.length > 0) {
            const client = clients.find(c => c.id === id);
            if (client) {
                setInitialData(client);
            } else if (!isLoadingClients) {
                // Client not found
                navigate('/app/clients');
            }
        }
    }, [id, clients, isEditing, isLoadingClients, navigate]);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (isEditing && id) {
                await updateClient(id, data);
            } else {
                await createClient(data);
            }
            navigate('/app/clients');
        } catch (e) {
            // Toast handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isEditing && !initialData && isLoadingClients) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 md:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-10"
            >
                <button
                    onClick={() => navigate('/app/clients')}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" />
                    {t('form.buttons.cancel')}
                </button>

                <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                        {isEditing ? (
                            <Users className="w-8 h-8 text-primary dark:text-primary-light" />
                        ) : (
                            <UserPlus className="w-8 h-8 text-primary dark:text-primary-light" />
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {isEditing ? t('form.title.edit') : t('form.title.create')}
                    </h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg ml-1">
                    {isEditing ? t('form.sections.basicInfoDescription') : t('form.sections.basicInfoDescription')}
                </p>
            </motion.div>

            <ClientForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/app/clients')}
                isLoading={isSubmitting}
            />
        </div>
    );
}
