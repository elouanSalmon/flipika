import React from 'react';
import type { Client } from '../../types/client';
import { Edit, Trash2 } from 'lucide-react';

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                {/* Logo or Placeholder */}
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                    {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-xl font-bold text-gray-400 dark:text-gray-500">
                            {client.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={client.name}>
                        {client.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={client.email}>
                        {client.email}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pl-4">
                <button
                    onClick={() => onEdit(client)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Modifier"
                    aria-label="Modifier le client"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => onDelete(client)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Supprimer"
                    aria-label="Supprimer le client"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
