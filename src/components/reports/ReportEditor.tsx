import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import EditorToolbar from './EditorToolbar';
import './ReportEditor.css';

interface ReportEditorProps {
    content: JSONContent;
    onChange: (content: JSONContent) => void;
    editable?: boolean;
    placeholder?: string;
}

const ReportEditor: React.FC<ReportEditorProps> = ({
    content,
    onChange,
    editable = true,
    placeholder = 'Commencez à écrire votre rapport...',
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Color,
            TextStyle,
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: 'report-editor-content',
                'data-placeholder': placeholder,
            },
        },
    });

    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            const currentContent = editor.getJSON();
            if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="report-editor">
            {editable && <EditorToolbar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
};

export default ReportEditor;
