import React from 'react';
import type { Client } from '../../types/client';
import { ClientCard } from './ClientCard';
import { useTranslation } from 'react-i18next';
import EmptyState from '../common/EmptyState';
import { Users } from 'lucide-react';

interface ClientListProps {
    clients: Client[];
    isLoading: boolean;
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
    onAdd: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
    clients,
    isLoading,
    onEdit,
    onDelete,
    onAdd
}) => {
    const { t } = useTranslation('clients');

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 animate-pulse h-[88px]">
                        <div className="flex items-center gap-4 h-full">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <EmptyState
                    icon={<Users size={48} className="text-gray-300 dark:text-gray-600" />}
                    title={t('emptyState.title', { defaultValue: 'Aucun compte' })}
                    message={t('emptyState.message', { defaultValue: "Vous n'avez pas encore ajouté de compte. Créez-en un pour commencer." })}
                    action={{
                        label: t('emptyState.action', { defaultValue: 'Ajouter un compte' }),
                        onClick: onAdd
                    }}
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
                <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
