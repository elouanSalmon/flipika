import React from 'react';
import { Editor, isNodeSelection } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { CellSelection } from '@tiptap/pm/tables';

import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Highlighter,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from 'lucide-react';

interface TextBubbleMenuProps {
    editor: Editor;
    appendTo?: React.RefObject<HTMLElement | null>;
}

export const TextBubbleMenu: React.FC<TextBubbleMenuProps> = ({ editor, appendTo }) => {
    if (!editor) {
        return null;
    }

    const shouldShow = ({ editor }: { editor: Editor }) => {
        const { selection } = editor.state;

        // Never show for empty selections, node selections, or data blocks
        if (selection.empty || isNodeSelection(selection)) return false;
        if (editor.isActive('dataBlock')) return false;

        // Don't show for cell selections (multi-cell drag) — let the table bubble menu handle those
        if (selection instanceof CellSelection) return false;

        // Show for text selections, including text selected inside table cells
        return true;
    };

    const BubbleButton: React.FC<{
        onClick: () => void;
        isActive?: boolean;
        icon: React.ElementType;
        title: string;
    }> = ({ onClick, isActive, icon: Icon, title }) => (
        <button
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            className={`p-1.5 rounded transition-colors ${isActive
                ? 'bg-primary-100 text-primary dark:bg-primary-900/30 dark:text-primary-light'
                : 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                }`}
            title={title}
            type="button"
        >
            <Icon size={16} />
        </button>
    );

    return (
        <BubbleMenu
            editor={editor}
            pluginKey="text-bubble-menu"
            shouldShow={shouldShow}
            updateDelay={0}
            appendTo={appendTo ? () => appendTo.current ?? document.body : undefined}
            options={{
                strategy: 'fixed',
                placement: 'top',
                offset: 8,
            }}
            className="tiptap-bubble-menu"
        >
            <div className="flex bg-white dark:bg-black rounded-lg shadow-xl border border-neutral-200 dark:border-white/10 overflow-hidden divide-x divide-neutral-200 dark:divide-white/10">
                {/* Text Formatting */}
                <div className="flex p-1 gap-1">
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon={Bold}
                        title="Gras (Ctrl+B)"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon={Italic}
                        title="Italique (Ctrl+I)"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        icon={Underline}
                        title="Souligne (Ctrl+U)"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        icon={Strikethrough}
                        title="Barre"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        isActive={editor.isActive('highlight')}
                        icon={Highlighter}
                        title="Surligner"
                    />
                </div>

                {/* Headings */}
                <div className="flex p-1 gap-1">
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        icon={Heading1}
                        title="Titre 1"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon={Heading2}
                        title="Titre 2"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        icon={Heading3}
                        title="Titre 3"
                    />
                </div>

                {/* Alignment */}
                <div className="flex p-1 gap-1">
                    <BubbleButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        icon={AlignLeft}
                        title="Aligner a gauche"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        icon={AlignCenter}
                        title="Centrer"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        icon={AlignRight}
                        title="Aligner a droite"
                    />
                </div>
            </div>
        </BubbleMenu>
    );
};
