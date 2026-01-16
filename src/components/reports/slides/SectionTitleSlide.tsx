import React from 'react';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';

interface SectionTitleSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    editable?: boolean;
}

const SectionTitleSlide: React.FC<SectionTitleSlideProps> = ({
    config,
    design,
}) => {
    // Default placeholders if content is missing
    const title = config.title || 'Titre de la section';
    const subtitle = config.subtitle || '';

    return (
        <div
            className="section-title-slide flex flex-col items-center justify-center h-full min-h-[300px] w-full p-12 text-center"
            style={{
                backgroundColor: design?.colorScheme?.primary || '#3b82f6', // Use primary color as background for impact
                color: '#ffffff', // Always white text on primary background
            }}
        >
            <h1
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{
                    fontFamily: design.typography.headingFontFamily,
                }}
            >
                {title}
            </h1>
            {subtitle && (
                <div
                    className="text-xl md:text-2xl opacity-90 max-w-3xl"
                    style={{
                        fontFamily: design.typography.fontFamily,
                    }}
                >
                    {subtitle}
                </div>
            )}
        </div>
    );
};

export default SectionTitleSlide;
