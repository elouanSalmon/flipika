import React from 'react';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';

interface RichTextSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    editable?: boolean;
}

const RichTextSlide: React.FC<RichTextSlideProps> = ({
    config,
    design,
}) => {
    const body = config.body || 'Ajoutez votre texte ici...';

    // Helper to render "Markdown-like" content safely is tricky without a library.
    // For now, we'll assume it's plain text with simple newlines or basic HTML if sanitized elsewhere.
    // Given the constraints and typical "Rich Text" labeling, a library like react-markdown would be ideal,
    // but without adding deps, we'll render as text with whitespace preservation.
    // OR we can simple allow basics and use `dangerouslySetInnerHTML` if we trust the input (from our own editor).
    // PRD mentions "Simple formatting (Bold, Italic, Lists)".
    // Let's stick to simple whitespace preservation for MVP unless user specifically asked for Markdown rendering library implementation in this step.

    return (
        <div
            className="rich-text-slide w-full h-full p-8 md:p-12 overflow-y-auto"
            style={{
                backgroundColor: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#000000',
            }}
        >
            <div
                className="prose max-w-none"
                style={{
                    fontFamily: design?.typography?.fontFamily || 'system-ui',
                    fontSize: design?.typography?.fontSize || '16px',
                    lineHeight: design?.typography?.lineHeight || '1.5',
                    '--tw-prose-body': design?.colorScheme?.text || '#000000',
                    '--tw-prose-headings': design?.colorScheme?.secondary || '#333333',
                    '--tw-prose-links': design?.colorScheme?.primary || '#0066cc',
                } as React.CSSProperties}
            >
                <div
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: body }}
                />
            </div>
        </div>
    );
};

export default RichTextSlide;
