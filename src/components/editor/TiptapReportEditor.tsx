import React, { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Typography } from '@tiptap/extension-typography';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { DragHandle } from '@tiptap/extension-drag-handle';
import { DataBlockExtension } from './extensions/DataBlockExtension';
import { SlashCommandExtension } from './extensions/SlashCommandExtension';
import { ColumnGroup, Column } from './extensions/ColumnsExtension';
import { SlideExtension } from './extensions/SlideExtension';
import { SlideDocument } from './extensions/SlideDocument';
import { SlideNavigation } from './components/SlideNavigation';
import { TableBubbleMenu } from './components/TableBubbleMenu';
import { TextBubbleMenu } from './components/TextBubbleMenu';
import { ChartBlockSelector } from './ChartBlockSelector';
import { TiptapToolbar } from './TiptapToolbar';
import { ReportEditorProvider } from '../../contexts/ReportEditorContext';
import type { ReportDesign } from '../../types/reportTypes';
import type { Client } from '../../types/client';
import './TiptapEditor.css';
import { MediaManagerModal } from './media/MediaManagerModal';
import { AiAssistantPanel } from './AiAssistantPanel';
import { useState } from 'react';

interface TiptapReportEditorProps {
    content?: unknown;
    onChange?: (content: unknown) => void;
    editable?: boolean;
    placeholder?: string;
    design?: ReportDesign;
    accountId?: string;
    campaignIds?: string[];
    reportId?: string;
    clientId?: string;
    client?: Client | null;
    userId?: string;
    isTemplateMode?: boolean;
    startDate?: Date;
    endDate?: Date;
    onOpenSettings?: () => void;
}

export const TiptapReportEditor: React.FC<TiptapReportEditorProps> = ({
    content,
    onChange,
    editable = true,
    placeholder = 'Commencez à écrire... (tapez "/" pour insérer un bloc)',
    design,
    accountId = '',
    campaignIds = [],
    reportId,
    clientId,
    client,
    userId,
    isTemplateMode = false,
    startDate,
    endDate,
    onOpenSettings,
}) => {
    const [showMediaManager, setShowMediaManager] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);

    const defaultContent = {
        type: 'doc',
        content: [
            {
                type: 'slide',
                attrs: { id: 'slide-1', layout: 'content' },
                // backgroundColor is null by default = use theme color
                content: [{ type: 'paragraph' }],
            },
        ],
    };

    const extensions = useMemo(() => [
        // Custom document that only accepts slides at top level
        SlideDocument,
        // StarterKit but disable document (we use SlideDocument) and extensions we add manually
        StarterKit.configure({
            document: false,
            heading: { levels: [1, 2, 3] },
            // Disable extensions that we configure separately below
            link: false,
            underline: false,
        }),
        Placeholder.configure({
            placeholder: ({ node }) => {
                if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                    return '';
                }
                return placeholder;
            },
            emptyEditorClass: 'is-editor-empty',
            emptyNodeClass: 'is-node-empty',
            includeChildren: true,
            showOnlyCurrent: false,
        }),
        // Text formatting extensions
        Underline,
        Highlight.configure({
            multicolor: false,
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right'],
            defaultAlignment: 'left',
        }),
        Subscript,
        Superscript,
        // Text styling (required for Color)
        TextStyle,
        Color,
        // Link extension
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'tiptap-link',
            },
        }),
        // Image extension
        Image.configure({
            inline: true,
            allowBase64: true,
            HTMLAttributes: {
                class: 'tiptap-image',
            },
        }),
        // Typography improvements (smart quotes, dashes, etc.)
        Typography,
        // Character count
        CharacterCount,
        // Custom extensions
        SlideExtension,
        DataBlockExtension,
        SlashCommandExtension,
        ColumnGroup,
        Column,
        // Table extensions
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        // Drag Handle - allows dragging content blocks and slides
        DragHandle.configure({
            // Configure which nodes can be dragged (exclude atomic/leaf nodes)

            render: () => {
                const div = document.createElement('div');
                div.className = 'custom-drag-handle';
                div.innerHTML = `<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="5" cy="4" r="1.5"/>
                    <circle cx="5" cy="8" r="1.5"/>
                    <circle cx="5" cy="12" r="1.5"/>
                    <circle cx="11" cy="4" r="1.5"/>
                    <circle cx="11" cy="8" r="1.5"/>
                    <circle cx="11" cy="12" r="1.5"/>
                </svg>`;
                return div;
            },
        }),
    ], [placeholder]);

    const editor = useEditor({
        extensions,
        content: content || defaultContent,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getJSON());
        },
    });

    if (!editor) {
        return null;
    }

    const handleInsertImage = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
        setShowMediaManager(false);
    };

    // Listen for slash command event
    // Using useEffect to bind the event listener
    React.useEffect(() => {
        const handleOpenLibrary = () => setShowMediaManager(true);
        const handleToggleAi = () => setShowAiPanel(prev => !prev);

        window.addEventListener('flipika:open-media-library', handleOpenLibrary);
        window.addEventListener('flipika:toggle-ai-panel', handleToggleAi);

        return () => {
            window.removeEventListener('flipika:open-media-library', handleOpenLibrary);
            window.removeEventListener('flipika:toggle-ai-panel', handleToggleAi);
        };
    }, []);

    // Calculate highlight colors based on theme
    const highlightColor = design?.mode === 'dark'
        ? (design?.colorScheme?.accent ? `${design.colorScheme.accent}4D` : 'rgba(253, 224, 71, 0.3)') // Yellow-300 with opacity or accent
        : (design?.colorScheme?.accent ? `${design.colorScheme.accent}33` : '#fef08a'); // Yellow-200 or accent light

    const highlightTextColor = design?.mode === 'dark'
        ? (design?.colorScheme?.text || '#f8fafc')
        : '#1e293b'; // Dark text on light highlight usually better

    // Get fonts from theme
    const fontFamily = design?.typography?.fontFamily || 'Inter, sans-serif';
    const headingFontFamily = design?.typography?.headingFontFamily || fontFamily;

    return (
        <ReportEditorProvider
            design={design || null}
            accountId={accountId}
            campaignIds={campaignIds}
            reportId={reportId}
            clientId={clientId}
            client={client}
            userId={userId}
            isTemplateMode={isTemplateMode}
            startDate={startDate}
            endDate={endDate}
            onOpenSettings={onOpenSettings}
        >
            <div
                className="tiptap-slide-editor-layout"
                style={{
                    '--highlight-color': highlightColor,
                    '--highlight-text-color': highlightTextColor,
                    '--font-family': fontFamily,
                    '--heading-font-family': headingFontFamily,
                } as React.CSSProperties}
            >
                {/* Left Sidebar - Slide Navigation */}
                <SlideNavigation editor={editor} />

                {/* Main Editor Area */}
                <div className="tiptap-editor-main">
                    <TiptapToolbar
                        editor={editor}
                        onOpenMediaLibrary={() => setShowMediaManager(true)}
                    />
                    <div className="tiptap-editor-content slide-editor-container">
                        <EditorContent editor={editor} />
                        <TableBubbleMenu editor={editor} />
                        <TextBubbleMenu editor={editor} />
                    </div>
                    {/* Floating Chart Selector */}
                    <ChartBlockSelector editor={editor} />

                    {/* Media Manager */}
                    <MediaManagerModal
                        isOpen={showMediaManager}
                        onClose={() => setShowMediaManager(false)}
                        onSelectImage={handleInsertImage}
                    />

                    {/* AI Assistant Panel */}
                    <AiAssistantPanel
                        editor={editor}
                        isOpen={showAiPanel}
                        onClose={() => setShowAiPanel(false)}
                    />
                </div>
            </div>
        </ReportEditorProvider>
    );
};
