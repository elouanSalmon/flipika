import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, AlertCircle, Search, Grid, List as ListIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import type { ScheduledReport } from '../types/scheduledReportTypes';
import type { ReportTemplate } from '../types/templateTypes';
import {
    listUserScheduledReports,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleScheduleStatus,
} from '../services/scheduledReportService';
import { listUserTemplates } from '../services/templateService';
import { fetchCampaigns } from '../services/googleAds';
import liveDataService from '../services/liveDataService';
import ScheduleCard from '../components/schedules/ScheduleCard';
import FeatureAccessGuard from '../components/common/FeatureAccessGuard';
import ScheduleConfigModal, { type ScheduleFormData } from '../components/schedules/ScheduleConfigModal';
import FilterBar from '../components/common/FilterBar';
import type { Campaign } from '../types/business';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import './ScheduledReports.css';

const ITEMS_PER_PAGE = 9;

interface GoogleAdsAccount {
    id: string;
    name: string;
}

type StatusFilter = 'all' | 'active' | 'paused';

const ScheduledReports: React.FC = () => {
    const { t } = useTranslation('schedules');
    const { currentUser } = useAuth();
    const { isConnected: isGoogleAdsConnected } = useGoogleAds();
    const { canAccess } = useSubscription();
    const { isDemoMode } = useDemoMode();

    const hasAccess = (canAccess && isGoogleAdsConnected) || isDemoMode;

    const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [googleAuthError, setGoogleAuthError] = useState(false);
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | undefined>();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<ScheduledReport | null>(null);

    // Filters
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [filteredSchedules, setFilteredSchedules] = useState<ScheduledReport[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser, isGoogleAdsConnected]);

    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        } else {
            setCampaigns([]);
            setSelectedCampaignId('');
        }
    }, [selectedAccountId]);

    useEffect(() => {
        filterSchedules();
        setCurrentPage(1); // Reset page on filter change
    }, [schedules, selectedAccountId, selectedCampaignId, searchQuery, statusFilter]);

    const loadData = async () => {
        if (!currentUser) return;

        setLoading(true);
        setGoogleAuthError(false);
        try {
            // Load essential data first
            const [schedulesData, templatesData] = await Promise.all([
                listUserScheduledReports(currentUser.uid),
                listUserTemplates(currentUser.uid),
            ]);

            setSchedules(schedulesData);
            setTemplates(templatesData);

            // Load Google Ads accounts separately
            if (isGoogleAdsConnected) {
                try {
                    const accounts = await liveDataService.getAccounts();
                    if (accounts && accounts.length > 0) {
                        const accountsList = accounts.map(account => ({
                            id: account.id,
                            name: account.name,
                        }));
                        setAccounts(accountsList);
                    } else {
                        setAccounts([]);
                    }
                } catch (err) {
                    console.error('Error fetching Google Ads accounts:', err);
                    setAccounts([]);
                }
            } else {
                setAccounts([]);
            }

        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error(t('errors.loadingData'));
        } finally {
            setLoading(false);
        }
    };

    const loadCampaigns = async (accountId: string) => {
        try {
            setLoadingCampaigns(true);
            const response = await fetchCampaigns(accountId);
            if (response.success && response.campaigns) {
                setCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            setCampaigns([]);
        } finally {
            setLoadingCampaigns(false);
        }
    };

    const filterSchedules = () => {
        let filtered = [...schedules];

        // Filter by Account
        if (selectedAccountId) {
            filtered = filtered.filter(s => s.accountId === selectedAccountId);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query)
            );
        }

        // Filter by Status
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            filtered = filtered.filter(s => s.isActive === isActive);
        }

        setFilteredSchedules(filtered);
    };

    const handleCreateSchedule = () => {
        setEditingSchedule(undefined);
        setIsModalOpen(true);
    };

    const handleEditSchedule = (schedule: ScheduledReport) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleSaveSchedule = async (data: ScheduleFormData) => {
        if (!currentUser) return;

        try {
            // Find the selected template to get its account ID
            const selectedTemplate = templates.find(t => t.id === data.templateId);
            if (!selectedTemplate?.accountId) {
                toast.error(t('errors.noAccount'));
                return;
            }

            if (editingSchedule) {
                // Update existing schedule
                await updateScheduledReport(editingSchedule.id, {
                    name: data.name,
                    description: data.description,
                    templateId: data.templateId,
                    accountId: selectedTemplate.accountId, // Use template's account ID
                    scheduleConfig: data.scheduleConfig,
                });
                toast.success(t('toast.updated'));
            } else {
                // Create new schedule
                await createScheduledReport(currentUser.uid, {
                    name: data.name,
                    description: data.description,
                    templateId: data.templateId,
                    accountId: selectedTemplate.accountId, // Use template's account ID
                    scheduleConfig: data.scheduleConfig,
                });
                toast.success(t('toast.created'));
            }

            setIsModalOpen(false);
            setEditingSchedule(undefined);
            await loadData();
        } catch (error: any) {
            console.error('Error saving schedule:', error);
            toast.error(error.message || t('errors.saving'));
        }
    };

    const handleDeleteSchedule = (schedule: ScheduledReport) => {
        setScheduleToDelete(schedule);
        setDeleteModalOpen(true);
    };

    const confirmDeleteSchedule = async () => {
        if (!scheduleToDelete) return;

        try {
            await deleteScheduledReport(scheduleToDelete.id);
            toast.success(t('toast.deleted'));
            setScheduleToDelete(null);
            await loadData();
        } catch (error: any) {
            console.error('Error deleting schedule:', error);
            toast.error(t('errors.deleting'));
        }
    };

    const handleToggleStatus = async (schedule: ScheduledReport, isActive: boolean) => {
        try {
            await toggleScheduleStatus(schedule.id, isActive);
            toast.success(isActive ? t('toast.activated') : t('toast.paused'));
            await loadData();
        } catch (error: any) {
            console.error('Error toggling schedule status:', error);
            toast.error(t('errors.toggleStatus'));
        }
    };

    const getTemplateName = (templateId: string): string => {
        return templates.find(t => t.id === templateId)?.name || t('unknownTemplate');
    };

    const getAccountName = (accountId: string): string => {
        return accounts.find(a => a.id === accountId)?.name || t('unknownAccount');
    };

    const activeCount = schedules.filter(s => s.isActive).length;
    const pausedCount = schedules.filter(s => !s.isActive).length;

    // We don't need activeSchedules/pausedSchedules split like before, as we use filteredSchedules directly.
    // However, keeping them if needed for other logic, but based on line 447 usage, we iterate filteredSchedules.
    // The previous implementation used them to show separate sections. 
    // Now we show a unified list. So I will remove them to clean up.

    if (loading) {
        return (
            <div className="scheduled-reports-loading">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="scheduled-reports-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-title-row">
                        <Clock size={32} className="header-icon" />
                        <h1>{t('title')}</h1>
                        <button
                            className="btn-create"
                            onClick={handleCreateSchedule}
                            disabled={!hasAccess || templates.length === 0}
                            style={{
                                opacity: (!hasAccess || templates.length === 0) ? 0.5 : 1,
                                cursor: (!hasAccess || templates.length === 0) ? 'not-allowed' : 'pointer',
                                marginLeft: 'auto'
                            }}
                            title={!hasAccess ? t('connectToCreate') : templates.length === 0 ? t('createTemplateFirst') : ''}
                        >
                            <Plus size={20} />
                            <span>{t('newSchedule')}</span>
                        </button>
                    </div>
                    <p className="header-subtitle">
                        {t('description')}
                    </p>
                </div>
            </div>




            <FeatureAccessGuard featureName={t('featureName')}>
                {/* Status Filters - Only show if there are schedules */
                    schedules.length > 0 && (
                        <div className="status-filters">
                            <button
                                className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                {t('tabs.all', { count: schedules.length })}
                            </button>
                            <button
                                className={`status-filter-btn filter-active ${statusFilter === 'active' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('active')}
                            >
                                <div className="status-dot" />
                                {t('tabs.active', { count: activeCount })}
                            </button>
                            <button
                                className={`status-filter-btn filter-paused ${statusFilter === 'paused' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('paused')}
                            >
                                <div className="status-dot" />
                                {t('tabs.paused', { count: pausedCount })}
                            </button>
                        </div>
                    )}

                {isGoogleAdsConnected && (
                    <div className="mb-6">
                        <FilterBar
                            accounts={accounts}
                            selectedAccountId={selectedAccountId}
                            onAccountChange={setSelectedAccountId}
                            campaigns={campaigns}
                            selectedCampaignId={selectedCampaignId}
                            onCampaignChange={setSelectedCampaignId}
                            loadingCampaigns={loadingCampaigns}
                        />
                    </div>
                )}

                {
                    /* Controls Bar - Always visible if there are schedules */
                    (schedules.length > 0 || searchQuery) && (
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
                    )
                }

                {googleAuthError && isGoogleAdsConnected && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{t('errors.connectionRequired')}</h3>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                {t('errors.sessionExpiredText')}
                                <a href="/app/settings" className="underline ml-1 font-medium hover:text-red-900 dark:hover:text-red-200">
                                    {t('errors.reconnect')}
                                </a>
                            </p>
                        </div>
                    </div>
                )}

                {templates.length === 0 && (
                    <div className="empty-state warning">
                        <AlertCircle size={48} />
                        <h3>{t('emptyState.noTemplates.title')}</h3>
                        <p>
                            {t('emptyState.noTemplates.description')}
                        </p>
                        <a href="/app/templates" className="btn-link">
                            {t('emptyState.noTemplates.action')}
                        </a>
                    </div>
                )}

                {templates.length > 0 && schedules.length === 0 && (
                    <div className="empty-state">
                        <Clock size={64} />
                        <h3>{t('emptyState.noSchedules.title')}</h3>
                        <p>{t('emptyState.noSchedules.description')}</p>
                        <button
                            className="btn-primary"
                            onClick={handleCreateSchedule}
                            disabled={!hasAccess}
                            style={{
                                opacity: !hasAccess ? 0.5 : 1,
                                cursor: !hasAccess ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Plus size={20} />
                            <span>{t('emptyState.noSchedules.action')}</span>
                        </button>
                    </div>
                )}

                {schedules.length > 0 && (
                    <>
                        {/* Only show section titles if showing ALL, otherwise the filter effectively selects one group */}
                        <div className={viewMode === 'grid' ? 'schedules-grid' : 'schedules-list'}>
                            {filteredSchedules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((schedule) => (
                                <ScheduleCard
                                    key={schedule.id}
                                    schedule={schedule}
                                    templateName={getTemplateName(schedule.templateId)}
                                    accountName={getAccountName(schedule.accountId)}
                                    onEdit={handleEditSchedule}
                                    onDelete={handleDeleteSchedule}
                                    onToggleStatus={handleToggleStatus}
                                    isGoogleAdsConnected={isGoogleAdsConnected}
                                />
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE)}
                            onPageChange={setCurrentPage}
                            totalItems={filteredSchedules.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    </>
                )}

                <ScheduleConfigModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSchedule(undefined);
                    }}
                    onSave={handleSaveSchedule}
                    templates={templates}
                    accounts={accounts}
                    editingSchedule={editingSchedule}
                />

                <ConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setScheduleToDelete(null);
                    }}
                    onConfirm={confirmDeleteSchedule}
                    title={t('deleteConfirm.title')}
                    message={t('deleteConfirm.message', { name: scheduleToDelete?.name })}
                    confirmLabel={t('deleteConfirm.confirm')}
                    isDestructive={true}
                />
            </FeatureAccessGuard>
        </div >
    );
};

export default ScheduledReports;
