import Document from '@tiptap/extension-document';

/**
 * Custom Document Extension for Slide Editor
 * 
 * Replaces the default document to only accept slides as top-level content.
 */
export const SlideDocument = Document.extend({
    content: 'slide+', // Document can only contain slides
});
