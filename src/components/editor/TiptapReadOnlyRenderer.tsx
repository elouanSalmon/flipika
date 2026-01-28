import { useEditor, EditorContent } from '@tiptap/react';
import React, { useMemo } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { SlideDocument } from './extensions/SlideDocument';
import { SlideExtension } from './extensions/SlideExtension';
import { DataBlockExtension } from './extensions/DataBlockExtension';
import { ColumnGroup, Column } from './extensions/ColumnsExtension';
import { DynamicVariableExtension } from './extensions/DynamicVariableExtension';
import { ReportEditorProvider } from '../../contexts/ReportEditorContext';
import type { ReportDesign } from '../../types/reportTypes';
import type { Client } from '../../types/client';
import type { JSONContent } from '@tiptap/react';
import './TiptapEditor.css';

interface TiptapReadOnlyRendererProps {
    content: JSONContent;
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
    startDate?: Date;
    endDate?: Date;
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
    reportTitle,
    clientId,
    client,
    userId,
    userName,
    userEmail,
    userCompany,
    startDate,
    endDate,
}) => {
    const extensions = useMemo(() => [
        SlideDocument,
        StarterKit.configure({
            document: false,
            heading: { levels: [1, 2, 3] },
            // Disable extensions we configure separately
            underline: false,
        }),
        Highlight.configure({
            multicolor: false,
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right'],
            defaultAlignment: 'left',
        }),
        // Text styling extensions (required for cover/conclusion pages with colored text)
        TextStyle,
        Color,
        Underline,
        Link.configure({
            openOnClick: true, // Allow clicking links in read-only mode
            HTMLAttributes: {
                class: 'tiptap-link',
            },
        }),
        SlideExtension,
        DataBlockExtension,
        DynamicVariableExtension,
        Table.configure({
            resizable: false, // Read-only
        }),
        TableRow,
        TableHeader,
        TableCell,
        ColumnGroup,
        Column,
        Image.configure({
            inline: true,
            allowBase64: true,
            HTMLAttributes: {
                class: 'tiptap-image',
            },
        }),
    ], []);

    const editor = useEditor({
        extensions,
        content,
        editable: false,
        immediatelyRender: false,
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
            reportTitle={reportTitle}
            clientId={clientId}
            client={client}
            userId={userId}
            userName={userName}
            userEmail={userEmail}
            userCompany={userCompany}
            isPublicView={true}
            startDate={startDate}
            endDate={endDate}
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
