import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Calendar, FileText, Building2, Hash } from 'lucide-react';
import type { DYNAMIC_VARIABLES } from '../extensions/DynamicVariableExtension';

type Variable = typeof DYNAMIC_VARIABLES[number];

interface VariableSuggestionMenuProps {
    items: Variable[];
    command: (item: Variable) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    client: <Building2 className="w-4 h-4" />,
    report: <FileText className="w-4 h-4" />,
    period: <Calendar className="w-4 h-4" />,
    user: <User className="w-4 h-4" />,
    other: <Hash className="w-4 h-4" />,
};

const CATEGORY_LABELS: Record<string, string> = {
    client: 'Client',
    report: 'Rapport',
    period: 'Periode',
    user: 'Utilisateur',
    other: 'Autre',
};

export const VariableSuggestionMenu = forwardRef<any, VariableSuggestionMenuProps>(
    ({ items, command }, ref) => {
        const { t } = useTranslation('reports');
        const [selectedIndex, setSelectedIndex] = useState(0);

        const selectItem = (index: number) => {
            const item = items[index];
            if (item) {
                command(item);
            }
        };

        const upHandler = () => {
            setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        };

        const downHandler = () => {
            setSelectedIndex((selectedIndex + 1) % items.length);
        };

        const enterHandler = () => {
            selectItem(selectedIndex);
        };

        useEffect(() => setSelectedIndex(0), [items]);

        useImperativeHandle(ref, () => ({
            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
                if (event.key === 'ArrowUp') {
                    upHandler();
                    return true;
                }

                if (event.key === 'ArrowDown') {
                    downHandler();
                    return true;
                }

                if (event.key === 'Enter') {
                    enterHandler();
                    return true;
                }

                return false;
            },
        }));

        if (items.length === 0) {
            return (
                <div className="variable-suggestion-menu">
                    <div className="variable-suggestion-empty">
                        {t('variables.noResults', 'Aucune variable trouvee')}
                    </div>
                </div>
            );
        }

        // Group items by category
        const groupedItems = items.reduce((acc, item, index) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ ...item, globalIndex: index });
            return acc;
        }, {} as Record<string, (Variable & { globalIndex: number })[]>);

        let currentGlobalIndex = 0;

        return (
            <div className="variable-suggestion-menu">
                <div className="variable-suggestion-header">
                    {t('variables.title', 'Variables dynamiques')}
                </div>
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category} className="variable-suggestion-category">
                        <div className="variable-suggestion-category-label">
                            {CATEGORY_ICONS[category]}
                            <span>{CATEGORY_LABELS[category]}</span>
                        </div>
                        {categoryItems.map((item) => {
                            const index = currentGlobalIndex++;
                            return (
                                <button
                                    key={item.id}
                                    className={`variable-suggestion-item ${
                                        index === selectedIndex ? 'is-selected' : ''
                                    }`}
                                    onClick={() => selectItem(items.findIndex(i => i.id === item.id))}
                                    onMouseEnter={() => setSelectedIndex(items.findIndex(i => i.id === item.id))}
                                >
                                    <span className="variable-suggestion-item-tag">[{item.id}]</span>
                                    <span className="variable-suggestion-item-label">
                                        {t(item.labelKey, item.label)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }
);

VariableSuggestionMenu.displayName = 'VariableSuggestionMenu';
