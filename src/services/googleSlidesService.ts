import type {
    GoogleSlidesPresentation,
    FlipikaSlideData,
    CreatePresentationRequest,
    BatchUpdateRequest,
} from '../types/googleSlides';

/**
 * Service for interacting with Google Slides API
 * 
 * Handles:
 * - Creating presentations
 * - Adding slides with content
 * - Mapping Flipika slides to Google Slides layouts
 */

const GOOGLE_SLIDES_API_BASE = 'https://slides.googleapis.com/v1';

export class GoogleSlidesService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    /**
     * Create a new Google Slides presentation
     */
    async createPresentation(title: string): Promise<GoogleSlidesPresentation> {
        const request: CreatePresentationRequest = { title };

        const response = await fetch(`${GOOGLE_SLIDES_API_BASE}/presentations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to create presentation: ${JSON.stringify(error)}`);
        }

        const data = await response.json();

        return {
            presentationId: data.presentationId,
            title: data.title,
            presentationUrl: `https://docs.google.com/presentation/d/${data.presentationId}/edit`,
        };
    }

    /**
     * Add slides to an existing presentation
     */
    async addSlides(
        presentationId: string,
        slides: FlipikaSlideData[]
    ): Promise<void> {
        const requests = slides.flatMap((slide, index) =>
            this.buildSlideRequests(slide, index)
        );

        const batchRequest: BatchUpdateRequest = { requests };

        const response = await fetch(
            `${GOOGLE_SLIDES_API_BASE}/presentations/${presentationId}:batchUpdate`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(batchRequest),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to add slides: ${JSON.stringify(error)}`);
        }
    }

    /**
     * Build batchUpdate requests for a single Flipika slide
     */
    private buildSlideRequests(slide: FlipikaSlideData, index: number): any[] {
        const slideId = `slide_${index}_${Date.now()}`;

        switch (slide.type) {
            case 'section_title':
                return this.buildSectionTitleSlide(slide, slideId, index);
            case 'performance_overview':
                return this.buildPerformanceOverviewSlide(slide, slideId, index);
            case 'key_metrics':
                return this.buildKeyMetricsSlide(slide, slideId, index);
            default:
                // For unsupported types, create empty slide
                return this.buildEmptySlide(slide, slideId, index);
        }
    }

    /**
     * Build Section Title slide (title + subtitle)
     */
    private buildSectionTitleSlide(_slide: FlipikaSlideData, slideId: string, index: number): any[] {
        // const data = slide.data as any;
        // Note: title and subtitle extracted but not used yet
        // Will be implemented when we figure out placeholder IDs
        // const title = data.title || slide.title || 'Sans titre';
        // const subtitle = data.subtitle || '';

        const requests: any[] = [
            // 1. Create slide with TITLE_ONLY layout
            {
                createSlide: {
                    objectId: slideId,
                    slideLayoutReference: {
                        predefinedLayout: 'TITLE_ONLY',
                    },
                    insertionIndex: index + 1,
                },
            },
        ];

        // Note: With predefined layouts, we can't easily add custom text
        // Google Slides API requires us to find the placeholder IDs first
        // For now, we'll create a blank slide and add shapes manually

        return requests;
    }

    /**
     * Build Performance Overview slide (metrics grid)
     */
    private buildPerformanceOverviewSlide(slide: FlipikaSlideData, slideId: string, index: number): any[] {
        const data = slide.data as any;
        const metrics = data.metrics || [];

        const requests: any[] = [
            // 1. Create blank slide
            {
                createSlide: {
                    objectId: slideId,
                    slideLayoutReference: {
                        predefinedLayout: 'BLANK',
                    },
                    insertionIndex: index + 1,
                },
            },
        ];

        // 2. Add title
        const titleId = `${slideId}_title`;
        requests.push({
            createShape: {
                objectId: titleId,
                shapeType: 'TEXT_BOX',
                elementProperties: {
                    pageObjectId: slideId,
                    size: {
                        width: { magnitude: 8000000, unit: 'EMU' }, // ~8.75 inches
                        height: { magnitude: 500000, unit: 'EMU' },
                    },
                    transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: 500000,
                        translateY: 300000,
                        unit: 'EMU',
                    },
                },
            },
        });

        requests.push({
            insertText: {
                objectId: titleId,
                text: 'Vue d\'ensemble des performances',
                insertionIndex: 0,
            },
        });

        requests.push({
            updateTextStyle: {
                objectId: titleId,
                style: {
                    bold: true,
                    fontSize: { magnitude: 24, unit: 'PT' },
                },
                fields: 'bold,fontSize',
            },
        });

        // 3. Add metrics in grid (2x4)
        const metricsToShow = metrics.slice(0, 8); // Max 8 metrics
        const cols = 4;

        const startX = 500000;
        const startY = 1200000;
        const boxWidth = 1800000;
        const boxHeight = 800000;
        const gapX = 100000;
        const gapY = 100000;

        metricsToShow.forEach((metric: any, idx: number) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const metricId = `${slideId}_metric_${idx}`;

            const x = startX + col * (boxWidth + gapX);
            const y = startY + row * (boxHeight + gapY);

            // Create metric box
            requests.push({
                createShape: {
                    objectId: metricId,
                    shapeType: 'TEXT_BOX',
                    elementProperties: {
                        pageObjectId: slideId,
                        size: {
                            width: { magnitude: boxWidth, unit: 'EMU' },
                            height: { magnitude: boxHeight, unit: 'EMU' },
                        },
                        transform: {
                            scaleX: 1,
                            scaleY: 1,
                            translateX: x,
                            translateY: y,
                            unit: 'EMU',
                        },
                    },
                },
            });

            // Add text: label + value
            const text = `${metric.label || metric.name}\n${metric.formatted || metric.value}`;
            requests.push({
                insertText: {
                    objectId: metricId,
                    text,
                    insertionIndex: 0,
                },
            });

            // Style: label smaller, value larger
            requests.push({
                updateTextStyle: {
                    objectId: metricId,
                    style: {
                        fontSize: { magnitude: 14, unit: 'PT' },
                    },
                    fields: 'fontSize',
                    textRange: {
                        type: 'ALL',
                    },
                },
            });
        });

        return requests;
    }

    /**
     * Build Key Metrics slide (4 main metrics)
     */
    private buildKeyMetricsSlide(slide: FlipikaSlideData, slideId: string, index: number): any[] {
        const data = slide.data as any;

        // Extract 4 key metrics
        const metrics = [
            data.cost || { label: 'Dépenses', formatted: 'N/A' },
            data.revenue || { label: 'Revenus', formatted: 'N/A' },
            data.roas || { label: 'ROAS', formatted: 'N/A' },
            data.cpa || { label: 'CPA', formatted: 'N/A' },
        ];

        const requests: any[] = [
            // 1. Create blank slide
            {
                createSlide: {
                    objectId: slideId,
                    slideLayoutReference: {
                        predefinedLayout: 'BLANK',
                    },
                    insertionIndex: index + 1,
                },
            },
        ];

        // 2. Add title
        const titleId = `${slideId}_title`;
        requests.push({
            createShape: {
                objectId: titleId,
                shapeType: 'TEXT_BOX',
                elementProperties: {
                    pageObjectId: slideId,
                    size: {
                        width: { magnitude: 8000000, unit: 'EMU' },
                        height: { magnitude: 500000, unit: 'EMU' },
                    },
                    transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: 500000,
                        translateY: 300000,
                        unit: 'EMU',
                    },
                },
            },
        });

        requests.push({
            insertText: {
                objectId: titleId,
                text: 'Métriques Clés',
                insertionIndex: 0,
            },
        });

        requests.push({
            updateTextStyle: {
                objectId: titleId,
                style: {
                    bold: true,
                    fontSize: { magnitude: 24, unit: 'PT' },
                },
                fields: 'bold,fontSize',
            },
        });

        // 3. Add 4 metrics in 2x2 grid
        const startX = 1000000;
        const startY = 1500000;
        const boxWidth = 3000000;
        const boxHeight = 1500000;
        const gapX = 200000;
        const gapY = 200000;

        metrics.forEach((metric: any, idx: number) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const metricId = `${slideId}_metric_${idx}`;

            const x = startX + col * (boxWidth + gapX);
            const y = startY + row * (boxHeight + gapY);

            // Create metric box
            requests.push({
                createShape: {
                    objectId: metricId,
                    shapeType: 'TEXT_BOX',
                    elementProperties: {
                        pageObjectId: slideId,
                        size: {
                            width: { magnitude: boxWidth, unit: 'EMU' },
                            height: { magnitude: boxHeight, unit: 'EMU' },
                        },
                        transform: {
                            scaleX: 1,
                            scaleY: 1,
                            translateX: x,
                            translateY: y,
                            unit: 'EMU',
                        },
                    },
                },
            });

            // Add text
            const text = `${metric.label}\n${metric.formatted}`;
            requests.push({
                insertText: {
                    objectId: metricId,
                    text,
                    insertionIndex: 0,
                },
            });

            // Style
            requests.push({
                updateTextStyle: {
                    objectId: metricId,
                    style: {
                        fontSize: { magnitude: 16, unit: 'PT' },
                        bold: true,
                    },
                    fields: 'fontSize,bold',
                },
            });
        });

        return requests;
    }

    /**
     * Build empty slide for unsupported types
     */
    private buildEmptySlide(_slide: FlipikaSlideData, slideId: string, index: number): any[] {
        return [
            {
                createSlide: {
                    objectId: slideId,
                    slideLayoutReference: {
                        predefinedLayout: 'TITLE_AND_BODY',
                    },
                    insertionIndex: index + 1,
                },
            },
        ];
    }

    /**
     * Create a complete presentation from Flipika report data
     */
    async createPresentationFromReport(
        reportTitle: string,
        slides: FlipikaSlideData[]
    ): Promise<GoogleSlidesPresentation> {
        // Create presentation
        const presentation = await this.createPresentation(reportTitle);

        // Add slides
        if (slides.length > 0) {
            await this.addSlides(presentation.presentationId, slides);
        }

        return presentation;
    }
}

/**
 * Helper function to create GoogleSlidesService with current user's access token
 */
export async function createGoogleSlidesService(): Promise<GoogleSlidesService> {
    const accessToken = localStorage.getItem('google_access_token');

    if (!accessToken) {
        throw new Error('No Google access token found. Please authenticate first.');
    }

    return new GoogleSlidesService(accessToken);
}
