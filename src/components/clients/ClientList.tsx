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
    viewMode?: 'grid' | 'list';
}

export const ClientList: React.FC<ClientListProps> = ({
    clients,
    isLoading,
    onEdit,
    onDelete,
    onAdd,
    viewMode = 'grid'
}) => {
    const { t } = useTranslation('clients');

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-black rounded-xl p-4 border border-neutral-100 dark:border-white/10 animate-pulse h-[88px]">
                        <div className="flex items-center gap-4 h-full">
                            <div className="w-12 h-12 bg-neutral-200 dark:bg-black rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-neutral-200 dark:bg-black rounded w-1/2"></div>
                                <div className="h-3 bg-neutral-200 dark:bg-black rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="bg-white dark:bg-black rounded-xl border border-neutral-100 dark:border-white/10">
                <EmptyState
                    icon={<Users size={48} className="text-neutral-300 dark:text-neutral-600" />}
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
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
            {clients.map((client) => (
                <div key={client.id}>
                    {viewMode === 'list' ? (
                        /* Simple wrapper for list view - relying on ClientCard's internal flexibility or just wrapping it */
                        /* ClientCard is designed as a card. For list view we might want to pass viewMode to it if we want distinct styling inside */
                        <ClientCard
                            client={client}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ) : (
                        <ClientCard
                            client={client}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
