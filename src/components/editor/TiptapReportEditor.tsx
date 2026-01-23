import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { DataBlockExtension } from './extensions/DataBlockExtension';
import { SlashCommandExtension } from './extensions/SlashCommandExtension';
import { SlideExtension } from './extensions/SlideExtension';
import { SlideDocument } from './extensions/SlideDocument';
import { SlideNavigation } from './components/SlideNavigation';
import { ChartBlockSelector } from './ChartBlockSelector';
import { TiptapToolbar } from './TiptapToolbar';
import { ReportEditorProvider } from '../../contexts/ReportEditorContext';
import type { ReportDesign } from '../../types/reportTypes';
import type { Client } from '../../types/client';
import './TiptapEditor.css';

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
    onOpenSettings,
}) => {
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

    const editor = useEditor({
        extensions: [
            // Custom document that only accepts slides at top level
            SlideDocument,
            // StarterKit but disable document (we use SlideDocument)
            StarterKit.configure({
                document: false,
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
                emptyNodeClass: 'is-node-empty',
                includeChildren: true,
                showOnlyCurrent: false,
            }),
            // Additional text formatting extensions
            Underline,
            Highlight.configure({
                multicolor: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'tiptap-link',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right'],
                defaultAlignment: 'left',
            }),
            SlideExtension,
            DataBlockExtension,
            SlashCommandExtension,
        ],
        content: content || defaultContent,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getJSON());
        },
    });

    if (!editor) {
        return null;
    }

    // Calculate highlight colors based on theme
    const highlightColor = design?.mode === 'dark'
        ? (design?.colorScheme?.accent ? `${design.colorScheme.accent}4D` : 'rgba(253, 224, 71, 0.3)') // Yellow-300 with opacity or accent
        : (design?.colorScheme?.accent ? `${design.colorScheme.accent}33` : '#fef08a'); // Yellow-200 or accent light

    const highlightTextColor = design?.mode === 'dark'
        ? (design?.colorScheme?.text || '#f8fafc')
        : '#1e293b'; // Dark text on light highlight usually better

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
            onOpenSettings={onOpenSettings}
        >
            <div
                className="tiptap-slide-editor-layout"
                style={{
                    '--highlight-color': highlightColor,
                    '--highlight-text-color': highlightTextColor,
                } as React.CSSProperties}
            >
                {/* Left Sidebar - Slide Navigation */}
                <SlideNavigation editor={editor} />

                {/* Main Editor Area */}
                <div className="tiptap-editor-main">
                    <TiptapToolbar editor={editor} />
                    <div className="tiptap-editor-content slide-editor-container">
                        <EditorContent editor={editor} />
                    </div>
                    {/* Floating Chart Selector */}
                    <ChartBlockSelector editor={editor} />
                </div>
            </div>
        </ReportEditorProvider>
    );
};
