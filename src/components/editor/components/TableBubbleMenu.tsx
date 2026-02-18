import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { CellSelection } from '@tiptap/pm/tables';
import { useTranslation } from 'react-i18next';
import {
    BetweenVerticalStart,    // Add Col Before (vertical bars = columns)
    BetweenVerticalEnd,      // Add Col After
    BetweenHorizontalStart,  // Add Row Before (horizontal bars = rows)
    BetweenHorizontalEnd,    // Add Row After
    Trash2,                  // Delete table
    Columns,                 // Delete Col
    Rows,                    // Delete Row
    TableCellsMerge,         // Merge cells
    TableCellsSplit,         // Split cell
    PanelTop,                // Toggle header row
    PanelLeft,               // Toggle header column
} from 'lucide-react';

interface TableBubbleMenuProps {
    editor: Editor;
    appendTo?: React.RefObject<HTMLElement | null>;
}

const TableButton: React.FC<{
    onAction: () => void;
    icon: React.ElementType;
    title: string;
    disabled?: boolean;
    isActive?: boolean;
    variant?: 'default' | 'danger';
}> = ({ onAction, icon: Icon, title, disabled = false, isActive = false, variant = 'default' }) => {
    const baseClass = 'p-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed';
    const variantClass = variant === 'danger'
        ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
        : isActive
            ? 'bg-primary-100 text-primary dark:bg-primary-900/30 dark:text-primary-light'
            : 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300';

    return (
        <button
            type="button"
            disabled={disabled}
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) {
                    onAction();
                }
            }}
            className={`${baseClass} ${variantClass}`}
            title={title}
        >
            <Icon size={16} />
        </button>
    );
};

export const TableBubbleMenu: React.FC<TableBubbleMenuProps> = ({ editor, appendTo }) => {
    const { t } = useTranslation('reports');

    if (!editor) {
        return null;
    }

    const shouldShow = ({ editor }: { editor: Editor }) => {
        if (!editor.isActive('table')) return false;

        const { selection } = editor.state;

        // Show for cell selections (multi-cell) or empty selections (cursor in cell)
        // Hide when there's a text selection inside a cell — TextBubbleMenu handles that
        if (selection instanceof CellSelection) return true;
        return selection.empty;
    };

    const canMerge = editor.can().mergeCells();
    const canSplit = editor.can().splitCell();
    const showCellGroup = canMerge || canSplit;

    return (
        <BubbleMenu
            editor={editor}
            pluginKey="table-bubble-menu"
            shouldShow={shouldShow}
            updateDelay={0}
            appendTo={appendTo ? () => appendTo.current ?? document.body : undefined}
            options={{
                strategy: 'fixed',
                placement: 'top',
                offset: 8,
                flip: { fallbackPlacements: ['bottom', 'top-start', 'bottom-start'] },
            }}
            className="tiptap-bubble-menu"
        >
            <div className="flex bg-white dark:bg-black rounded-lg shadow-xl border border-neutral-200 dark:border-white/10 overflow-hidden divide-x divide-neutral-200 dark:divide-white/10">
                {/* Columns — vertical bars icon = columns */}
                <div className="flex p-1 gap-1">
                    <TableButton
                        onAction={() => editor.chain().focus().addColumnBefore().run()}
                        icon={BetweenVerticalStart}
                        title={t('toolbar.tableMenu.addColumnBefore')}
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().addColumnAfter().run()}
                        icon={BetweenVerticalEnd}
                        title={t('toolbar.tableMenu.addColumnAfter')}
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().deleteColumn().run()}
                        icon={Columns}
                        title={t('toolbar.tableMenu.deleteColumn')}
                        variant="danger"
                    />
                </div>

                {/* Rows — horizontal bars icon = rows */}
                <div className="flex p-1 gap-1">
                    <TableButton
                        onAction={() => editor.chain().focus().addRowBefore().run()}
                        icon={BetweenHorizontalStart}
                        title={t('toolbar.tableMenu.addRowBefore')}
                        disabled={!editor.can().addRowBefore()}
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().addRowAfter().run()}
                        icon={BetweenHorizontalEnd}
                        title={t('toolbar.tableMenu.addRowAfter')}
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().deleteRow().run()}
                        icon={Rows}
                        title={t('toolbar.tableMenu.deleteRow')}
                        variant="danger"
                        disabled={!editor.can().deleteRow()}
                    />
                </div>

                {/* Cell operations — only visible when merge or split is available */}
                {showCellGroup && (
                    <div className="flex p-1 gap-1">
                        {canMerge && (
                            <TableButton
                                onAction={() => editor.chain().focus().mergeCells().run()}
                                icon={TableCellsMerge}
                                title={t('toolbar.tableMenu.mergeCells')}
                            />
                        )}
                        {canSplit && (
                            <TableButton
                                onAction={() => editor.chain().focus().splitCell().run()}
                                icon={TableCellsSplit}
                                title={t('toolbar.tableMenu.splitCell')}
                            />
                        )}
                    </div>
                )}

                {/* Header toggles */}
                <div className="flex p-1 gap-1">
                    <TableButton
                        onAction={() => editor.chain().focus().toggleHeaderRow().run()}
                        icon={PanelTop}
                        title={t('toolbar.tableMenu.toggleHeaderRow')}
                        isActive={editor.isActive('tableHeader')}
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().toggleHeaderColumn().run()}
                        icon={PanelLeft}
                        title={t('toolbar.tableMenu.toggleHeaderColumn')}
                        isActive={editor.isActive('tableHeader') && editor.can().toggleHeaderColumn()}
                    />
                </div>

                {/* Delete table */}
                <div className="flex p-1 gap-1">
                    <TableButton
                        onAction={() => editor.chain().focus().deleteTable().run()}
                        icon={Trash2}
                        title={t('toolbar.tableMenu.deleteTable')}
                        variant="danger"
                    />
                </div>
            </div>
        </BubbleMenu>
    );
};
