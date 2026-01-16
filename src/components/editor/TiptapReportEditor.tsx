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
    content?: unknown;
    onChange?: (content: unknown) => void;
    editable?: boolean;
    placeholder?: string;
    design?: ReportDesign;
}

export const TiptapReportEditor: React.FC<TiptapReportEditorProps> = ({
    content,
    onChange,
    editable = true,
    placeholder = 'Commencez à écrire... (tapez "/" pour insérer un bloc)',
}) => {
    const defaultContent = {
        type: 'doc',
        content: [
            {
                type: 'slide',
                attrs: { id: 'slide-1', layout: 'content', backgroundColor: '#ffffff' },
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
        <div className="tiptap-editor-container slide-editor-container">
            <TiptapToolbar editor={editor} />
            <div className="tiptap-editor-content">
                <EditorContent editor={editor} />
            </div>

            {/* Add Slide Button */}
            <div className="add-slide-container">
                <button
                    onClick={() => editor.commands.insertSlide()}
                    className="add-slide-btn"
                >
                    + Ajouter une slide
                </button>
            </div>
        </div>
    );
};
