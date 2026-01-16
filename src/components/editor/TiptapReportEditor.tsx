import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { DataBlockExtension } from './extensions/DataBlockExtension';
import { SlashCommandExtension } from './extensions/SlashCommandExtension';
import { SlideExtension } from './extensions/SlideExtension';
import { SlideDocument } from './extensions/SlideDocument';
import { TiptapToolbar } from './TiptapToolbar';
import type { ReportDesign } from '../../types/reportTypes';
import './TiptapEditor.css';

interface TiptapReportEditorProps {
    content?: any; // JSONContent from Tiptap
    onChange?: (content: any) => void;
    editable?: boolean;
    placeholder?: string;
    design?: ReportDesign;
}

export const TiptapReportEditor: React.FC<TiptapReportEditorProps> = ({
    content,
    onChange,
    editable = true,
    placeholder = 'Commencez à écrire votre rapport... (tapez "/" pour insérer un bloc)',
    design,
}) => {
    const editor = useEditor({
        extensions: [
            SlideDocument, // Custom document that only accepts slides
            StarterKit.configure({
                document: false, // Disable default document
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
            SlideExtension.configure({
                design, // Pass design to slides
            }),
            DataBlockExtension.configure({
                design, // Pass design to extension
            }),
            SlashCommandExtension, // Slash command menu
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

    // Initialize with one slide if editor is empty
    useEffect(() => {
        if (editor && !content) {
            editor.commands.setContent({
                type: 'doc',
                content: [
                    {
                        type: 'slide',
                        attrs: {
                            layout: 'content',
                            backgroundColor: '#ffffff',
                        },
                        content: [
                            {
                                type: 'paragraph',
                            },
                        ],
                    },
                ],
            });
        }
    }, [editor, content]);

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
