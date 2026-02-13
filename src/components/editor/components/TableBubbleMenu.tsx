import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
    BetweenHorizonalStart, // Add Col Before
    BetweenHorizonalEnd,   // Add Col After
    BetweenVerticalStart,  // Add Row Before
    BetweenVerticalEnd,    // Add Row After
    Trash2,                // Delete
    Merge,                 // Merge Cells
    Split,                 // Split Cell
    Grid3X3,               // Header Toggle (visual cue)
    Columns,               // Delete Col
    Rows                   // Delete Row
} from 'lucide-react';

interface TableBubbleMenuProps {
    editor: Editor;
}

export const TableBubbleMenu: React.FC<TableBubbleMenuProps> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const shouldShow = ({ editor }: { editor: Editor }) => {
        return editor.isActive('table');
    };

    return (
        <BubbleMenu
            editor={editor}
            pluginKey="table-bubble-menu"
            shouldShow={shouldShow}
            className="tiptap-bubble-menu"
        >
            <div className="flex bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden divide-x divide-neutral-200 dark:divide-neutral-700">
                {/* Columns */}
                <div className="flex p-1 gap-1">
                    <button
                        onClick={() => editor.chain().focus().addColumnBefore().run()}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300"
                        title="Ajouter colonne avant"
                    >
                        <BetweenHorizonalStart size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300"
                        title="Ajouter colonne après"
                    >
                        <BetweenHorizonalEnd size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                        title="Supprimer la colonne"
                    >
                        <Columns size={16} />
                    </button>
                </div>

                {/* Rows */}
                <div className="flex p-1 gap-1">
                    <button
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300"
                        title="Ajouter ligne avant"
                    >
                        <BetweenVerticalStart size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300"
                        title="Ajouter ligne après"
                    >
                        <BetweenVerticalEnd size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                        title="Supprimer la ligne"
                    >
                        <Rows size={16} />
                    </button>
                </div>

                {/* Cells */}
                <div className="flex p-1 gap-1">
                    <button
                        onClick={() => editor.chain().focus().mergeCells().run()}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300"
                        title="Fusionner les cellules"
                        disabled={!editor.can().mergeCells()}
                    >
                        <Merge size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().splitCell().run()}
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-700 dark:text-neutral-300"
                        title="Diviser la cellule"
                        disabled={!editor.can().splitCell()}
                    >
                        <Split size={16} />
                    </button>
                </div>

                {/* Headers / Table */}
                <div className="flex p-1 gap-1">
                    <button
                        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                        className={`p-1.5 rounded ${editor.isActive('tableHeader') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'}`}
                        title="En-tête"
                    >
                        <Grid3X3 size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                        title="Supprimer le tableau"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </BubbleMenu>
    );
};
