import React from 'react';
import { Calendar } from 'lucide-react';
import type { DateRange } from '../../types/business';

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
    const presets: Array<{ label: string; value: DateRange['preset'] }> = [
        { label: "Aujourd'hui", value: 'today' },
        { label: '7 derniers jours', value: '7d' },
        { label: '30 derniers jours', value: '30d' },
        { label: 'Ce mois-ci', value: 'this_month' },
        { label: 'Mois dernier', value: 'last_month' },
        { label: 'Personnalisé', value: 'custom' },
    ];

    const getDateRangeForPreset = (preset: DateRange['preset']): DateRange => {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        switch (preset) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case '7d':
                start.setDate(now.getDate() - 7);
                break;
            case '30d':
                start.setDate(now.getDate() - 30);
                break;
            case 'this_month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last_month':
                start.setMonth(now.getMonth() - 1);
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(now.getMonth());
                end.setDate(0);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                break;
        }

        return { start, end, preset };
    };

    const handlePresetClick = (preset: DateRange['preset']) => {
        if (preset === 'custom') {
            onChange({ ...value, preset });
        } else {
            onChange(getDateRangeForPreset(preset));
        }
    };

    const handleDateChange = (type: 'start' | 'end', dateString: string) => {
        const newDate = new Date(dateString);
        const newRange = {
            ...value,
            [type]: newDate,
            preset: 'custom' as const,
        };
        onChange(newRange);
    };

    return (
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-neutral-500" />
                <h3 className="font-semibold text-sm">Période</h3>
            </div>

            <div className="space-y-4">
                {/* Presets */}
                <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => handlePresetClick(preset.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${value.preset === preset.value
                                    ? 'bg-primary text-white'
                                    : 'bg-neutral-100 dark:bg-black text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Custom date inputs */}
                {value.preset === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-white/10">
                        <div>
                            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={value.start.toISOString().split('T')[0]}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={value.end.toISOString().split('T')[0]}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateRangePicker;
