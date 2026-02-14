import React, { useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
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
import { DynamicVariableExtension } from './extensions/DynamicVariableExtension';
import { SlideNavigation } from './components/SlideNavigation';
import { TableBubbleMenu } from './components/TableBubbleMenu';
import { TextBubbleMenu } from './components/TextBubbleMenu';
import { ChartBlockSelector } from './ChartBlockSelector';
import { TiptapToolbar } from './TiptapToolbar';
import { ReportEditorProvider } from '../../contexts/ReportEditorContext';
import { FontProvider } from '../../contexts/FontContext';
import type { ReportDesign } from '../../types/reportTypes';
import type { Client } from '../../types/client';
import './TiptapEditor.css';
import { MediaManagerModal } from './media/MediaManagerModal';
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
    reportTitle?: string;
    clientId?: string;
    client?: Client | null;
    userId?: string;
    userName?: string;
    userEmail?: string;
    userCompany?: string;
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
    reportTitle,
    clientId,
    client,
    userId,
    userName,
    userEmail,
    userCompany,
    isTemplateMode = false,
    startDate,
    endDate,
    onOpenSettings,
}) => {
    const [showMediaManager, setShowMediaManager] = useState(false);

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
        DynamicVariableExtension,
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
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getJSON());
        },
    });

    const { t } = useTranslation('reports');

    // Handle "Generate All Analyses" for all data blocks
    const handleGenerateAllAnalyses = useCallback(async () => {
        if (!editor) return;

        // Find all dataBlock nodes in the document
        const dataBlocks: { pos: number; node: any }[] = [];
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'dataBlock') {
                dataBlocks.push({ pos, node });
            }
        });

        if (dataBlocks.length === 0) {
            toast.error(t('toolbar.noDataBlocks', 'No data blocks found'));
            return;
        }

        // Filter to blocks without description (or all if user wants)
        const blocksToProcess = dataBlocks.filter(({ node }) => !node.attrs.config?.description);

        if (blocksToProcess.length === 0) {
            toast.success(t('toolbar.allBlocksHaveAnalysis', 'All blocks already have analyses'));
            return;
        }

        const blockCount = blocksToProcess.length;
        toast.loading(t('toolbar.generatingAll'), { id: 'generate-all' });

        // Dispatch event to trigger generation in each block
        window.dispatchEvent(new CustomEvent('flipika:request-all-analyses', {
            detail: { blockCount }
        }));

        toast.success(
            t('toolbar.generationStarted', { count: blockCount }) || `Generation started for ${blockCount} blocks`,
            { id: 'generate-all' }
        );
    }, [editor, t]);

    // Insert cover page slide with dynamic variables
    const handleInsertCoverPage = useCallback(() => {
        if (!editor) return;

        const preparedFor = t('coverPage.preparedFor', 'Préparé pour :');
        const preparedBy = t('coverPage.preparedBy', 'Préparé par :');

        // Insert cover page as the first slide in the report
        editor.chain()
            .insertContentAt(0, {
                type: 'slide',
                attrs: {
                    id: `slide-cover-${Date.now()}`,
                    layout: 'content',
                    backgroundColor: design?.colorScheme?.primary || '#1963d5',
                },
                content: [
                    // Client Logo at the top (using dynamic variable)
                    {
                        type: 'paragraph',
                        attrs: { textAlign: 'center' },
                        content: [
                            {
                                type: 'dynamicVariable',
                                attrs: { id: 'clientLogo', label: 'Logo Client' },
                            },
                        ],
                    },
                    // Small spacer
                    { type: 'paragraph', content: [] },
                    // Main title - using dynamic variable
                    {
                        type: 'heading',
                        attrs: { level: 1, textAlign: 'center' },
                        content: [
                            {
                                type: 'dynamicVariable',
                                attrs: { id: 'reportTitle', label: 'Titre du rapport' },
                            },
                        ],
                    },
                    // Date range - using dynamic variable
                    {
                        type: 'paragraph',
                        attrs: { textAlign: 'center' },
                        content: [
                            {
                                type: 'dynamicVariable',
                                attrs: { id: 'dateRange', label: 'Periode' },
                            },
                        ],
                    },
                    // Spacer for visual balance
                    { type: 'paragraph', content: [] },
                    { type: 'paragraph', content: [] },
                    // Two columns for prepared for/by with dynamic variables
                    {
                        type: 'columnGroup',
                        content: [
                            {
                                type: 'column',
                                content: [
                                    {
                                        type: 'paragraph',
                                        attrs: { textAlign: 'left' },
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    { type: 'bold' },
                                                    { type: 'textStyle', attrs: { color: '#ffffff' } },
                                                ],
                                                text: preparedFor,
                                            },
                                        ],
                                    },
                                    {
                                        type: 'paragraph',
                                        attrs: { textAlign: 'left' },
                                        content: [
                                            {
                                                type: 'dynamicVariable',
                                                attrs: { id: 'clientName', label: 'Nom du client' },
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'column',
                                content: [
                                    {
                                        type: 'paragraph',
                                        attrs: { textAlign: 'right' },
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    { type: 'bold' },
                                                    { type: 'textStyle', attrs: { color: '#ffffff' } },
                                                ],
                                                text: preparedBy,
                                            },
                                        ],
                                    },
                                    {
                                        type: 'paragraph',
                                        attrs: { textAlign: 'right' },
                                        content: [
                                            {
                                                type: 'dynamicVariable',
                                                attrs: { id: 'userName', label: 'Votre nom' },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
            .focus()
            .run();

        toast.success(t('coverPage.inserted', 'Page de garde ajoutee'));
    }, [editor, design, t]);

    // Insert conclusion page slide with dynamic variables
    const handleInsertConclusionPage = useCallback(() => {
        if (!editor) return;

        const thankYouMessage = t('conclusionPage.thankYou', 'Merci de votre lecture !');
        const contactPrompt = t('conclusionPage.contactPrompt', 'Pour toute question, n\'hesitez pas a nous contacter :');

        // Insert a new slide with conclusion page content using dynamic variables
        const endPos = editor.state.doc.content.size;
        editor.chain()
            .insertContentAt(endPos, {
                type: 'slide',
                attrs: {
                    id: `slide-conclusion-${Date.now()}`,
                    layout: 'content',
                    backgroundColor: design?.colorScheme?.primary || '#1963d5',
                },
                content: [
                    // Spacers at top for visual balance
                    { type: 'paragraph', content: [] },
                    { type: 'paragraph', content: [] },
                    { type: 'paragraph', content: [] },
                    { type: 'paragraph', content: [] },
                    // Main thank you message - centered
                    {
                        type: 'heading',
                        attrs: { level: 1, textAlign: 'center' },
                        content: [
                            {
                                type: 'text',
                                marks: [{ type: 'textStyle', attrs: { color: '#ffffff' } }],
                                text: thankYouMessage,
                            },
                        ],
                    },
                    // Spacer
                    { type: 'paragraph', content: [] },
                    { type: 'paragraph', content: [] },
                    // Contact prompt - centered
                    {
                        type: 'paragraph',
                        attrs: { textAlign: 'center' },
                        content: [
                            {
                                type: 'text',
                                marks: [{ type: 'textStyle', attrs: { color: '#ffffff' } }],
                                text: contactPrompt,
                            },
                        ],
                    },
                    // Email - centered, using dynamic variable
                    {
                        type: 'paragraph',
                        attrs: { textAlign: 'center' },
                        content: [
                            {
                                type: 'dynamicVariable',
                                attrs: { id: 'userEmail', label: 'Email' },
                            },
                        ],
                    },
                ],
            })
            .focus()
            .run();

        toast.success(t('conclusionPage.inserted', 'Page de conclusion ajoutee'));
    }, [editor, design, t]);

    // Listen for custom events
    React.useEffect(() => {
        const handleOpenLibrary = () => setShowMediaManager(true);
        const handleGenerateAll = () => handleGenerateAllAnalyses();
        const handleCoverPage = () => handleInsertCoverPage();
        const handleConclusionPage = () => handleInsertConclusionPage();

        window.addEventListener('flipika:open-media-library', handleOpenLibrary);
        window.addEventListener('flipika:generate-all-analyses', handleGenerateAll);
        window.addEventListener('flipika:insert-cover-page', handleCoverPage);
        window.addEventListener('flipika:insert-conclusion-page', handleConclusionPage);

        return () => {
            window.removeEventListener('flipika:open-media-library', handleOpenLibrary);
            window.removeEventListener('flipika:generate-all-analyses', handleGenerateAll);
            window.removeEventListener('flipika:insert-cover-page', handleCoverPage);
            window.removeEventListener('flipika:insert-conclusion-page', handleConclusionPage);
        };
    }, [handleGenerateAllAnalyses, handleInsertCoverPage, handleInsertConclusionPage]);

    if (!editor) {
        return null;
    }

    const handleInsertImage = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
        setShowMediaManager(false);
    };

    // Calculate highlight colors based on theme
    const highlightColor = design?.mode === 'dark'
        ? (design?.colorScheme?.accent ? `${design.colorScheme.accent}4D` : 'rgba(253, 224, 71, 0.3)') // Yellow-300 with opacity or accent
        : (design?.colorScheme?.accent ? `${design.colorScheme.accent}33` : '#fef08a'); // Yellow-200 or accent light

    const highlightTextColor = design?.mode === 'dark'
        ? (design?.colorScheme?.text || '#f8fafc')
        : '#0a0a0a'; // Dark text on light highlight usually better

    // Get fonts from theme
    const fontFamily = design?.typography?.fontFamily || 'DM Sans, sans-serif';
    const headingFontFamily = design?.typography?.headingFontFamily || fontFamily;

    return (
        <FontProvider
            fontFamily={fontFamily}
            headingFontFamily={headingFontFamily}
        >
            <ReportEditorProvider
                design={design || null}
                accountId={accountId}
                campaignIds={campaignIds}
                reportId={reportId}
                reportTitle={reportTitle}
                clientId={clientId}
                client={client}
                userId={userId}
                userName={userName}
                userEmail={userEmail}
                userCompany={userCompany}
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

                    </div>
                </div>
            </ReportEditorProvider>
        </FontProvider>
    );
};
