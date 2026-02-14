import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { Alert } from '../../types/business';

interface AlertsPanelProps {
    alerts: Alert[];
    onDismiss?: (alertId: string) => void;
    loading?: boolean;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onDismiss, loading = false }) => {
    const getAlertIcon = (severity: Alert['severity']) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />;
            case 'warning':
                return <AlertCircle size={20} className="text-orange-600 dark:text-orange-400" />;
            case 'info':
                return <Info size={20} className="text-primary dark:text-primary-light" />;
        }
    };

    const getAlertStyle = (severity: Alert['severity']) => {
        switch (severity) {
            case 'critical':
                return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
            case 'warning':
                return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20';
            case 'info':
                return 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20';
        }
    };

    if (loading) {
        return (
            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
                <h3 className="text-lg font-bold mb-4">Alertes et notifications</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse p-4 bg-neutral-100 dark:bg-black rounded-xl">
                            <div className="h-4 bg-neutral-200 dark:bg-black rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-neutral-200 dark:bg-black rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
                <h3 className="text-lg font-bold mb-4">Alertes et notifications</h3>
                <div className="text-center py-8 text-neutral-500">
                    <Info size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Aucune alerte pour le moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Alertes et notifications</h3>
                <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                    {alerts.filter(a => !a.read).length} nouvelle{alerts.filter(a => !a.read).length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.map(alert => (
                    <div
                        key={alert.id}
                        className={`p-4 rounded-xl border-2 ${getAlertStyle(alert.severity)} transition-all ${alert.read ? 'opacity-60' : ''
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5">{getAlertIcon(alert.severity)}</div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{alert.message}</p>
                                {alert.actionUrl && (
                                    <a
                                        href={alert.actionUrl}
                                        className="inline-block mt-2 text-sm font-medium text-primary dark:text-primary-light hover:underline"
                                    >
                                        Voir les détails →
                                    </a>
                                )}
                            </div>
                            {onDismiss && (
                                <button
                                    onClick={() => onDismiss(alert.id)}
                                    className="shrink-0 p-1 hover:bg-neutral-200 dark:hover:bg-white/5 rounded transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsPanel;
