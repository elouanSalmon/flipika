import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid, List as ListIcon, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listUserReports, getReportCountByStatus } from '../services/reportService';
import type { EditableReport } from '../types/reportTypes';
import ReportCard from '../components/reports/ReportCard/ReportCard';
import './ReportsList.css';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

const ReportsList: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [reports, setReports] = useState<EditableReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<EditableReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusCounts, setStatusCounts] = useState({ draft: 0, published: 0, archived: 0 });

    useEffect(() => {
        if (currentUser) {
            loadReports();
            loadStatusCounts();
        }
    }, [currentUser]);

    useEffect(() => {
        filterReports();
    }, [reports, statusFilter, searchQuery]);

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

        setFilteredReports(filtered);
    };

    const handleCreateReport = () => {
        navigate('/app/reports/new');
    };

    const handleReportClick = (reportId: string) => {
        navigate(`/ app / reports / ${reportId} `);
    };

    const handleReportDeleted = () => {
        loadReports();
        loadStatusCounts();
    };

    if (loading) {
        return (
            <div className="reports-list-page">
                <div className="loading-container">
                    <Loader2 className="loading-spinner" size={48} />
                    <div className="loading-text">Chargement des rapports...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-list-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Mes Rapports</h1>
                    <p className="subtitle">Gérez et organisez vos rapports Google Ads</p>
                </div>
                <button className="create-report-btn" onClick={handleCreateReport}>
                    <Plus size={20} />
                    <span>Nouveau Rapport</span>
                </button>
            </div>

            {/* Status Filters */}
            <div className="status-filters">
                <button
                    className={`status - filter - btn ${statusFilter === 'all' ? 'active' : ''} `}
                    onClick={() => setStatusFilter('all')}
                >
                    Tous ({reports.length})
                </button>
                <button
                    className={`status - filter - btn ${statusFilter === 'draft' ? 'active' : ''} `}
                    onClick={() => setStatusFilter('draft')}
                >
                    <span className="status-badge draft">●</span>
                    Brouillons ({statusCounts.draft})
                </button>
                <button
                    className={`status - filter - btn ${statusFilter === 'published' ? 'active' : ''} `}
                    onClick={() => setStatusFilter('published')}
                >
                    <span className="status-badge published">●</span>
                    Publiés ({statusCounts.published})
                </button>
                <button
                    className={`status - filter - btn ${statusFilter === 'archived' ? 'active' : ''} `}
                    onClick={() => setStatusFilter('archived')}
                >
                    <span className="status-badge archived">●</span>
                    Archivés ({statusCounts.archived})
                </button>
            </div>

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
                        className={`view - btn ${viewMode === 'grid' ? 'active' : ''} `}
                        onClick={() => setViewMode('grid')}
                        title="Vue grille"
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        className={`view - btn ${viewMode === 'list' ? 'active' : ''} `}
                        onClick={() => setViewMode('list')}
                        title="Vue liste"
                    >
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Reports Grid/List */}
            {filteredReports.length === 0 ? (
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
                        <button className="create-report-btn-secondary" onClick={handleCreateReport}>
                            <Plus size={20} />
                            <span>Créer un rapport</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className={`reports - ${viewMode} `}>
                    {filteredReports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            viewMode={viewMode}
                            onClick={() => handleReportClick(report.id)}
                            onDeleted={handleReportDeleted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportsList;
