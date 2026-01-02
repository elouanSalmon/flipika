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
            return <span className="status-badge paused"><PowerOff size={10} /> En pause</span>;
        }
        if (schedule.status === 'error') {
            return <span className="status-badge error">Erreur</span>;
        }
        return <span className="status-badge active"><Power size={10} /> Actif</span>;
    };

    const nextRun = schedule.nextRun ? new Date(schedule.nextRun) : null;
    const lastRun = schedule.lastRun ? new Date(schedule.lastRun) : null;
    const timeUntil = nextRun ? getTimeUntilNextRun(nextRun) : null;

    return (
        <div className={`listing-card group ${!schedule.isActive ? 'grayscale-[0.1]' : ''}`}>

            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2 group-hover:text-primary transition-colors">
                        {schedule.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <RefreshCw size={12} className={schedule.isActive ? 'text-primary' : ''} />
                        <span className="truncate">{formatScheduleConfig(schedule.scheduleConfig)}</span>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Description (if any) */}
            {schedule.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                    {schedule.description}
                </p>
            )}
            {!schedule.description && <div className="h-10 mb-4" />} {/* Spacer for alignment */}

            {/* Hero Section: Next Execution */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-4 mb-4 border border-primary/10 dark:border-primary/20 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                        <Clock size={12} />
                        Prochaine exécution
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                                {nextRun ? nextRun.toLocaleString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: 'numeric',
                                    month: 'short'
                                }) : '-'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Votre heure
                            </div>
                        </div>

                        <div className="text-right">
                            {timeUntil && (
                                <div className="text-sm font-bold text-primary mb-1">
                                    {timeUntil}
                                </div>
                            )}
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-end gap-1">
                                <span>UTC:</span>
                                {nextRun ? nextRun.toLocaleString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'UTC'
                                }) : '-'}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-8 text-primary/5 dark:text-primary/10">
                    <Clock size={100} />
                </div>
            </div>

            {/* Context Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 max-w-full" title={templateName}>
                    <BarChart2 size={12} className="text-gray-400" />
                    <span className="truncate max-w-[120px]">{templateName || 'Template'}</span>
                </div>
                {accountName && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 max-w-full" title={accountName}>
                        <span className="truncate max-w-[120px]">{accountName}</span>
                    </div>
                )}
            </div>

            {/* Footer Stats & Last Run */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-400 font-semibold">Total</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{schedule.totalRuns}</span>
                        </div>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex flex-col text-green-600 dark:text-green-400">
                            <span className="text-[10px] uppercase font-semibold">Succès</span>
                            <span className="text-sm font-bold">{schedule.successfulRuns}</span>
                        </div>
                        <div className="flex flex-col text-red-500 dark:text-red-400">
                            <span className="text-[10px] uppercase font-semibold">Échecs</span>
                            <span className="text-sm font-bold">{schedule.failedRuns}</span>
                        </div>
                    </div>
                </div>

                {lastRun && (
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>Dernière: {lastRun.toLocaleDateString()}</span>
                        </div>
                        {schedule.lastRunStatus === 'success' && schedule.lastGeneratedReportId && (
                            <button
                                onClick={handleViewLastReport}
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                Voir <ExternalLink size={10} />
                            </button>
                        )}
                        {schedule.lastRunStatus === 'error' && (
                            <span className="text-red-500 font-medium">Échec</span>
                        )}
                    </div>
                )}
            </div>

            {/* Hover Actions */}
            <div className="listing-card-actions">
                <button
                    className={`action-btn-icon ${schedule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400'}`}
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
                        <div className="absolute right-0 top-full mt-1 min-w-[12rem] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
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
