import React from 'react';
import { Clock, Calendar, MoreVertical, Edit2, Trash2, Power, PowerOff, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ScheduledReport } from '../../types/scheduledReportTypes';
import { formatScheduleConfig, getTimeUntilNextRun } from '../../types/scheduledReportTypes';
import './ScheduleCard.css';

interface ScheduleCardProps {
    schedule: ScheduledReport;
    templateName?: string;
    accountName?: string;
    onEdit: (schedule: ScheduledReport) => void;
    onDelete: (schedule: ScheduledReport) => void;
    onToggleStatus: (schedule: ScheduledReport, isActive: boolean) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
    schedule,
    templateName,
    accountName,
    onEdit,
    onDelete,
    onToggleStatus,
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

    return (
        <div className={`schedule-card ${!schedule.isActive ? 'paused' : ''}`}>
            <div className="schedule-card-header">
                <div className="schedule-title-section">
                    <h3>{schedule.name}</h3>
                    {getStatusBadge()}
                </div>
                <div className="schedule-actions">
                    <button
                        className={`toggle-btn ${schedule.isActive ? 'active' : 'inactive'}`}
                        onClick={() => onToggleStatus(schedule, !schedule.isActive)}
                        title={schedule.isActive ? 'Mettre en pause' : 'Activer'}
                    >
                        {schedule.isActive ? <Power size={18} /> : <PowerOff size={18} />}
                    </button>
                    <div className="menu-wrapper">
                        <button
                            className="action-btn menu-btn"
                            onClick={handleMenuClick}
                            title="Plus d'actions"
                        >
                            <MoreVertical size={18} />
                        </button>
                        {showMenu && (
                            <>
                                <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                                <div className="action-menu">
                                    <button onClick={() => handleAction(() => onEdit(schedule))}>
                                        <Edit2 size={16} />
                                        <span>Modifier</span>
                                    </button>
                                    <button
                                        className="danger"
                                        onClick={() => handleAction(() => onDelete(schedule))}
                                    >
                                        <Trash2 size={16} />
                                        <span>Supprimer</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {schedule.description && (
                <p className="schedule-description">{schedule.description}</p>
            )}

            <div className="schedule-details">
                <div className="detail-item">
                    <span className="detail-label">Template:</span>
                    <span className="detail-value">{templateName || 'Chargement...'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Compte:</span>
                    <span className="detail-value">{accountName || 'Chargement...'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Fréquence:</span>
                    <span className="detail-value">{formatScheduleConfig(schedule.scheduleConfig)}</span>
                </div>
            </div>

            <div className="schedule-execution">
                <div className="execution-item next-run">
                    <Clock size={16} />
                    <div className="execution-info">
                        <span className="execution-label">Prochaine exécution</span>
                        <span className="execution-value">
                            {schedule.nextRun.toLocaleString('fr-FR', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            })}
                        </span>
                        <span className="execution-countdown">
                            {getTimeUntilNextRun(schedule.nextRun)}
                        </span>
                    </div>
                </div>

                {schedule.lastRun && (
                    <div className="execution-item last-run">
                        <Calendar size={16} />
                        <div className="execution-info">
                            <span className="execution-label">Dernière exécution</span>
                            <span className="execution-value">
                                {schedule.lastRun.toLocaleString('fr-FR', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </span>
                            {schedule.lastRunStatus === 'success' && schedule.lastGeneratedReportId && (
                                <button
                                    className="view-report-btn"
                                    onClick={handleViewLastReport}
                                >
                                    <ExternalLink size={14} />
                                    <span>Voir le rapport</span>
                                </button>
                            )}
                            {schedule.lastRunStatus === 'error' && schedule.lastRunError && (
                                <span className="error-message">{schedule.lastRunError}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="schedule-stats">
                <div className="stat">
                    <span className="stat-value">{schedule.totalRuns}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat success">
                    <span className="stat-value">{schedule.successfulRuns}</span>
                    <span className="stat-label">Réussis</span>
                </div>
                <div className="stat error">
                    <span className="stat-value">{schedule.failedRuns}</span>
                    <span className="stat-label">Échoués</span>
                </div>
            </div>
        </div>
    );
};

export default ScheduleCard;
