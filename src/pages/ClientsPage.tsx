import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import { ClientList } from '../components/clients/ClientList';
import { ClientForm } from '../components/clients/ClientForm';
import { Plus, Users } from 'lucide-react';
import type { Client } from '../types/client';
import './ClientsPage.css';

export default function ClientsPage() {
    const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = () => {
        setEditingClient(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(undefined);
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingClient) {
                await updateClient(editingClient.id, data);
            } else {
                await createClient(data);
            }
            closeModal();
        } catch (e) {
            // Toast handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="clients-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-title-row">
                        <Users size={32} className="header-icon" />
                        <h1>Clients</h1>
                    </div>
                    <p className="header-subtitle">Gérez votre portefeuille client</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="create-btn"
                >
                    <Plus size={20} />
                    Nouveau Client
                </button>
            </div>

            <ClientList
                clients={clients}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={deleteClient}
                onAdd={handleAdd}
            />

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {editingClient ? 'Modifier le client' : 'Nouveau client'}
                        </h2>
                        <ClientForm
                            initialData={editingClient}
                            onSubmit={handleSubmit}
                            onCancel={closeModal}
                            isLoading={isSubmitting}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
