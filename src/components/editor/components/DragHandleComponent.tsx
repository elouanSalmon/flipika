import React from 'react';
import { DragHandleReact } from '@tiptap/extension-drag-handle-react';
import type { Editor } from '@tiptap/react';
import { GripVertical } from 'lucide-react';

interface DragHandleComponentProps {
    editor: Editor;
}

/**
 * DragHandle Component for Tiptap Editor
 *
 * Allows dragging and reordering of content blocks (paragraphs, headings, lists, etc.)
 * and entire slides within the editor.
 */
export const DragHandleComponent: React.FC<DragHandleComponentProps> = ({ editor }) => {
    return (
        <DragHandleReact
            editor={editor}
            pluginKey="dragHandle"
            tippyOptions={{
                placement: 'left',
                offset: [-2, 16],
                zIndex: 99,
                duration: 0,
            }}
        >
            <div className="drag-handle-button">
                <GripVertical size={18} />
            </div>
        </DragHandleReact>
    );
};
