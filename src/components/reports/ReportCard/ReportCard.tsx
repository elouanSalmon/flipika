import React, { useState } from 'react';
import { MoreVertical, Edit, Copy, Archive, Trash2, ExternalLink, Building, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteReport, duplicateReport, archiveReport } from '../../../services/reportService';
import { useAuth } from '../../../contexts/AuthContext';
import type { EditableReport } from '../../../types/reportTypes';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../common/ConfirmationModal';
import './ReportCard.css';

interface ReportCardProps {
    report: EditableReport;
    viewMode: 'grid' | 'list';
    onClick: () => void;
    onDeleted: () => void;
    accounts?: { id: string; name: string }[];
}

const ReportCard: React.FC<ReportCardProps> = ({ report, viewMode, onClick, onDeleted, accounts = [] }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/app/reports/${report.id}`);
        setShowMenu(false);
    };

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) return;

        try {
            const newReportId = await duplicateReport(report.id, currentUser.uid);
            toast.success('Rapport dupliqué avec succès');
            navigate(`/app/reports/${newReportId}`);
        } catch (error) {
            toast.error('Erreur lors de la duplication');
        }
        setShowMenu(false);
    };

    const handleArchive = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await archiveReport(report.id);
            toast.success('Rapport archivé');
            onDeleted();
        } catch (error) {
            toast.error('Erreur lors de l\'archivage');
        }
        setShowMenu(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteModalOpen(true);
        setShowMenu(false);
    };

    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteReport(report.id);
            toast.success('Rapport supprimé');
            onDeleted();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewPublic = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (report.shareUrl) {
            window.open(report.shareUrl, '_blank');
        }
        setShowMenu(false);
    };

    const getStatusBadge = () => {
        const statusConfig = {
            draft: { label: 'Brouillon', className: 'draft' },
            published: { label: 'Publié', className: 'published' },
            archived: { label: 'Archivé', className: 'archived' },
        };

        const config = statusConfig[report.status];
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    // Resolve account name
    const accountName = report.accountName ||
        accounts.find(a => a.id === report.accountId)?.name ||
        (report.accountId ? 'Compte inconnu' : 'Non défini');

    // Resolve campaigns text
    const campaignsText = report.campaignNames?.length
        ? `${report.campaignNames.length} Campagne${report.campaignNames.length > 1 ? 's' : ''}`
        : (report.campaignIds?.length
            ? `${report.campaignIds.length} Campagne${report.campaignIds.length > 1 ? 's' : ''}`
            : 'Aucune campagne');

    // Tooltip for campaigns
    const campaignsTooltip = report.campaignNames?.join(', ') || '';

    return (
        <div className={`report-card ${viewMode} ${isDeleting ? 'deleting' : ''}`} onClick={onClick}>
            <div className="report-card-content">
                <div className="report-header">
                    <div className="report-title-section">
                        <h3 className="report-title">{report.title}</h3>
                        {getStatusBadge()}
                    </div>

                    <div className="report-actions">
                        <button
                            className="menu-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {showMenu && (
                            <div className="actions-menu">
                                <button onClick={handleEdit}>
                                    <Edit size={16} />
                                    <span>Éditer</span>
                                </button>
                                <button onClick={handleDuplicate}>
                                    <Copy size={16} />
                                    <span>Dupliquer</span>
                                </button>
                                {report.status === 'published' && report.shareUrl && (
                                    <button onClick={handleViewPublic}>
                                        <ExternalLink size={16} />
                                        <span>Voir public</span>
                                    </button>
                                )}
                                {report.status !== 'archived' && (
                                    <button onClick={handleArchive}>
                                        <Archive size={16} />
                                        <span>Archiver</span>
                                    </button>
                                )}
                                <button onClick={handleDelete} className="delete-btn">
                                    <Trash2 size={16} />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="report-context-info">
                    <div className="context-item" title={accountName}>
                        <Building size={14} />
                        <span className="truncate">{accountName}</span>
                    </div>
                    <div className="context-item" title={campaignsTooltip}>
                        <Megaphone size={14} />
                        <span className="truncate">{campaignsText}</span>
                    </div>
                </div>

                <div className="report-meta">
                    <div className="meta-item">
                        <span className="meta-label">Créé le:</span>
                        <span className="meta-value">{formatDate(report.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Modifié le:</span>
                        <span className="meta-value">{formatDate(report.updatedAt)}</span>
                    </div>
                    {report.publishedAt && (
                        <div className="meta-item">
                            <span className="meta-label">Publié le:</span>
                            <span className="meta-value">{formatDate(report.publishedAt)}</span>
                        </div>
                    )}
                </div>

                <div className="report-stats">
                    <div className="stat">
                        <span className="stat-value">{report.sections.length}</span>
                        <span className="stat-label">Sections</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{report.widgetIds?.length || 0}</span>
                        <span className="stat-label">Widgets</span>
                    </div>

                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer le rapport"
                message={`Êtes-vous sûr de vouloir supprimer le rapport "${report.title}" ?`}
                confirmLabel="Supprimer"
                isDestructive={true}
            />
        </div >
    );
};

export default ReportCard;
