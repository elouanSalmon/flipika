import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image as ImageIcon,
    Table as TableIcon,
    Minus,
    Undo,
    Redo,
    Palette,
    Highlighter,
} from 'lucide-react';
import './EditorToolbar.css';

interface EditorToolbarProps {
    editor: Editor;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);

    const addImage = () => {
        const url = window.prompt('URL de l\'image:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const setColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
        setShowColorPicker(false);
    };

    const setHighlight = (color: string) => {
        editor.chain().focus().setHighlight({ color }).run();
        setShowHighlightPicker(false);
    };

    const colors = [
        '#000000', '#374151', '#6b7280', '#9ca3af',
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="toolbar-button"
                    title="Annuler"
                >
                    <Undo size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="toolbar-button"
                    title="Rétablir"
                >
                    <Redo size={18} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
                    title="Gras"
                >
                    <Bold size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
                    title="Italique"
                >
                    <Italic size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`toolbar-button ${editor.isActive('strike') ? 'is-active' : ''}`}
                    title="Barré"
                >
                    <Strikethrough size={18} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                    title="Titre 1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                    title="Titre 2"
                >
                    <Heading2 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                    title="Titre 3"
                >
                    <Heading3 size={18} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                    title="Liste à puces"
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                    title="Liste numérotée"
                >
                    <ListOrdered size={18} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                    title="Aligner à gauche"
                >
                    <AlignLeft size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                    title="Centrer"
                >
                    <AlignCenter size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                    title="Aligner à droite"
                >
                    <AlignRight size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
                    title="Justifier"
                >
                    <AlignJustify size={18} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <div className="toolbar-color-picker">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="toolbar-button"
                        title="Couleur du texte"
                    >
                        <Palette size={18} />
                    </button>
                    {showColorPicker && (
                        <div className="color-picker-dropdown">
                            <div className="color-grid">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        className="color-swatch"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="toolbar-color-picker">
                    <button
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        className="toolbar-button"
                        title="Surligner"
                    >
                        <Highlighter size={18} />
                    </button>
                    {showHighlightPicker && (
                        <div className="color-picker-dropdown">
                            <div className="color-grid">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        className="color-swatch"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setHighlight(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={addImage}
                    className="toolbar-button"
                    title="Insérer une image"
                >
                    <ImageIcon size={18} />
                </button>
                <button
                    onClick={addTable}
                    className="toolbar-button"
                    title="Insérer un tableau"
                >
                    <TableIcon size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="toolbar-button"
                    title="Insérer un séparateur"
                >
                    <Minus size={18} />
                </button>
            </div>
        </div>
    );
};

export default EditorToolbar;
