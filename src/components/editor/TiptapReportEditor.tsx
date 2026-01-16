import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TiptapToolbar } from './TiptapToolbar';
import './TiptapEditor.css';

interface TiptapReportEditorProps {
    content?: any; // JSONContent from Tiptap
    onChange?: (content: any) => void;
    editable?: boolean;
    placeholder?: string;
}

export const TiptapReportEditor: React.FC<TiptapReportEditorProps> = ({
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
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content',
            },
        },
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getJSON());
            }
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="tiptap-editor-wrapper">
            {editable && <TiptapToolbar editor={editor} />}
            <EditorContent editor={editor} className="tiptap-editor" />
        </div>
    );
};
