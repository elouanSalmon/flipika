import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClients } from '../hooks/useClients';
import { ClientList } from '../components/clients/ClientList';
import { Plus, Users, Info } from 'lucide-react';
import InfoModal from '../components/common/InfoModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import type { Client } from '../types/client';
import './ClientsPage.css';

export default function ClientsPage() {
    const { t } = useTranslation('clients');
    const navigate = useNavigate();
    const { clients, isLoading, deleteClient } = useClients();
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Deletion Modal State
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const handleAdd = () => {
        navigate('/app/clients/new');
    };

    const handleEdit = (client: Client) => {
        navigate(`/app/clients/${client.id}`);
    };

    const handleDeleteRequest = (client: Client) => {
        setClientToDelete(client);
    };

    const handleConfirmDelete = async () => {
        if (clientToDelete) {
            await deleteClient(clientToDelete);
            setClientToDelete(null);
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
                onDelete={handleDeleteRequest}
                onAdd={handleAdd}
            />

            <InfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title={t('info.modalTitle')}
                content={t('info.modalContent')}
            />

            <ConfirmationModal
                isOpen={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={t('delete.title', { defaultValue: 'Supprimer le client' })}
                message={t('delete.message', {
                    name: clientToDelete?.name,
                    defaultValue: `Êtes-vous sûr de vouloir supprimer le client "${clientToDelete?.name}" ? Cette action est irréversible.`
                })}
                confirmLabel={t('delete.confirm', { defaultValue: 'Supprimer' })}
                cancelLabel={t('delete.cancel', { defaultValue: 'Annuler' })}
                isDestructive={true}
            />
        </div>
    );
}

