import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { SiGoogleads, SiMeta } from 'react-icons/si';
import type { SlashCommandItem, SlashCommandCategory } from '../extensions/SlashCommandExtension';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../extensions/SlashCommandExtension';

interface SlashCommandMenuProps {
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
}

/** Map categories to their platform logo React elements */
const CATEGORY_LOGOS: Partial<Record<SlashCommandCategory, React.ReactNode>> = {
    google: <SiGoogleads className="slash-command-section-logo slash-command-section-logo--google" />,
    meta: <SiMeta className="slash-command-section-logo slash-command-section-logo--meta" />,
};

/**
 * Slash Command Menu Component (Epic 13 - Story 13.2)
 *
 * Dropdown menu that appears when typing "/" in the editor.
 * Items are grouped by category with section headers showing platform logos.
 * Supports keyboard navigation and fuzzy search.
 */
export const SlashCommandMenu = forwardRef((props: SlashCommandMenuProps, ref) => {
    const { t } = useTranslation();
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Group items by category, preserving a flat index for keyboard nav
    const { groups, flatItems } = useMemo(() => {
        const grouped = new Map<SlashCommandCategory | 'uncategorized', SlashCommandItem[]>();

        for (const item of props.items) {
            const cat = item.category || 'uncategorized';
            if (!grouped.has(cat)) grouped.set(cat, []);
            grouped.get(cat)!.push(item);
        }

        // Build ordered groups
        const orderedGroups: { category: SlashCommandCategory | 'uncategorized'; label: string; logoNode?: React.ReactNode; items: SlashCommandItem[] }[] = [];
        for (const cat of CATEGORY_ORDER) {
            if (grouped.has(cat)) {
                orderedGroups.push({
                    category: cat,
                    label: CATEGORY_LABELS[cat],
                    logoNode: CATEGORY_LOGOS[cat],
                    items: grouped.get(cat)!,
                });
            }
        }
        if (grouped.has('uncategorized')) {
            orderedGroups.push({
                category: 'uncategorized',
                label: '',
                items: grouped.get('uncategorized')!,
            });
        }

        // Build flat list for keyboard navigation
        const flat: SlashCommandItem[] = [];
        for (const group of orderedGroups) {
            flat.push(...group.items);
        }

        return { groups: orderedGroups, flatItems: flat };
    }, [props.items]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    const selectItem = (index: number) => {
        const item = flatItems[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + flatItems.length - 1) % flatItems.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % flatItems.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

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

    if (flatItems.length === 0) {
        return (
            <div className="slash-command-menu">
                <div className="slash-command-empty">
                    {t('reports:list.emptyState.noReports', 'No results found')}
                </div>
            </div>
        );
    }

    // Track a running flat index for keyboard selection
    let flatIndex = 0;
    const hasMultipleGroups = groups.length > 1;

    return (
        <div className="slash-command-menu">
            {groups.map((group) => (
                <div key={group.category} className="slash-command-group">
                    {hasMultipleGroups && group.label && (
                        <div className="slash-command-section-header">
                            {group.logoNode}
                            <span>{group.label}</span>
                        </div>
                    )}
                    {group.items.map((item) => {
                        const currentIndex = flatIndex++;
                        const isMeta = item.category === 'meta';
                        const isGoogle = item.category === 'google';
                        const isSecondary = ['content', 'layout', 'slides'].includes(item.category || '');

                        return (
                            <button
                                key={currentIndex}
                                className={`slash-command-item ${currentIndex === selectedIndex ? 'selected' : ''}`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectItem(currentIndex);
                                }}
                                onMouseEnter={() => setSelectedIndex(currentIndex)}
                                type="button"
                            >
                                <span className={`slash-command-icon ${isMeta ? 'slash-command-icon--meta' : ''} ${isGoogle ? 'slash-command-icon--google' : ''} ${isSecondary ? 'slash-command-icon--secondary' : ''}`}>
                                    {item.icon && <item.icon size={18} />}
                                </span>
                                <div className="slash-command-content">
                                    <div className="slash-command-title">
                                        {item.titleKey ? t(item.titleKey) : item.title}
                                    </div>
                                    <div className="slash-command-description">
                                        {item.descriptionKey ? t(item.descriptionKey) : item.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});

SlashCommandMenu.displayName = 'SlashCommandMenu';
