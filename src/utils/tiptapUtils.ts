import type { TiptapJSONContent } from '../types/templateTypes';

/**
 * Count the number of data blocks (slides) in Tiptap content
 * Data blocks represent the actual report slides (charts, metrics, etc.)
 * Recursively searches through the content tree to find all dataBlock nodes
 */
export function countTiptapSlides(content: TiptapJSONContent | null | undefined): number {
    if (!content) return 0;

    let count = 0;

    // Recursive function to traverse the content tree
    function traverse(node: any): void {
        if (!node) return;

        // Count if this node is a dataBlock
        if (node.type === 'dataBlock') {
            count++;
        }

        // Recursively traverse child nodes
        if (Array.isArray(node.content)) {
            node.content.forEach((child: any) => traverse(child));
        }
    }

    traverse(content);
    return count;
}
