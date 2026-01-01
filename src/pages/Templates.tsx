import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileStack, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { fetchAccessibleCustomers, fetchCampaigns } from '../services/googleAds';
import GoogleAdsGuard from '../components/common/GoogleAdsGuard';
import {
    listUserTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,

    createReportFromTemplate,
} from '../services/templateService';
import { getSchedulesByTemplateId, deleteScheduledReport } from '../services/scheduledReportService';
import type { ReportTemplate } from '../types/templateTypes';
import type { Campaign } from '../types/business';
import type { ScheduledReport } from '../types/scheduledReportTypes';
import TemplateCard from '../components/templates/TemplateCard';
import TemplateConfigModal, { type TemplateConfig } from '../components/templates/TemplateConfigModal';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import AccountSelectionModal from '../components/templates/AccountSelectionModal';
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
    const [deleteMessage, setDeleteMessage] = useState('');
    const [schedulesToDelete, setSchedulesToDelete] = useState<ScheduledReport[]>([]);

    // State for account selection modal (for legacy templates or overrides)
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [pendingTemplateForUse, setPendingTemplateForUse] = useState<ReportTemplate | null>(null);

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

    const handleDeleteTemplate = async (template: ReportTemplate) => {
        const loadingToast = toast.loading('Vérification...', { id: 'check-usage' });
        try {
            const schedules = await getSchedulesByTemplateId(template.id);
            toast.dismiss(loadingToast);

            setSchedulesToDelete(schedules);

            if (schedules.length > 0) {
                const activeCount = schedules.filter(s => s.isActive).length;
                const limit = 3;
                const scheduleNames = schedules.slice(0, limit).map(s => s.name).join(', ');
                const remaining = schedules.length - limit;
                const suffix = remaining > 0 ? ` et ${remaining} autres` : '';

                setDeleteMessage(
                    `Ce template est utilisé par ${schedules.length} programmation(s)${activeCount > 0 ? ` (dont ${activeCount} actives)` : ''} : ${scheduleNames}${suffix}.\n\n` +
                    `Si vous supprimez ce template, CES PROGRAMMATIONS SERONT ÉGALEMENT SUPPRIMÉES.\n\n` +
                    `Êtes-vous sûr de vouloir continuer ?`
                );
            } else {
                setDeleteMessage(`Êtes-vous sûr de vouloir supprimer le template "${template.name}" ? Cette action est irréversible.`);
            }

            setTemplateToDelete(template);
            setIsDeleteModalOpen(true);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error checking template usage:', error);
            toast.error('Erreur lors de la vérification des dépendances');
        }
    };

    const confirmDeleteTemplate = async () => {
        if (!templateToDelete) return;

        try {
            // Delete associated schedules first
            if (schedulesToDelete.length > 0) {
                const deletePromises = schedulesToDelete.map(schedule =>
                    deleteScheduledReport(schedule.id)
                );
                await Promise.all(deletePromises);
            }

            console.log('Attempting to delete template:', templateToDelete.id);
            await deleteTemplate(templateToDelete.id);

            const successMessage = schedulesToDelete.length > 0
                ? 'Template et programmations associées supprimés'
                : 'Template supprimé';
            toast.success(successMessage);

            setTemplateToDelete(null);
            setSchedulesToDelete([]);
            loadTemplates();
        } catch (error: any) {
            console.error('Error deleting template:', error);
            console.error('Error details:', {
                message: error?.message,
                code: error?.code,
                stack: error?.stack
            });
            toast.error(`Erreur lors de la suppression: ${error?.message || 'Erreur inconnue'}`);
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
            // New logic: Check if template has account and campaigns
            if (template.accountId && template.campaignIds && template.campaignIds.length > 0) {
                // Have everything, create report directly
                const reportId = await createReportFromTemplate(template.id, currentUser.uid);
                toast.success('Rapport créé depuis le template !');
                navigate(`/app/reports/${reportId}`);
            } else {
                // Missing info (legacy template?), prompt for account
                setPendingTemplateForUse(template);
                if (accounts.length > 0) {
                    // Auto-select first if available or keep empty logic in modal
                }
                setShowAccountModal(true);
            }
        } catch (error) {
            console.error('Error using template:', error);
            toast.error('Erreur lors de la création du rapport');
        }
    };

    const handleAccountSelectionParams = async (accountId: string) => {
        if (!currentUser || !pendingTemplateForUse) return;

        try {
            const reportId = await createReportFromTemplate(pendingTemplateForUse.id, currentUser.uid, {
                accountId,
            });
            toast.success('Rapport créé depuis le template !');
            navigate(`/app/reports/${reportId}`);
        } catch (error) {
            console.error('Error creating report from selection:', error);
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
                <button
                    className="btn-primary"
                    onClick={() => setShowCreateModal(true)}
                    disabled={!isConnected}
                    style={{
                        opacity: !isConnected ? 0.5 : 1,
                        cursor: !isConnected ? 'not-allowed' : 'pointer'
                    }}
                    title={!isConnected ? 'Connectez Google Ads pour créer des templates' : ''}
                >
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


            <GoogleAdsGuard mode="partial" feature="créer des templates">
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
                                isGoogleAdsConnected={isConnected}
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
                            <button
                                className="btn-primary"
                                onClick={() => setShowCreateModal(true)}
                                disabled={!isConnected}
                                style={{
                                    opacity: !isConnected ? 0.5 : 1,
                                    cursor: !isConnected ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <Plus size={20} />
                                <span>Créer un template</span>
                            </button>
                        )}
                    </div>
                )}
            </GoogleAdsGuard>

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
                message={deleteMessage}
                confirmLabel="Supprimer"
                isDestructive={true}
            />

            <AccountSelectionModal
                isOpen={showAccountModal}
                onClose={() => {
                    setShowAccountModal(false);
                    setPendingTemplateForUse(null);
                }}
                onConfirm={handleAccountSelectionParams}
                accounts={accounts}
                title="Sélectionner un compte"
                message={`Ce template ne spécifie pas de compte Google Ads.\nVeuillez en sélectionner un pour générer le rapport.`}
                confirmLabel="Générer le rapport"
            />
        </div>
    );
};

export default Templates;
