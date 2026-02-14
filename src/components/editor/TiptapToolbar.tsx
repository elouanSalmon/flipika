import React, { useState, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { ToolbarButton } from '../common/ToolbarButton';
import { Tooltip } from '../common/Tooltip';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Highlighter,
    Link,
    Link2Off,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo,
    Table as TableIcon,
    Columns2,
    Image as ImageIcon,
    Sparkles,
    Loader2,
    Braces,
} from 'lucide-react';

interface TiptapToolbarProps {
    editor: Editor;
    onOpenMediaLibrary?: () => void;
}

export const TiptapToolbar: React.FC<TiptapToolbarProps> = ({ editor, onOpenMediaLibrary }) => {
    const { t } = useTranslation('reports');
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // Listen for AI generation start/end events
    useEffect(() => {
        const handleGenerationStart = () => setIsAiGenerating(true);
        const handleGenerationEnd = () => setIsAiGenerating(false);

        window.addEventListener('flipika:ai-generation-start', handleGenerationStart);
        window.addEventListener('flipika:ai-generation-end', handleGenerationEnd);

        return () => {
            window.removeEventListener('flipika:ai-generation-start', handleGenerationStart);
            window.removeEventListener('flipika:ai-generation-end', handleGenerationEnd);
        };
    }, []);

    const setLink = useCallback(() => {
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
            ? linkUrl
            : `https://${linkUrl}`;

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();

        setLinkUrl('');
        setShowLinkInput(false);
    }, [editor, linkUrl]);

    const handleLinkClick = () => {
        const previousUrl = editor.getAttributes('link').href || '';
        setLinkUrl(previousUrl);
        setShowLinkInput(true);
    };

    const removeLink = () => {
        editor.chain().focus().unsetLink().run();
        setShowLinkInput(false);
        setLinkUrl('');
    };

    const btnClass = "tiptap-toolbar-btn";

    return (
        <div className="tiptap-toolbar">
            {/* Undo/Redo */}
            <div className="tiptap-toolbar-group">
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

            <div className="tiptap-toolbar-separator" />

            {/* Headings */}
            <div className="tiptap-toolbar-group">
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

            <div className="tiptap-toolbar-separator" />

            {/* Text Formatting */}
            <div className="tiptap-toolbar-group relative">
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
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    icon={<Underline size={18} />}
                    tooltip={t('toolbar.underline')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon={<Strikethrough size={18} />}
                    tooltip={t('toolbar.strike')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    icon={<Code size={18} />}
                    tooltip={t('toolbar.code')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    icon={<Highlighter size={18} />}
                    tooltip={t('toolbar.highlight')}
                    className={btnClass}
                />

                <div className="relative flex items-center gap-1">
                    <ToolbarButton
                        onClick={handleLinkClick}
                        isActive={editor.isActive('link')}
                        icon={<Link size={18} />}
                        tooltip={t('toolbar.link')}
                        className={btnClass}
                    />
                    {editor.isActive('link') && (
                        <ToolbarButton
                            onClick={removeLink}
                            icon={<Link2Off size={18} />}
                            tooltip={t('toolbar.unlink')}
                            className={btnClass}
                        />
                    )}

                    {/* Link Input Popup */}
                    {showLinkInput && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowLinkInput(false)}
                            />
                            <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-black rounded-lg shadow-lg border border-neutral-200 dark:border-white/10 p-3 min-w-[280px]">
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://exemple.com"
                                        className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-white/10 rounded-lg bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                setLink();
                                            }
                                            if (e.key === 'Escape') {
                                                setShowLinkInput(false);
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={setLink}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="tiptap-toolbar-separator" />

            {/* Text Alignment */}
            <div className="tiptap-toolbar-group">
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
            </div>

            <div className="tiptap-toolbar-separator" />

            {/* Lists */}
            <div className="tiptap-toolbar-group">
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

            <div className="tiptap-toolbar-separator" />

            <div className="tiptap-toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    icon={<TableIcon size={18} />}
                    tooltip={t('toolbar.table')}
                    className={btnClass}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().insertContent({
                        type: 'columnGroup',
                        content: [
                            { type: 'column', content: [{ type: 'paragraph' }] },
                            { type: 'column', content: [{ type: 'paragraph' }] },
                        ],
                    }).run()}
                    icon={<Columns2 size={18} />}
                    tooltip={t('toolbar.columns')}
                    className={btnClass}
                />
            </div>

            <div className="tiptap-toolbar-separator" />

            {/* Dynamic Variables */}
            <div className="tiptap-toolbar-group">
                <ToolbarButton
                    onClick={() => {
                        // Insert '[' to trigger variable suggestion menu
                        editor.chain().focus().insertContent('[').run();
                    }}
                    icon={<Braces size={18} />}
                    tooltip={t('toolbar.insertVariable')}
                    className={btnClass}
                />
            </div>

            <div className="tiptap-toolbar-separator" />

            {/* Link */}
            <div className="tiptap-toolbar-group relative">
                {/* Media Library Button */}
                {onOpenMediaLibrary && (
                    <>
                        <ToolbarButton
                            onClick={onOpenMediaLibrary}
                            icon={<ImageIcon size={18} />}
                            tooltip={t('toolbar.image')}
                            className={btnClass}
                        />
                        <div className="mx-1 w-px bg-neutral-200 dark:bg-black h-6 self-center" />
                    </>
                )}

                {/* AI Generate All Button */}
                <Tooltip content={t('toolbar.generateAllAnalyses')}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsAiGenerating(true);
                            window.dispatchEvent(new CustomEvent('flipika:generate-all-analyses'));
                            // Auto-stop animation after 10s max (fallback)
                            setTimeout(() => setIsAiGenerating(false), 10000);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={isAiGenerating}
                        className={`tiptap-toolbar-btn ${isAiGenerating ? 'is-active' : ''}`}
                        type="button"
                    >
                        {isAiGenerating ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                    </button>
                </Tooltip>


            </div>
        </div>
    );
};
