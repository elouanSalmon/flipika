import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List as ListIcon, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import FeatureAccessGuard from '../components/common/FeatureAccessGuard';
import { listUserReports, getReportCountByStatus } from '../services/reportService';
import { fetchAccessibleCustomers, fetchCampaigns } from '../services/googleAds';

import type { EditableReport } from '../types/reportTypes';
import type { Campaign } from '../types/business';
import ReportCard from '../components/reports/ReportCard/ReportCard';
import FilterBar from '../components/common/FilterBar';
import Spinner from '../components/common/Spinner';
import './ReportsList.css';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

const ReportsList: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { isConnected: isGoogleAdsConnected } = useGoogleAds();
    const [reports, setReports] = useState<EditableReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<EditableReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusCounts, setStatusCounts] = useState({ draft: 0, published: 0, archived: 0 });

    const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

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

    const loadAccounts = async () => {
        try {
            const response = await fetchAccessibleCustomers();
            if (response.success && response.customers) {
                const accountsList = response.customers.map((customer: any) => ({
                    id: customer.id,
                    name: customer.descriptiveName || customer.id,
                }));
                setAccounts(accountsList);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
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

    useEffect(() => {
        if (isGoogleAdsConnected) {
            loadAccounts();
        }
    }, [isGoogleAdsConnected]);

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
    }, [reports, statusFilter, searchQuery, selectedAccountId, selectedCampaignId]);

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
                    <div className="loading-text">Chargement des rapports...</div>
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
                        <h1>Mes Rapports</h1>
                    </div>
                    <p className="subtitle">Gérez et organisez vos rapports Google Ads</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="create-report-btn-secondary bg-white dark:bg-slate-800 text-primary border-primary/20 hover:border-primary hover:bg-primary/5 shadow-sm"
                        onClick={() => navigate('/app/templates')}
                    >
                        Créer à partir d'un template
                    </button>
                    <button
                        className="create-report-btn"
                        onClick={handleCreateReport}
                        disabled={!isGoogleAdsConnected}
                        style={{
                            opacity: !isGoogleAdsConnected ? 0.5 : 1,
                            cursor: !isGoogleAdsConnected ? 'not-allowed' : 'pointer'
                        }}
                        title={!isGoogleAdsConnected ? 'Connectez Google Ads pour créer des rapports' : ''}
                    >
                        <Plus size={20} />
                        <span>Nouveau Rapport</span>
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
                        Tous ({reports.length})
                    </button>
                    <button
                        className={`status-filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('draft')}
                    >
                        <span className="status-badge draft">●</span>
                        Brouillons ({statusCounts.draft})
                    </button>
                    <button
                        className={`status-filter-btn ${statusFilter === 'published' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('published')}
                    >
                        <span className="status-badge published">●</span>
                        Publiés ({statusCounts.published})
                    </button>
                    <button
                        className={`status-filter-btn ${statusFilter === 'archived' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('archived')}
                    >
                        <span className="status-badge archived">●</span>
                        Archivés ({statusCounts.archived})
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
                            placeholder="Rechercher un rapport..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Vue grille"
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Vue liste"
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
                            <h3>Aucun rapport trouvé</h3>
                            <p>
                                {searchQuery
                                    ? 'Essayez de modifier votre recherche'
                                    : 'Créez votre premier rapport pour commencer'}
                            </p>
                            {!searchQuery && (
                                <button
                                    className="create-report-btn-secondary"
                                    onClick={handleCreateReport}
                                    disabled={!isGoogleAdsConnected}
                                    style={{
                                        opacity: !isGoogleAdsConnected ? 0.5 : 1,
                                        cursor: !isGoogleAdsConnected ? 'not-allowed' : 'pointer'
                                    }}
                                    title={!isGoogleAdsConnected ? 'Connectez Google Ads pour créer des rapports' : ''}
                                >
                                    <Plus size={20} />
                                    <span>Créer un rapport</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`reports-${viewMode}`}>
                            {filteredReports.map((report) => (
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
                    )
                }
            </FeatureAccessGuard>
        </div>
    );
};

export default ReportsList;
