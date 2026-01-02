import React, { useState } from 'react';
import { MoreVertical, Edit, Copy, Archive, Trash2, ExternalLink, Building, Megaphone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteReport, duplicateReport, archiveReport } from '../../../services/reportService';
import { useAuth } from '../../../contexts/AuthContext';
import type { EditableReport } from '../../../types/reportTypes';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../common/ConfirmationModal';
import './ReportCard.css'; // Keeping for potential specific overrides, but content will be minimized

interface ReportCardProps {
    report: EditableReport;
    viewMode: 'grid' | 'list';
    onClick: () => void;
    onDeleted: () => void;
    accounts?: { id: string; name: string }[];
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onClick, onDeleted, accounts = [] }) => {
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
        const config = {
            draft: { label: 'Brouillon', className: 'draft' },
            published: { label: 'Publié', className: 'published' },
            archived: { label: 'Archivé', className: 'archived' },
        }[report.status] || { label: report.status, className: 'neutral' };

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

    return (
        <div
            className={`listing-card group ${isDeleting ? 'opacity-50 pointer-events-none' : ''} ${showMenu ? 'z-50' : ''}`}
            onClick={onClick}
        >
            <div className="listing-card-header">
                <div className="listing-card-title-group">
                    <h3 className="listing-card-title">{report.title}</h3>
                    <div className="listing-card-subtitle">
                        <Calendar size={12} />
                        Modifié le {formatDate(report.updatedAt)}
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            <div className="listing-card-body">
                <div className="listing-card-row mb-2">
                    <div className="listing-card-info-item" title={accountName}>
                        <Building size={14} />
                        <span>{accountName}</span>
                    </div>
                </div>
                <div className="listing-card-row">
                    <div className="listing-card-info-item" title={report.campaignNames?.join(', ')}>
                        <Megaphone size={14} />
                        <span>{campaignsText}</span>
                    </div>
                </div>
            </div>

            <div className="listing-card-footer">
                <div className="listing-card-stats">
                    <div className="listing-card-stat">
                        <span className="listing-card-stat-value">{report.sections.length}</span>
                        <span className="listing-card-stat-label">Sections</span>
                    </div>
                    <div className="listing-card-stat border-l border-gray-200 dark:border-gray-700 pl-4">
                        <span className="listing-card-stat-value">{report.widgetIds?.length || 0}</span>
                        <span className="listing-card-stat-label">Widgets</span>
                    </div>
                </div>
            </div>

            {/* Actions Menu (Hover) */}
            <div className="listing-card-actions">
                {report.status === 'published' && report.shareUrl && (
                    <button onClick={handleViewPublic} className="action-btn-icon" title="Voir public">
                        <ExternalLink size={16} />
                    </button>
                )}
                <button onClick={handleEdit} className="action-btn-icon" title="Éditer">
                    <Edit size={16} />
                </button>
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="action-btn-icon"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 min-w-[12rem] w-auto whitespace-nowrap bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                            <button
                                onClick={handleDuplicate}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <Copy size={14} /> Dupliquer
                            </button>
                            {report.status !== 'archived' && (
                                <button
                                    onClick={handleArchive}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Archive size={14} /> Archiver
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 mt-1"
                            >
                                <Trash2 size={14} /> Supprimer
                            </button>
                        </div>
                    )}
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
        </div>
    );
};

export default ReportCard;
