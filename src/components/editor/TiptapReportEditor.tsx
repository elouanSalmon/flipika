import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { DataBlockExtension } from './extensions/DataBlockExtension';
import { SlashCommandExtension } from './extensions/SlashCommandExtension';
import { SlideExtension } from './extensions/SlideExtension';
import { SlideDocument } from './extensions/SlideDocument';
import { SlideNavigation } from './components/SlideNavigation';
import { ChartBlockSelector } from './ChartBlockSelector';
import { TiptapToolbar } from './TiptapToolbar';
import { ReportEditorProvider } from '../../contexts/ReportEditorContext';
import type { ReportDesign } from '../../types/reportTypes';
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

    return (
        <ReportEditorProvider
            design={design || null}
            accountId={accountId}
            campaignIds={campaignIds}
            reportId={reportId}
        >
            <div className="tiptap-slide-editor-layout">
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
