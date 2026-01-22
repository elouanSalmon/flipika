import React from 'react';
import type { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
} from 'lucide-react';

interface TiptapToolbarProps {
    editor: Editor;
}

export const TiptapToolbar: React.FC<TiptapToolbarProps> = ({ editor }) => {
    const ToolbarButton: React.FC<{
        onClick: () => void;
        isActive?: boolean;
        icon: React.ReactNode;
        title: string;
    }> = ({ onClick, isActive, icon, title }) => (
        <button
            onClick={onClick}
            className={`tiptap-toolbar-btn ${isActive ? 'is-active' : ''}`}
            title={title}
            type="button"
        >
            {icon}
        </button>
    );

    return (
        <div className="tiptap-toolbar">
            <div className="tiptap-toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    icon={<Undo size={18} />}
                    title="Annuler"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    icon={<Redo size={18} />}
                    title="Rétablir"
                />
            </div>

            <div className="tiptap-toolbar-separator" />

            <div className="tiptap-toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={<Heading1 size={18} />}
                    title="Titre 1"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={<Heading2 size={18} />}
                    title="Titre 2"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    icon={<Heading3 size={18} />}
                    title="Titre 3"
                />
            </div>

            <div className="tiptap-toolbar-separator" />

            <div className="tiptap-toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={<Bold size={18} />}
                    title="Gras (Cmd+B)"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={<Italic size={18} />}
                    title="Italique (Cmd+I)"
                />
            </div>

            <div className="tiptap-toolbar-separator" />

            <div className="tiptap-toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={<List size={18} />}
                    title="Liste à puces"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={<ListOrdered size={18} />}
                    title="Liste numérotée"
                />
            </div>

            <div className="tiptap-toolbar-separator" />


        </div>
    );
};
