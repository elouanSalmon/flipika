import React from 'react';
import { Clock, Calendar, MoreVertical, Edit2, Trash2, Power, PowerOff, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ScheduledReport } from '../../types/scheduledReportTypes';
import { formatScheduleConfig, getTimeUntilNextRun } from '../../types/scheduledReportTypes';
import './ScheduleCard.css'; // Minimized

interface ScheduleCardProps {
    schedule: ScheduledReport;
    templateName?: string;
    accountName?: string;
    onEdit: (schedule: ScheduledReport) => void;
    onDelete: (schedule: ScheduledReport) => void;
    onToggleStatus: (schedule: ScheduledReport, isActive: boolean) => void;
    isGoogleAdsConnected?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
    schedule,
    templateName,
    accountName,
    onEdit,
    onDelete,
    onToggleStatus,
    isGoogleAdsConnected = true,
}) => {
    const [showMenu, setShowMenu] = React.useState(false);
    const navigate = useNavigate();

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleAction = (action: () => void) => {
        setShowMenu(false);
        action();
    };

    const handleViewLastReport = () => {
        if (schedule.lastGeneratedReportId) {
            navigate(`/app/reports/${schedule.lastGeneratedReportId}`);
        }
    };

    const getStatusBadge = () => {
        if (!schedule.isActive) {
            return <span className="status-badge paused">En pause</span>;
        }
        if (schedule.status === 'error') {
            return <span className="status-badge error">Erreur</span>;
        }
        return <span className="status-badge active">Actif</span>;
    };

    const nextRun = schedule.nextRun ? new Date(schedule.nextRun) : null;
    const lastRun = schedule.lastRun ? new Date(schedule.lastRun) : null;

    return (
        <div className={`listing-card group ${!schedule.isActive ? 'opacity-75' : ''} ${showMenu ? 'z-50' : ''}`}>
            {/* Header */}
            <div className="listing-card-header">
                <div className="listing-card-title-group">
                    <h3 className="listing-card-title">{schedule.name}</h3>
                    <div className="listing-card-subtitle">
                        <RefreshCw size={12} className={schedule.isActive ? 'text-primary animate-spin-slow' : ''} />
                        {formatScheduleConfig(schedule.scheduleConfig)}
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Body */}
            <div className="listing-card-body">
                {/* Template & Account Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="listing-card-info-item" title={templateName}>
                        <BarChart2 size={14} />
                        <span className="text-xs">{templateName || 'Chargement...'}</span>
                    </div>
                    {/* Account info if available */}
                    {accountName && (
                        <div className="listing-card-info-item" title={accountName}>
                            <span className="text-xs truncate text-gray-500">Compte: {accountName}</span>
                        </div>
                    )}
                </div>

                {/* Execution Info */}
                <div className="space-y-2 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock size={14} className="text-primary" />
                            <span>Prochaine:</span>
                        </div>
                        <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                {nextRun ? nextRun.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                            </div>
                            {nextRun && (
                                <div className="text-xs text-primary font-medium">
                                    {getTimeUntilNextRun(nextRun)}
                                </div>
                            )}
                        </div>
                    </div>

                    {lastRun && (
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Calendar size={14} />
                                <span>Dernière:</span>
                            </div>
                            <div className="text-right flex items-center gap-2">
                                <span className="text-gray-700 dark:text-gray-300">
                                    {lastRun.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                                {schedule.lastRunStatus === 'success' && schedule.lastGeneratedReportId && (
                                    <button
                                        onClick={handleViewLastReport}
                                        className="text-primary hover:text-primary-dark transition-colors"
                                        title="Voir le rapport"
                                    >
                                        <ExternalLink size={12} />
                                    </button>
                                )}
                                {schedule.lastRunStatus === 'error' && (
                                    <span className="text-red-500 text-xs" title={schedule.lastRunError}>Échec</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Stats */}
            <div className="listing-card-footer">
                <div className="listing-card-stats">
                    <div className="listing-card-stat">
                        <span className="listing-card-stat-value">{schedule.totalRuns}</span>
                        <span className="listing-card-stat-label">Total</span>
                    </div>
                    <div className="listing-card-stat text-green-600 dark:text-green-400">
                        <span className="listing-card-stat-value">{schedule.successfulRuns}</span>
                        <span className="listing-card-stat-label">Réussis</span>
                    </div>
                    <div className="listing-card-stat text-red-600 dark:text-red-400">
                        <span className="listing-card-stat-value">{schedule.failedRuns}</span>
                        <span className="listing-card-stat-label">Échoués</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="listing-card-actions">
                <button
                    className={`action-btn-icon ${schedule.isActive ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => onToggleStatus(schedule, !schedule.isActive)}
                    title={schedule.isActive ? 'Mettre en pause' : 'Activer'}
                >
                    {schedule.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                </button>
                <button
                    onClick={() => handleAction(() => onEdit(schedule))}
                    disabled={!isGoogleAdsConnected}
                    className={`action-btn-icon ${!isGoogleAdsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Modifier"
                >
                    <Edit2 size={16} />
                </button>

                <div className="relative">
                    <button
                        onClick={handleMenuClick}
                        className="action-btn-icon"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 min-w-[12rem] w-auto whitespace-nowrap bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                            <button
                                onClick={() => handleAction(() => onDelete(schedule))}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Supprimer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleCard;
