import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
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
}

export const TextBubbleMenu: React.FC<TextBubbleMenuProps> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const shouldShow = ({ editor }: { editor: Editor }) => {
        const { selection } = editor.state;

        // Show bubble menu only when there is a selection and it's not a custom block or node selection
        return !selection.empty &&
            !isNodeSelection(selection) &&
            !editor.isActive('table') &&
            !editor.isActive('dataBlock');
    };

    const BubbleButton: React.FC<{
        onClick: () => void;
        isActive?: boolean;
        icon: React.ElementType;
        title: string;
    }> = ({ onClick, isActive, icon: Icon, title }) => (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            className={`p-1.5 rounded transition-colors ${isActive
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
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
            className="tiptap-bubble-menu"
        >
            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
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
                        title="Souligné (Ctrl+U)"
                    />
                    <BubbleButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        icon={Strikethrough}
                        title="Barré"
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
                        title="Aligner à gauche"
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
                        title="Aligner à droite"
                    />
                </div>
            </div>
        </BubbleMenu>
    );
};
