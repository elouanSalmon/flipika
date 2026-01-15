import {
    GoogleSlidesPresentation,
    FlipikaSlideData,
    CreatePresentationRequest,
    BatchUpdateRequest,
    PredefinedLayout,
    GoogleSlidesExportMetadata,
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
        const layout = this.getLayoutForSlideType(slide.type);

        // Create slide with appropriate layout
        const createSlideRequest = {
            createSlide: {
                slideLayoutReference: {
                    predefinedLayout: layout,
                },
                insertionIndex: index + 1, // +1 because index 0 is title slide
            },
        };

        // For now, just create the slide
        // TODO: Add text and content based on slide type
        return [createSlideRequest];
    }

    /**
     * Map Flipika slide type to Google Slides predefined layout
     */
    private getLayoutForSlideType(type: FlipikaSlideData['type']): PredefinedLayout {
        switch (type) {
            case 'performance':
                return 'TITLE_AND_BODY';
            case 'chart':
                return 'TITLE_ONLY';
            case 'metrics':
                return 'TITLE_AND_TWO_COLUMNS';
            case 'creative':
                return 'BLANK';
            default:
                return 'TITLE_AND_BODY';
        }
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
