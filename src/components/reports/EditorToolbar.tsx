import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { ToolbarButton } from '../common/ToolbarButton';
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
    const { t } = useTranslation('reports');
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
        '#000000', '#1a1a1a', '#6b6e77', '#8e9199',
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#1963d5', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];

    const btnClass = "toolbar-button";

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    icon={<Undo size={18} />}
                    tooltip={t('toolbar.undo')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    icon={<Redo size={18} />}
                    tooltip={t('toolbar.redo')}
                    className={btnClass}
                />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={<Bold size={18} />}
                    tooltip={t('toolbar.bold')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={<Italic size={18} />}
                    tooltip={t('toolbar.italic')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon={<Strikethrough size={18} />}
                    tooltip={t('toolbar.strike')}
                    className={btnClass}
                />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={<Heading1 size={18} />}
                    tooltip={t('toolbar.h1')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={<Heading2 size={18} />}
                    tooltip={t('toolbar.h2')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    icon={<Heading3 size={18} />}
                    tooltip={t('toolbar.h3')}
                    className={btnClass}
                />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={<List size={18} />}
                    tooltip={t('toolbar.bulletList')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={<ListOrdered size={18} />}
                    tooltip={t('toolbar.orderedList')}
                    className={btnClass}
                />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    icon={<AlignLeft size={18} />}
                    tooltip={t('toolbar.alignLeft')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    icon={<AlignCenter size={18} />}
                    tooltip={t('toolbar.alignCenter')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    icon={<AlignRight size={18} />}
                    tooltip={t('toolbar.alignRight')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    icon={<AlignJustify size={18} />}
                    tooltip={t('toolbar.justify')}
                    className={btnClass}
                />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <div className="toolbar-color-picker">
                    <ToolbarButton
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        icon={<Palette size={18} />}
                        tooltip={t('toolbar.textColor')}
                        className={btnClass}
                    />
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
                    <ToolbarButton
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        icon={<Highlighter size={18} />}
                        tooltip={t('toolbar.highlightColor')}
                        className={btnClass}
                    />
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
                <ToolbarButton
                    onClick={addImage}
                    icon={<ImageIcon size={18} />}
                    tooltip={t('toolbar.image')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={addTable}
                    icon={<TableIcon size={18} />}
                    tooltip={t('toolbar.table')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    icon={<Minus size={18} />}
                    tooltip={t('toolbar.horizontalRule')}
                    className={btnClass}
                />
            </div>
        </div>
    );
};

export default EditorToolbar;
