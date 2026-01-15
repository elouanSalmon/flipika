/**
 * Types for Google Slides API Integration
 */

export interface GoogleSlidesPresentation {
    presentationId: string;
    title: string;
    presentationUrl: string;
    slides?: GoogleSlide[];
}

export interface GoogleSlide {
    objectId: string;
    pageElements?: PageElement[];
}

export interface PageElement {
    objectId: string;
    size?: Size;
    transform?: Transform;
    shape?: Shape;
    image?: Image;
}

export interface Size {
    width: Dimension;
    height: Dimension;
}

export interface Dimension {
    magnitude: number;
    unit: 'EMU' | 'PT';
}

export interface Transform {
    scaleX: number;
    scaleY: number;
    translateX: number;
    translateY: number;
    unit: 'EMU' | 'PT';
}

export interface Shape {
    shapeType: string;
    text?: TextContent;
}

export interface TextContent {
    textElements: TextElement[];
}

export interface TextElement {
    textRun?: TextRun;
}

export interface TextRun {
    content: string;
    style?: TextStyle;
}

export interface TextStyle {
    bold?: boolean;
    italic?: boolean;
    fontSize?: Dimension;
    foregroundColor?: Color;
}

export interface Color {
    rgbColor: RgbColor;
}

export interface RgbColor {
    red: number;
    green: number;
    blue: number;
}

export interface Image {
    contentUrl: string;
    sourceUrl?: string;
}

/**
 * Flipika-specific types for slide mapping
 */

export type FlipikaSli type = 'performance' | 'chart' | 'metrics' | 'creative';

export interface FlipikaSlideData {
    type: FlipikaSlideType;
    title: string;
    data: Record<string, any>;
}

export interface GoogleSlidesExportMetadata {
    reportId: string;
    presentationId: string;
    presentationUrl: string;
    title: string;
    createdAt: Date;
    userId: string;
    slideCount: number;
}

/**
 * Google Slides API Request types
 */

export interface CreatePresentationRequest {
    title: string;
}

export interface BatchUpdateRequest {
    requests: Request[];
}

export type Request =
    | CreateSlideRequest
    | InsertTextRequest
    | UpdateTextStyleRequest
    | CreateShapeRequest
    | CreateImageRequest;

export interface CreateSlideRequest {
    createSlide: {
        slideLayoutReference?: {
            predefinedLayout: PredefinedLayout;
        };
        insertionIndex?: number;
    };
}

export type PredefinedLayout =
    | 'BLANK'
    | 'TITLE'
    | 'TITLE_AND_BODY'
    | 'TITLE_AND_TWO_COLUMNS'
    | 'TITLE_ONLY'
    | 'SECTION_HEADER'
    | 'SECTION_TITLE_AND_DESCRIPTION'
    | 'ONE_COLUMN_TEXT'
    | 'MAIN_POINT'
    | 'BIG_NUMBER';

export interface InsertTextRequest {
    insertText: {
        objectId: string;
        text: string;
        insertionIndex?: number;
    };
}

export interface UpdateTextStyleRequest {
    updateTextStyle: {
        objectId: string;
        style: TextStyle;
        fields: string;
        textRange?: {
            type: 'ALL' | 'FROM_START_INDEX' | 'FIXED_RANGE';
            startIndex?: number;
            endIndex?: number;
        };
    };
}

export interface CreateShapeRequest {
    createShape: {
        objectId: string;
        shapeType: string;
        elementProperties: {
            pageObjectId: string;
            size: Size;
            transform: Transform;
        };
    };
}

export interface CreateImageRequest {
    createImage: {
        url: string;
        elementProperties: {
            pageObjectId: string;
            size: Size;
            transform: Transform;
        };
    };
}
