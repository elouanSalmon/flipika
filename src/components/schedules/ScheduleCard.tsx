import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar, MoreVertical, Edit2, Trash2, Power, PowerOff, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ScheduledReport } from '../../types/scheduledReportTypes';
import { formatScheduleConfig, getTimeUntilNextRun } from '../../types/scheduledReportTypes';
import ClientLogoAvatar from '../common/ClientLogoAvatar';
import './ScheduleCard.css'; // Minimized

interface ScheduleCardProps {
    schedule: ScheduledReport;
    templateName?: string;
    accountName?: string;
    clientLogo?: string;
    onEdit: (schedule: ScheduledReport) => void;
    onDelete: (schedule: ScheduledReport) => void;
    onToggleStatus: (schedule: ScheduledReport, isActive: boolean) => void;
    isGoogleAdsConnected?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
    schedule,
    templateName,
    accountName,
    clientLogo,
    onEdit,
    onDelete,
    onToggleStatus,
    isGoogleAdsConnected = true,
}) => {
    const { t } = useTranslation('schedules');
    const [showMenu, setShowMenu] = React.useState(false);
    const navigate = useNavigate();

    // Helper to robustly convert various date formats (Date, Firestore Timestamp, ISO string)
    const toDate = (value: any): Date | null => {
        if (!value) return null;
        // Already a valid Date
        if (value instanceof Date && !isNaN(value.getTime())) {
            return value;
        }
        // Firestore Timestamp (has toDate method)
        if (typeof value?.toDate === 'function') {
            return value.toDate();
        }
        // Firestore Timestamp-like object with seconds
        if (typeof value?.seconds === 'number') {
            return new Date(value.seconds * 1000);
        }
        // ISO string or other parseable format
        if (typeof value === 'string' || typeof value === 'number') {
            const parsed = new Date(value);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    };

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
            return <span className="status-badge paused"><PowerOff size={10} /> {t('card.status.paused')}</span>;
        }
        if (schedule.status === 'error') {
            return <span className="status-badge error">{t('card.status.error')}</span>;
        }
        return <span className="status-badge active"><Power size={10} /> {t('card.status.active')}</span>;
    };

    const nextRun = toDate(schedule.nextRun);
    const lastRun = toDate(schedule.lastRun);
    const timeUntil = nextRun ? getTimeUntilNextRun(nextRun) : null;

    return (
        <div className={`listing-card group ${!schedule.isActive ? 'grayscale-[0.1]' : ''}`}>

            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-200 truncate flex items-center gap-2 group-hover:text-primary transition-colors">
                        {schedule.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <RefreshCw size={12} className={schedule.isActive ? 'text-primary' : ''} />
                        <span className="truncate">{formatScheduleConfig(schedule.scheduleConfig)}</span>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Description (if any) */}
            {schedule.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 h-10">
                    {schedule.description}
                </p>
            )}
            {!schedule.description && <div className="h-10 mb-4" />} {/* Spacer for alignment */}

            {/* Hero Section: Next Execution or Paused State */}
            <div className={`rounded-xl p-4 mb-4 border relative overflow-hidden ${schedule.isActive
                ? 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/10 dark:border-primary/20'
                : 'bg-neutral-50 dark:bg-black/50 border-neutral-100 dark:border-white/10'
                }`}>
                {schedule.isActive ? (
                    <>
                        <div className="relative z-10">
                            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                                <Clock size={12} />
                                {t('card.nextRun.title')}
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-200 leading-none mb-1">
                                        {nextRun ? nextRun.toLocaleString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: 'numeric',
                                            month: 'short'
                                        }) : '-'}
                                    </div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                        {t('card.nextRun.localTime')}
                                    </div>
                                </div>

                                <div className="text-right">
                                    {timeUntil && (
                                        <div className="text-sm font-bold text-primary mb-1">
                                            {timeUntil}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center justify-end gap-1">
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
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-2 text-neutral-500 dark:text-neutral-400">
                        <PowerOff size={24} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium">{t('card.paused.title')}</span>
                        <span className="text-xs opacity-75">{t('card.paused.description')}</span>
                    </div>
                )}
            </div>

            {/* Context Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                {clientLogo && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-black text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-white/10">
                        <ClientLogoAvatar logo={clientLogo} name={accountName} size="xs" />
                    </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-black text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-white/10 max-w-full" title={templateName}>
                    <BarChart2 size={12} className="text-neutral-400" />
                    <span className="truncate max-w-[120px]">{templateName || 'Template'}</span>
                </div>
                {accountName && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-black text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-white/10 max-w-full" title={accountName}>
                        <span className="truncate max-w-[120px]">{accountName}</span>
                    </div>
                )}
            </div>

            {/* Footer Stats & Last Run */}
            <div className="pt-3 border-t border-neutral-100 dark:border-white/10 mt-auto">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-neutral-400 font-semibold">{t('card.stats.total')}</span>
                            <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">{schedule.totalRuns}</span>
                        </div>
                        <div className="w-px h-6 bg-neutral-200 dark:bg-black"></div>
                        <div className="flex flex-col text-green-600 dark:text-green-400">
                            <span className="text-[10px] uppercase font-semibold">{t('card.stats.success')}</span>
                            <span className="text-sm font-bold">{schedule.successfulRuns}</span>
                        </div>
                        <div className="flex flex-col text-red-500 dark:text-red-400">
                            <span className="text-[10px] uppercase font-semibold">{t('card.stats.failed')}</span>
                            <span className="text-sm font-bold">{schedule.failedRuns}</span>
                        </div>
                    </div>
                </div>

                {lastRun && (
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-black/50 rounded px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>{t('card.lastRun', { date: lastRun.toLocaleDateString() })}</span>
                        </div>
                        {schedule.lastRunStatus === 'success' && schedule.lastGeneratedReportId && (
                            <button
                                onClick={handleViewLastReport}
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                {t('card.viewReport')} <ExternalLink size={10} />
                            </button>
                        )}
                        {schedule.lastRunStatus === 'error' && (
                            <span className="text-red-500 font-medium">{t('card.failed')}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Hover Actions */}
            <div className="listing-card-actions">
                <button
                    className={`action-btn-icon ${schedule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-neutral-400'}`}
                    onClick={() => onToggleStatus(schedule, !schedule.isActive)}
                    title={schedule.isActive ? t('card.actions.pause') : t('card.actions.activate')}
                >
                    {schedule.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                </button>
                <button
                    onClick={() => handleAction(() => onEdit(schedule))}
                    disabled={!isGoogleAdsConnected}
                    className={`action-btn-icon ${!isGoogleAdsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={t('card.actions.edit')}
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
                        <div className="absolute right-0 top-full mt-1 min-w-[12rem] bg-white dark:bg-black rounded-lg shadow-xl border border-neutral-200 dark:border-white/10 z-50 py-1">
                            <button
                                onClick={() => handleAction(() => onDelete(schedule))}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <Trash2 size={14} /> {t('card.actions.delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleCard;
