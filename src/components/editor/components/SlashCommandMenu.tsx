import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import type { SlashCommandItem } from '../extensions/SlashCommandExtension';

interface SlashCommandMenuProps {
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
}

/**
 * Slash Command Menu Component (Epic 13 - Story 13.2)
 * 
 * Dropdown menu that appears when typing "/" in the editor.
 * Supports keyboard navigation and fuzzy search.
 */
export const SlashCommandMenu = forwardRef((props: SlashCommandMenuProps, ref) => {
    const { t } = useTranslation();
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
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

    if (props.items.length === 0) {
        return (
            <div className="slash-command-menu">
                <div className="slash-command-empty">
                    {t('reports:list.emptyState.noReports', 'No results found')}
                </div>
            </div>
        );
    }

    return (
        <div className="slash-command-menu">
            {props.items.map((item, index) => (
                <button
                    key={index}
                    className={`slash-command-item ${index === selectedIndex ? 'selected' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent focus loss
                        selectItem(index);
                    }}
                    type="button"
                >
                    <span className="slash-command-icon">
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
            ))}
        </div>
    );
});

SlashCommandMenu.displayName = 'SlashCommandMenu';
