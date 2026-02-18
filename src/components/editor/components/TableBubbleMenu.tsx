import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { CellSelection } from '@tiptap/pm/tables';
import {
    BetweenVerticalStart,    // Add Col Before (vertical bars = columns)
    BetweenVerticalEnd,      // Add Col After
    BetweenHorizontalStart,  // Add Row Before (horizontal bars = rows)
    BetweenHorizontalEnd,    // Add Row After
    Trash2,                  // Delete table
    Columns,                 // Delete Col
    Rows                     // Delete Row
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
    variant?: 'default' | 'danger';
}> = ({ onAction, icon: Icon, title, disabled = false, variant = 'default' }) => {
    const baseClass = 'p-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed';
    const variantClass = variant === 'danger'
        ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
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
                        title="Ajouter colonne avant"
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().addColumnAfter().run()}
                        icon={BetweenVerticalEnd}
                        title="Ajouter colonne apres"
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().deleteColumn().run()}
                        icon={Columns}
                        title="Supprimer la colonne"
                        variant="danger"
                    />
                </div>

                {/* Rows — horizontal bars icon = rows */}
                <div className="flex p-1 gap-1">
                    <TableButton
                        onAction={() => editor.chain().focus().addRowBefore().run()}
                        icon={BetweenHorizontalStart}
                        title="Ajouter ligne avant"
                        disabled={!editor.can().addRowBefore()}
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().addRowAfter().run()}
                        icon={BetweenHorizontalEnd}
                        title="Ajouter ligne apres"
                    />
                    <TableButton
                        onAction={() => editor.chain().focus().deleteRow().run()}
                        icon={Rows}
                        title="Supprimer la ligne"
                        variant="danger"
                        disabled={!editor.can().deleteRow()}
                    />
                </div>

                {/* Delete table */}
                <div className="flex p-1 gap-1">
                    <TableButton
                        onAction={() => editor.chain().focus().deleteTable().run()}
                        icon={Trash2}
                        title="Supprimer le tableau"
                        variant="danger"
                    />
                </div>
            </div>
        </BubbleMenu>
    );
};
