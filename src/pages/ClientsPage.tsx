import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClients } from '../hooks/useClients';
import { ClientList } from '../components/clients/ClientList';
import { Plus, Users, Info, Grid, List as ListIcon } from 'lucide-react';
import InfoModal from '../components/common/InfoModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import type { Client } from '../types/client';
import './ClientsPage.css';

export default function ClientsPage() {
    const { t } = useTranslation('clients');
    const navigate = useNavigate();
    const { clients, isLoading, deleteClient } = useClients();
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
                        <h1>{t('list.title')}</h1>
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
                    <p className="header-subtitle">{t('list.subtitle')}</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="create-btn"
                >
                    <Plus size={20} />
                    {t('list.createButton')}
                </button>
            </div>

            {/* Controls Bar with View Toggle */}
            <div className="flex justify-end mb-6">
                <div className="view-controls flex gap-2">
                    <button
                        className={`p-2.5 rounded-lg border-2 transition-all ${viewMode === 'grid'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-primary hover:text-primary'
                            }`}
                        onClick={() => setViewMode('grid')}
                        title={t('gridView', { defaultValue: 'Vue grille' })}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        className={`p-2.5 rounded-lg border-2 transition-all ${viewMode === 'list'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-primary hover:text-primary'
                            }`}
                        onClick={() => setViewMode('list')}
                        title={t('listView', { defaultValue: 'Vue liste' })}
                    >
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>

            <ClientList
                clients={clients}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onAdd={handleAdd}
                viewMode={viewMode}
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
                title={t('delete.title', { defaultValue: 'Supprimer le compte' })}
                message={t('delete.message', {
                    name: clientToDelete?.name,
                    defaultValue: `Êtes-vous sûr de vouloir supprimer le compte "${clientToDelete?.name}" ? Cette action est irréversible.`
                })}
                confirmLabel={t('delete.confirm', { defaultValue: 'Supprimer' })}
                cancelLabel={t('delete.cancel', { defaultValue: 'Annuler' })}
                isDestructive={true}
            />
        </div>
    );
}

