import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, FileStack, Search, AlertCircle, Grid, List as ListIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { fetchCampaigns } from '../services/googleAds';
import FeatureAccessGuard from '../components/common/FeatureAccessGuard';
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
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import './Templates.css';

const ITEMS_PER_PAGE = 9;


const Templates: React.FC = () => {
    const { t } = useTranslation('templates');
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { isConnected, accounts } = useGoogleAds();
    const { canAccess } = useSubscription();
    const { isDemoMode } = useDemoMode();

    const hasAccess = (canAccess && isConnected) || isDemoMode;

    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
    // Removed local accounts state
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    // Removed googleAuthError state, as context handles connection status conceptually.
    // If we want to show specific auth errors, we might need error state in context.
    const [googleAuthError] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<ReportTemplate | null>(null);

    const [schedulesToDelete, setSchedulesToDelete] = useState<ScheduledReport[]>([]);
    const [deleteMessage, setDeleteMessage] = useState('');

    // Filters
    const [selectedFilterAccountId, setSelectedFilterAccountId] = useState<string>('');
    const [selectedFilterCampaignId, setSelectedFilterCampaignId] = useState<string>('');
    const [filterCampaigns, setFilterCampaigns] = useState<Campaign[]>([]);
    const [loadingFilterCampaigns, setLoadingFilterCampaigns] = useState(false);
    const [filteredTemplatesList, setFilteredTemplatesList] = useState<ReportTemplate[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // State for account selection modal (for legacy templates or overrides)
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [pendingTemplateForUse, setPendingTemplateForUse] = useState<ReportTemplate | null>(null);

    const loadTemplates = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const userTemplates = await listUserTemplates(currentUser.uid);
            setTemplates(userTemplates);
        } catch (error) {
            console.error('Error loading templates:', error);
            toast.error(t('errors.loadingTemplates'));
        } finally {
            setLoading(false);
        }
    };

    // Removed loadAccounts()

    // Default selection effect
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accounts, selectedAccountId]);

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

    const loadFilterCampaigns = async (accountId: string) => {
        try {
            setLoadingFilterCampaigns(true);
            const response = await fetchCampaigns(accountId);
            if (response.success && response.campaigns) {
                setFilterCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
            }
        } catch (error) {
            console.error('Error loading filter campaigns:', error);
            setFilterCampaigns([]);
        } finally {
            setLoadingFilterCampaigns(false);
        }
    };

    const filterTemplates = () => {
        let filtered = [...templates];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
            );
        }

        // Filter by Account
        if (selectedFilterAccountId) {
            filtered = filtered.filter(t => t.accountId === selectedFilterAccountId);
        }

        // Filter by Campaign
        if (selectedFilterCampaignId) {
            filtered = filtered.filter(t =>
                t.campaignIds && t.campaignIds.includes(selectedFilterCampaignId)
            );
        }

        setFilteredTemplatesList(filtered);
    };

    useEffect(() => {
        if (currentUser) {
            loadTemplates();
        }
    }, [currentUser]);

    // UseEffect for loadAccounts removed

    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        }
    }, [selectedAccountId]);

    useEffect(() => {
        if (selectedFilterAccountId) {
            loadFilterCampaigns(selectedFilterAccountId);
        } else {
            setFilterCampaigns([]);
            setSelectedFilterCampaignId('');
        }
    }, [selectedFilterAccountId]);

    useEffect(() => {
        filterTemplates();
        setCurrentPage(1); // Reset page on filter change
    }, [templates, searchQuery, selectedFilterAccountId, selectedFilterCampaignId]);



    const handleCreateTemplate = async (config: TemplateConfig) => {
        if (!currentUser) return;

        try {
            await createTemplate(currentUser.uid, config);
            toast.success(t('toast.created'));
            setShowCreateModal(false);
            loadTemplates();
        } catch (error) {
            console.error('Error creating template:', error);
            toast.error(t('toast.createError'));
        }
    };

    const handleEditTemplate = async (config: TemplateConfig) => {
        if (!currentUser || !editingTemplate) return;

        try {
            await updateTemplate(editingTemplate.id, config);
            toast.success(t('toast.updated'));
            setEditingTemplate(null);
            loadTemplates();
        } catch (error) {
            console.error('Error updating template:', error);
            toast.error(t('toast.updateError'));
        }
    };

    const handleDeleteTemplate = async (template: ReportTemplate) => {
        const loadingToast = toast.loading(t('deleteConfirm.checking'), { id: 'check-usage' });
        try {
            const schedules = await getSchedulesByTemplateId(template.id);
            toast.dismiss(loadingToast);

            setSchedulesToDelete(schedules);

            if (schedules.length > 0) {
                const activeCount = schedules.filter(s => s.isActive).length;
                const limit = 3;
                const scheduleNames = schedules.slice(0, limit).map(s => s.name).join(', ');
                const remaining = schedules.length - limit;
                const suffix = remaining > 0 ? t('deleteConfirm.andOthers', { count: remaining }) : '';

                setDeleteMessage(
                    t('deleteConfirm.withSchedules', {
                        count: schedules.length,
                        activeInfo: activeCount > 0 ? t('deleteConfirm.activeCount', { count: activeCount }) : '',
                        scheduleNames,
                        suffix
                    })
                );
            } else {
                setDeleteMessage(t('deleteConfirm.message', { name: template.name }));
            }

            setTemplateToDelete(template);
            setIsDeleteModalOpen(true);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error checking template usage:', error);
            toast.error(t('errors.checkingUsage'));
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
                ? t('toast.deletedWithSchedules')
                : t('toast.deleted');
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
            toast.error(t('errors.deleting', { message: error?.message || t('errors.unknown') }));
        }
    };

    const handleDuplicateTemplate = async (template: ReportTemplate) => {
        if (!currentUser) return;

        try {
            await duplicateTemplate(template.id, currentUser.uid);
            toast.success(t('toast.duplicated'));
            loadTemplates();
        } catch (error) {
            console.error('Error duplicating template:', error);
            toast.error(t('toast.duplicateError'));
        }
    };

    const handleUseTemplate = async (template: ReportTemplate) => {
        if (!currentUser) return;

        try {
            // Priority 1: Template has explicit account
            if (template.accountId) {
                const reportId = await createReportFromTemplate(template.id, currentUser.uid);
                toast.success(t('toast.reportCreated'));
                navigate(`/app/reports/${reportId}`);
                return;
            }

            // Priority 2: Account selected in filter bar
            if (selectedFilterAccountId) {
                const accountName = accounts.find(a => a.id === selectedFilterAccountId)?.name;
                const reportId = await createReportFromTemplate(template.id, currentUser.uid, {
                    accountId: selectedFilterAccountId,
                    accountName: accountName,
                    // If template had no account, it likely has no valid campaigns for this new account
                    // so we don't pass campaigns unless we want to try to keep ids (risky across accounts)
                    campaignIds: [],
                    campaignNames: []
                });
                toast.success(t('toast.reportCreated'));
                navigate(`/app/reports/${reportId}`);
                return;
            }

            // Priority 3: Prompt user
            setPendingTemplateForUse(template);
            setShowAccountModal(true);
        } catch (error) {
            console.error('Error using template:', error);
            toast.error(t('errors.creatingReport'));
        }
    };

    const handleAccountSelectionParams = async (accountId: string) => {
        if (!currentUser || !pendingTemplateForUse) return;

        try {
            const reportId = await createReportFromTemplate(pendingTemplateForUse.id, currentUser.uid, {
                accountId,
                accountName: accounts.find(a => a.id === accountId)?.name,
            });
            toast.success(t('toast.reportCreated'));
            navigate(`/app/reports/${reportId}`);
        } catch (error) {
            console.error('Error creating report from selection:', error);
            toast.error(t('errors.creatingReport'));
        }
    };

    const filteredTemplates = filteredTemplatesList;

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
                        <h1>{t('title')}</h1>
                    </div>
                    <p>{t('description')}</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowCreateModal(true)}
                    disabled={!hasAccess}
                    style={{
                        opacity: !hasAccess ? 0.5 : 1,
                        cursor: !hasAccess ? 'not-allowed' : 'pointer'
                    }}
                    title={!hasAccess ? t('connectToCreate') : ''}
                >
                    <Plus size={20} />
                    <span>{t('newTemplate')}</span>
                </button>
            </div>

            <FeatureAccessGuard featureName={t('featureName')}>
                {googleAuthError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{t('errors.connectionRequired')}</h3>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                {t('errors.sessionExpired')}
                                <a href="/app/settings" className="underline ml-1 font-medium hover:text-red-900 dark:hover:text-red-200">
                                    {t('errors.reconnect')}
                                </a>
                            </p>
                        </div>
                    </div>
                )}

                {/* Controls Bar - Always visible if there are templates */
                    templates.length > 0 && (
                        <div className="controls-bar">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder={t('searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="view-controls">
                                <button
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title={t('gridView')}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title={t('listView')}
                                >
                                    <ListIcon size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                {isConnected && (
                    <div className="mb-6">
                        <FilterBar
                            accounts={accounts}
                            campaigns={filterCampaigns}
                            selectedAccountId={selectedFilterAccountId}
                            selectedCampaignId={selectedFilterCampaignId}
                            onAccountChange={setSelectedFilterAccountId}
                            onCampaignChange={setSelectedFilterCampaignId}
                            loadingCampaigns={loadingFilterCampaigns}
                        />
                    </div>
                )}


                {/* Redundant search bar removed here - using controls bar above */}
                {filteredTemplates.length > 0 ? (
                    <>
                        <div className={viewMode === 'grid' ? 'templates-grid' : 'templates-list'}>
                            {filteredTemplates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(template => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onUse={handleUseTemplate}
                                    onEdit={setEditingTemplate}
                                    onDuplicate={handleDuplicateTemplate}
                                    onDelete={handleDeleteTemplate}
                                    isGoogleAdsConnected={isConnected}
                                    accounts={accounts}
                                />
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE)}
                            onPageChange={setCurrentPage}
                            totalItems={filteredTemplates.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    </>
                ) : (
                    <div className="empty-state">
                        <FileStack size={64} className="empty-icon" />
                        <h2>{t('emptyState.noTemplates')}</h2>
                        <p>
                            {searchQuery
                                ? t('emptyState.noResults')
                                : t('emptyState.createFirst')}
                        </p>
                        {!searchQuery && (
                            <button
                                className="btn-primary"
                                onClick={() => setShowCreateModal(true)}
                                disabled={!hasAccess}
                                style={{
                                    opacity: !hasAccess ? 0.5 : 1,
                                    cursor: !hasAccess ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {t('emptyState.createButton')}
                            </button>
                        )}
                    </div>
                )}
            </FeatureAccessGuard>

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
                title={t('deleteConfirm.title')}
                message={deleteMessage}
                confirmLabel={t('deleteConfirm.confirm')}
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
                title={t('accountSelector.title')}
                message={t('accountSelector.message')}
                confirmLabel={t('accountSelector.confirm')}
            />
        </div>
    );
};

export default Templates;
