import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Grid, List as ListIcon, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import FeatureAccessGuard from '../components/common/FeatureAccessGuard';
import { listUserReports, getReportCountByStatus } from '../services/reportService';
import { fetchCampaigns } from '../services/googleAds';

import type { EditableReport } from '../types/reportTypes';
import type { Campaign } from '../types/business';
import ReportCard from '../components/reports/ReportCard/ReportCard';
import FilterBar from '../components/common/FilterBar';
import Spinner from '../components/common/Spinner';
import './ReportsList.css';

import Pagination from '../components/common/Pagination';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

const ITEMS_PER_PAGE = 9;

const ReportsList: React.FC = () => {
    const { t } = useTranslation('reports');
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { isConnected: isGoogleAdsConnected, accounts } = useGoogleAds();
    const { canAccess } = useSubscription();
    const { isDemoMode } = useDemoMode();

    const hasAccess = (canAccess && isGoogleAdsConnected) || isDemoMode;

    const [reports, setReports] = useState<EditableReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<EditableReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusCounts, setStatusCounts] = useState({ draft: 0, published: 0, archived: 0 });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Filters
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    const loadReports = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const userReports = await listUserReports(currentUser.uid);
            setReports(userReports);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStatusCounts = async () => {
        if (!currentUser) return;

        try {
            const counts = await getReportCountByStatus(currentUser.uid);
            setStatusCounts(counts);
        } catch (error) {
            console.error('Error loading status counts:', error);
        }
    };

    // loadAccounts removed - managed by GoogleAdsContext

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

    const filterReports = () => {
        let filtered = [...reports];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.accountId.toLowerCase().includes(query)
            );
        }

        // Filter by Account
        if (selectedAccountId) {
            filtered = filtered.filter(r => r.accountId === selectedAccountId);
        }

        // Filter by Campaign
        if (selectedCampaignId) {
            filtered = filtered.filter(r =>
                r.campaignIds && r.campaignIds.includes(selectedCampaignId)
            );
        }

        setFilteredReports(filtered);
    };

    // UseEffect for loading accounts removed

    useEffect(() => {
        if (currentUser) {
            loadReports();
            loadStatusCounts();
        }
    }, [currentUser]);

    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        } else {
            setCampaigns([]);
            setSelectedCampaignId('');
        }
    }, [selectedAccountId]);

    useEffect(() => {
        filterReports();
        setCurrentPage(1); // Reset to first page when filtering
    }, [reports, statusFilter, searchQuery, selectedAccountId, selectedCampaignId]);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

    const handleCreateReport = () => {
        navigate('/app/reports/new');
    };

    const handleReportClick = (reportId: string) => {
        navigate(`/app/reports/${reportId}`);
    };

    const handleReportDeleted = () => {
        loadReports();
        loadStatusCounts();
    };

    if (loading) {
        return (
            <div className="reports-list-page">
                <div className="loading-container">
                    <Spinner size={48} />
                    <div className="loading-text">{t('list.loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-list-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-title-row">
                        <FileText size={32} className="header-icon" />
                        <h1>{t('list.title')}</h1>
                    </div>
                    <p className="subtitle">{t('list.description')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="create-report-btn-secondary bg-white dark:bg-slate-800 text-primary border-primary/20 hover:border-primary hover:bg-primary/5 shadow-sm"
                        onClick={() => navigate('/app/templates')}
                        disabled={!hasAccess}
                        style={{
                            opacity: !hasAccess ? 0.5 : 1,
                            cursor: !hasAccess ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {t('list.createFromTemplate')}
                    </button>
                    <button
                        className="create-report-btn"
                        onClick={handleCreateReport}
                        disabled={!hasAccess}
                        style={{
                            opacity: !hasAccess ? 0.5 : 1,
                            cursor: !hasAccess ? 'not-allowed' : 'pointer'
                        }}
                        title={!hasAccess ? t('list.connectToCreate') : ''}
                    >
                        <Plus size={20} />
                        <span>{t('list.newReport')}</span>
                    </button>
                </div>
            </div>

            {/* Status Filters */}
            <FeatureAccessGuard featureName="les rapports">
                <div className="status-filters">
                    <button
                        className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        {t('list.tabs.all', { count: reports.length })}
                    </button>
                    <button
                        className={`status-filter-btn filter-draft ${statusFilter === 'draft' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('draft')}
                    >
                        <div className="status-dot" />
                        {t('list.tabs.drafts', { count: statusCounts.draft })}
                    </button>
                    <button
                        className={`status-filter-btn filter-published ${statusFilter === 'published' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('published')}
                    >
                        <div className="status-dot" />
                        {t('list.tabs.published', { count: statusCounts.published })}
                    </button>
                    <button
                        className={`status-filter-btn filter-archived ${statusFilter === 'archived' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('archived')}
                    >
                        <div className="status-dot" />
                        {t('list.tabs.archived', { count: statusCounts.archived })}
                    </button>
                </div>

                {/* Filters - Always show if connected */}
                {isGoogleAdsConnected && (
                    <FilterBar
                        accounts={accounts}
                        campaigns={campaigns}
                        selectedAccountId={selectedAccountId}
                        selectedCampaignId={selectedCampaignId}
                        onAccountChange={setSelectedAccountId}
                        onCampaignChange={setSelectedCampaignId}
                        loadingCampaigns={loadingCampaigns}
                    />
                )}

                {/* Search and View Controls */}
                <div className="controls-bar">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={t('list.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title={t('list.gridView')}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title={t('list.listView')}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>

                {/* Reports Grid/List */}
                {
                    filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <FileText size={64} strokeWidth={1.5} />
                            </div>
                            <h3>{t('list.emptyState.noReports')}</h3>
                            <p>
                                {searchQuery
                                    ? t('list.emptyState.trySearch')
                                    : t('list.emptyState.createFirst')}
                            </p>
                            {!searchQuery && (
                                <button
                                    className="create-report-btn"
                                    onClick={handleCreateReport}
                                    disabled={!isGoogleAdsConnected}
                                    style={{
                                        opacity: !isGoogleAdsConnected ? 0.5 : 1,
                                        cursor: !isGoogleAdsConnected ? 'not-allowed' : 'pointer'
                                    }}
                                    title={!isGoogleAdsConnected ? t('list.connectToCreate') : ''}
                                >
                                    {t('list.emptyState.createButton')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={`reports-${viewMode}`}>
                                {currentReports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        viewMode={viewMode}
                                        onClick={() => handleReportClick(report.id)}
                                        onDeleted={handleReportDeleted}
                                        accounts={accounts}
                                    />
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredReports.length / ITEMS_PER_PAGE)}
                                onPageChange={setCurrentPage}
                                totalItems={filteredReports.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </>
                    )
                }
            </FeatureAccessGuard>
        </div>
    );
};

export default ReportsList;
