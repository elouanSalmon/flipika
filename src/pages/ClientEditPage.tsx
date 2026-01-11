import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientForm } from '../components/clients/ClientForm';
import { useClients } from '../hooks/useClients';
import { ArrowLeft } from 'lucide-react';
import type { Client } from '../types/client';

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
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/app/clients')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('form.buttons.cancel')}
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? t('form.title.edit') : t('form.title.create')}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <ClientForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/app/clients')}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
}
