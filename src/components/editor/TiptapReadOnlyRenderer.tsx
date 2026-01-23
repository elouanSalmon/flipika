import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { SlideDocument } from './extensions/SlideDocument';
import { SlideExtension } from './extensions/SlideExtension';
import { DataBlockExtension } from './extensions/DataBlockExtension';
import { ColumnGroup, Column } from './extensions/ColumnsExtension';
import { ReportEditorProvider } from '../../contexts/ReportEditorContext';
import type { ReportDesign } from '../../types/reportTypes';
import type { JSONContent } from '@tiptap/react';
import './TiptapEditor.css';

interface TiptapReadOnlyRendererProps {
    content: JSONContent;
    design?: ReportDesign;
    accountId?: string;
    campaignIds?: string[];
    reportId?: string;
    clientId?: string;
    userId?: string;
}

/**
 * Lightweight read-only Tiptap renderer for preview and public views.
 * Uses the same extensions as the editor but without editing capabilities.
 */
export const TiptapReadOnlyRenderer: React.FC<TiptapReadOnlyRendererProps> = ({
    content,
    design,
    accountId = '',
    campaignIds = [],
    reportId,
    clientId,
    userId,
}) => {
    const editor = useEditor({
        extensions: [
            SlideDocument,
            StarterKit.configure({
                document: false,
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Highlight.configure({
                multicolor: false,
            }),
            Link.configure({
                openOnClick: true, // Allow clicking links in read-only mode
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
            Table.configure({
                resizable: false, // Read-only
            }),
            TableRow,
            TableHeader,
            TableCell,
            ColumnGroup,
            Column,
        ],
        content,
        editable: false,
    });

    if (!editor) {
        return null;
    }

    // Calculate highlight colors based on theme
    const highlightColor = design?.mode === 'dark'
        ? (design?.colorScheme?.accent ? `${design.colorScheme.accent}4D` : 'rgba(253, 224, 71, 0.3)')
        : (design?.colorScheme?.accent ? `${design.colorScheme.accent}33` : '#fef08a');

    const highlightTextColor = design?.mode === 'dark'
        ? (design?.colorScheme?.text || '#f8fafc')
        : '#1e293b';

    return (
        <ReportEditorProvider
            design={design || null}
            accountId={accountId}
            campaignIds={campaignIds}
            reportId={reportId}
            clientId={clientId}
            userId={userId}
            isPublicView={true}
        >
            <div
                className="tiptap-readonly-renderer"
                style={{
                    '--highlight-color': highlightColor,
                    '--highlight-text-color': highlightTextColor,
                } as React.CSSProperties}
            >
                <div className="tiptap-editor-content slide-editor-container readonly">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </ReportEditorProvider>
    );
};
