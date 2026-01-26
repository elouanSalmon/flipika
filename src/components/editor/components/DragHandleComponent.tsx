import React from 'react';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
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
        <DragHandle
            editor={editor}
            pluginKey="dragHandle"
        >
            <div className="drag-handle-button">
                <GripVertical size={18} />
            </div>
        </DragHandle>
    );
};
