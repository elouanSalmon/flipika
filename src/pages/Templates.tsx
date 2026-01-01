import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileStack, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { fetchAccessibleCustomers, fetchCampaigns } from '../services/googleAds';
import {
    listUserTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createReportFromTemplate,
} from '../services/templateService';
import type { ReportTemplate } from '../types/templateTypes';
import type { Campaign } from '../types/business';
import TemplateCard from '../components/templates/TemplateCard';
import TemplateConfigModal, { type TemplateConfig } from '../components/templates/TemplateConfigModal';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import './Templates.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

const Templates: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { isConnected } = useGoogleAds();

    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [googleAuthError, setGoogleAuthError] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<ReportTemplate | null>(null);

    useEffect(() => {
        if (currentUser) {
            loadTemplates();
        }
    }, [currentUser]);

    useEffect(() => {
        if (isConnected) {
            loadAccounts();
        }
    }, [isConnected]);

    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        }
    }, [selectedAccountId]);

    const loadTemplates = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const userTemplates = await listUserTemplates(currentUser.uid);
            setTemplates(userTemplates);
        } catch (error) {
            console.error('Error loading templates:', error);
            toast.error('Erreur lors du chargement des templates');
        } finally {
            setLoading(false);
        }
    };

    const loadAccounts = async () => {
        try {
            setGoogleAuthError(false);
            const response = await fetchAccessibleCustomers();
            if (response.success && response.customers) {
                const accountsList = response.customers.map((customer: any) => ({
                    id: customer.id,
                    name: customer.descriptiveName || customer.id,
                }));
                setAccounts(accountsList);
                if (accountsList.length > 0) {
                    setSelectedAccountId(accountsList[0].id);
                }
            } else if (response.error && (
                response.error.includes('invalid_grant') ||
                response.error.includes('UNAUTHENTICATED')
            )) {
                setGoogleAuthError(true);
                toast.error('Session Google Ads expirée');
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    const loadCampaigns = async (accountId: string) => {
        try {
            const response = await fetchCampaigns(accountId);
            if (response.success && response.campaigns) {
                setCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            setCampaigns([]);
        }
    };

    const handleCreateTemplate = async (config: TemplateConfig) => {
        if (!currentUser) return;

        try {
            await createTemplate(currentUser.uid, config);
            toast.success('Template créé avec succès !');
            setShowCreateModal(false);
            loadTemplates();
        } catch (error) {
            console.error('Error creating template:', error);
            toast.error('Erreur lors de la création du template');
        }
    };

    const handleEditTemplate = async (config: TemplateConfig) => {
        if (!currentUser || !editingTemplate) return;

        try {
            await updateTemplate(editingTemplate.id, config);
            toast.success('Template mis à jour !');
            setEditingTemplate(null);
            loadTemplates();
        } catch (error) {
            console.error('Error updating template:', error);
            toast.error('Erreur lors de la mise à jour du template');
        }
    };

    const handleDeleteTemplate = (template: ReportTemplate) => {
        setTemplateToDelete(template);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!templateToDelete) return;

        try {
            console.log('Attempting to delete template:', templateToDelete.id);
            await deleteTemplate(templateToDelete.id);
            toast.success('Template supprimé');
            setTemplateToDelete(null);
            loadTemplates();
        } catch (error: any) {
            console.error('Error deleting template:', error);
            console.error('Error details:', {
                message: error?.message,
                code: error?.code,
                stack: error?.stack
            });
            toast.error(`Erreur lors de la suppression du template: ${error?.message || 'Erreur inconnue'}`);
        }
    };

    const handleDuplicateTemplate = async (template: ReportTemplate) => {
        if (!currentUser) return;

        try {
            await duplicateTemplate(template.id, currentUser.uid);
            toast.success('Template dupliqué !');
            loadTemplates();
        } catch (error) {
            console.error('Error duplicating template:', error);
            toast.error('Erreur lors de la duplication du template');
        }
    };

    const handleUseTemplate = async (template: ReportTemplate) => {
        if (!currentUser) return;

        try {
            // If template has no account, prompt user to select one
            if (!template.accountId && accounts.length > 0) {
                const accountId = prompt('Sélectionnez un compte Google Ads (ID):');
                if (!accountId) return;

                const reportId = await createReportFromTemplate(template.id, currentUser.uid, {
                    accountId,
                });
                toast.success('Rapport créé depuis le template !');
                navigate(`/app/reports/${reportId}`);
            } else {
                const reportId = await createReportFromTemplate(template.id, currentUser.uid);
                toast.success('Rapport créé depuis le template !');
                navigate(`/app/reports/${reportId}`);
            }
        } catch (error) {
            console.error('Error using template:', error);
            toast.error('Erreur lors de la création du rapport');
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="templates-page loading">
                <Spinner size={48} />
            </div>
        );
    }

    return (
        <div className="templates-page">
            <div className="templates-header">
                <div className="header-content">
                    <div className="header-title-row">
                        <FileStack size={32} className="header-icon" />
                        <h1>Templates de Rapports</h1>
                    </div>
                    <p>Créez des templates réutilisables pour générer des rapports en un clic</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={20} />
                    <span>Nouveau Template</span>
                </button>
            </div>

            {googleAuthError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connexion Google Ads requise</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Impossible de récupérer vos comptes Google Ads. La session a probablement expiré.
                            <a href="/app/settings" className="underline ml-1 font-medium hover:text-red-900 dark:hover:text-red-200">
                                Reconnecter le compte
                            </a>
                        </p>
                    </div>
                </div>
            )}

            {templates.length > 0 && (
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un template..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {filteredTemplates.length > 0 ? (
                <div className="templates-grid">
                    {filteredTemplates.map(template => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onUse={handleUseTemplate}
                            onEdit={setEditingTemplate}
                            onDuplicate={handleDuplicateTemplate}
                            onDelete={handleDeleteTemplate}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FileStack size={64} className="empty-icon" />
                    <h2>Aucun template</h2>
                    <p>
                        {searchQuery
                            ? 'Aucun template ne correspond à votre recherche'
                            : 'Créez votre premier template pour générer des rapports rapidement'}
                    </p>
                    {!searchQuery && (
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={20} />
                            <span>Créer un template</span>
                        </button>
                    )}
                </div>
            )}

            {(showCreateModal || editingTemplate) && (
                <TemplateConfigModal
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTemplate(null);
                    }}
                    onSubmit={editingTemplate ? handleEditTemplate : handleCreateTemplate}
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onAccountChange={setSelectedAccountId}
                    campaigns={campaigns}
                    isEditMode={!!editingTemplate}
                    initialConfig={editingTemplate || undefined}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTemplateToDelete(null);
                }}
                onConfirm={confirmDeleteTemplate}
                title="Supprimer le template"
                message={`Êtes-vous sûr de vouloir supprimer le template "${templateToDelete?.name}" ? Cette action est irréversible.`}
                confirmLabel="Supprimer"
                isDestructive={true}
            />
        </div>
    );
};

export default Templates;
