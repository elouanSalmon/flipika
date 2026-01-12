import React, { useState, useEffect } from 'react';
import type { ScheduleConfig, ScheduleFrequency, DayOfWeek } from '../../types/scheduledReportTypes';
import { validateScheduleConfig, calculateNextRun } from '../../types/scheduledReportTypes';
import './FrequencySelector.css';

interface FrequencySelectorProps {
    value: ScheduleConfig;
    onChange: (config: ScheduleConfig) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = ({ value, onChange }) => {
    const [frequency, setFrequency] = useState<ScheduleFrequency>(value.frequency || 'daily');
    const [hour, setHour] = useState<number>(value.hour ?? 9);
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(value.dayOfWeek || 'monday');
    const [dayOfMonth, setDayOfMonth] = useState<number>(value.dayOfMonth || 1);
    const [cronExpression, setCronExpression] = useState<string>(value.cronExpression || '');
    const [error, setError] = useState<string>('');

    // Sync local state when incoming value prop changes (e.g., when editing a different schedule)
    useEffect(() => {
        setFrequency(value.frequency || 'daily');
        setHour(value.hour ?? 9);
        setDayOfWeek(value.dayOfWeek || 'monday');
        setDayOfMonth(value.dayOfMonth || 1);
        setCronExpression(value.cronExpression || '');
    }, [value.frequency, value.hour, value.dayOfWeek, value.dayOfMonth, value.cronExpression]);

    useEffect(() => {
        const config: ScheduleConfig = {
            frequency,
            ...(frequency !== 'custom' ? { hour } : {}),
            ...(frequency === 'weekly' ? { dayOfWeek: dayOfWeek || 'monday' } : {}),
            ...(frequency === 'monthly' ? { dayOfMonth: dayOfMonth || 1 } : {}),
            ...(frequency === 'custom' ? { cronExpression } : {}),
        };

        const validation = validateScheduleConfig(config);
        if (!validation.valid) {
            setError(validation.error || '');
        } else {
            setError('');
            onChange(config);
        }
    }, [frequency, hour, dayOfWeek, dayOfMonth, cronExpression, onChange]);

    const getNextRunPreview = (): string => {
        try {
            const config: ScheduleConfig = {
                frequency,
                ...(frequency !== 'custom' ? { hour } : {}),
                ...(frequency === 'weekly' ? { dayOfWeek: dayOfWeek || 'monday' } : {}),
                ...(frequency === 'monthly' ? { dayOfMonth: dayOfMonth || 1 } : {}),
                ...(frequency === 'custom' ? { cronExpression } : {}),
            };

            const validation = validateScheduleConfig(config);
            if (!validation.valid) {
                return '';
            }

            const nextRun = calculateNextRun(config);
            return nextRun.toLocaleString('fr-FR', {
                dateStyle: 'full',
                timeStyle: 'short'
            });
        } catch {
            return '';
        }
    };

    const dayNames: Record<DayOfWeek, string> = {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
    };

    return (
        <div className="frequency-selector">
            <div className="frequency-tabs">
                <button
                    className={`frequency-tab ${frequency === 'daily' ? 'active' : ''}`}
                    onClick={() => setFrequency('daily')}
                >
                    Quotidien
                </button>
                <button
                    className={`frequency-tab ${frequency === 'weekly' ? 'active' : ''}`}
                    onClick={() => setFrequency('weekly')}
                >
                    Hebdomadaire
                </button>
                <button
                    className={`frequency-tab ${frequency === 'monthly' ? 'active' : ''}`}
                    onClick={() => setFrequency('monthly')}
                >
                    Mensuel
                </button>
                <button
                    className={`frequency-tab ${frequency === 'custom' ? 'active' : ''}`}
                    onClick={() => setFrequency('custom')}
                >
                    Personnalisé
                </button>
            </div>

            <div className="frequency-config">
                {frequency === 'daily' && (
                    <div className="config-section">
                        <label>
                            <span className="label-text">Heure d'exécution</span>
                            <select
                                value={hour}
                                onChange={(e) => setHour(parseInt(e.target.value))}
                                className="select-input"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                        </label>
                        <p className="config-description">
                            Le rapport sera généré tous les jours à {hour.toString().padStart(2, '0')}:00
                        </p>
                    </div>
                )}

                {frequency === 'weekly' && (
                    <div className="config-section">
                        <label>
                            <span className="label-text">Jour de la semaine</span>
                            <select
                                value={dayOfWeek}
                                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                                className="select-input"
                            >
                                {(Object.keys(dayNames) as DayOfWeek[]).map((day) => (
                                    <option key={day} value={day}>
                                        {dayNames[day]}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="label-text">Heure d'exécution</span>
                            <select
                                value={hour}
                                onChange={(e) => setHour(parseInt(e.target.value))}
                                className="select-input"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                        </label>
                        <p className="config-description">
                            Le rapport sera généré chaque {dayNames[dayOfWeek].toLowerCase()} à {hour.toString().padStart(2, '0')}:00
                        </p>
                    </div>
                )}

                {frequency === 'monthly' && (
                    <div className="config-section">
                        <label>
                            <span className="label-text">Jour du mois</span>
                            <select
                                value={dayOfMonth}
                                onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                                className="select-input"
                            >
                                {Array.from({ length: 31 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="label-text">Heure d'exécution</span>
                            <select
                                value={hour}
                                onChange={(e) => setHour(parseInt(e.target.value))}
                                className="select-input"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                        </label>
                        <p className="config-description">
                            Le rapport sera généré le {dayOfMonth} de chaque mois à {hour.toString().padStart(2, '0')}:00
                        </p>
                    </div>
                )}

                {frequency === 'custom' && (
                    <div className="config-section">
                        <label>
                            <span className="label-text">Expression cron</span>
                            <input
                                type="text"
                                value={cronExpression}
                                onChange={(e) => setCronExpression(e.target.value)}
                                placeholder="0 9 * * 1"
                                className="text-input"
                            />
                        </label>
                        <p className="config-description">
                            Format: minute heure jour mois jour-semaine
                            <br />
                            Exemple: "0 9 * * 1" = Tous les lundis à 9h00
                        </p>
                        <a
                            href="https://crontab.guru/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cron-help-link"
                        >
                            Aide pour les expressions cron →
                        </a>
                    </div>
                )}
            </div>

            {error && (
                <div className="frequency-error">
                    {error}
                </div>
            )}

            {!error && getNextRunPreview() && (
                <div className="next-run-preview">
                    <span className="preview-label">Prochaine exécution:</span>
                    <span className="preview-value">{getNextRunPreview()}</span>
                </div>
            )}
        </div>
    );
};

export default FrequencySelector;
