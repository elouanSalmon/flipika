import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClients } from '../hooks/useClients';
import { ClientList } from '../components/clients/ClientList';
import { ClientForm } from '../components/clients/ClientForm';
import { Plus, Users, Info } from 'lucide-react';
import InfoModal from '../components/common/InfoModal';
import type { Client } from '../types/client';
import './ClientsPage.css';

export default function ClientsPage() {
    const { t } = useTranslation('clients');
    const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

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
                    <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Users size={32} className="header-icon" />
                        <h1>Clients</h1>
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="info-button"
                            style={{
                                padding: '0.5rem',
                                background: 'transparent',
                                border: '2px solid var(--color-border, #e5e7eb)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                color: 'var(--color-text-secondary, #6b7280)'
                            }}
                            title={t('info.buttonLabel')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary, #2563eb)';
                                e.currentTarget.style.color = 'var(--color-primary, #2563eb)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border, #e5e7eb)';
                                e.currentTarget.style.color = 'var(--color-text-secondary, #6b7280)';
                            }}
                        >
                            <Info size={20} />
                        </button>
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

            <InfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title={t('info.modalTitle')}
                content={t('info.modalContent')}
            />
        </div>
    );
}
