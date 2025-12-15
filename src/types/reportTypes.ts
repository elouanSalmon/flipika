import type { JSONContent } from '@tiptap/react';

// Section Types
export const SectionType = {
    COVER: 'cover',
    EXECUTIVE_SUMMARY: 'summary',
    METRICS: 'metrics',
    CHART: 'chart',
    CAMPAIGN_ANALYSIS: 'analysis',
    RECOMMENDATIONS: 'recommendations',
    CUSTOM_TEXT: 'custom',
    TABLE: 'table',
    IMAGE: 'image',
} as const;

export type SectionType = typeof SectionType[keyof typeof SectionType];


// Editable Report Types
export interface EditableReport {
    id: string;
    userId: string;
    accountId: string;
    campaignIds: string[];
    title: string;
    content: JSONContent;
    sections: ReportSection[];
    comments: ReportComment[];
    design: ReportDesign;
    status: 'draft' | 'published' | 'archived';
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface ReportSection {
    id: string;
    type: SectionType;
    title: string;
    content: JSONContent;
    order: number;
    isCollapsed?: boolean;
    dataSource?: {
        type: 'google_ads' | 'manual';
        config?: any;
    };
}

// Section Template for library
export interface SectionTemplate {
    type: SectionType;
    title: string;
    description: string;
    icon: string;
    defaultContent: JSONContent;
    requiresData?: boolean;
}


export interface ReportComment {
    id: string;
    sectionId: string;
    content: JSONContent;
    isDefault: boolean;
    position?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReportDesign {
    colorScheme: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    logo?: {
        url: string;
        position: 'left' | 'center' | 'right';
        size: 'small' | 'medium' | 'large';
    };
    typography: {
        fontFamily: string;
        headingFontFamily?: string;
        fontSize: number;
        lineHeight: number;
    };
    layout: {
        margins: number;
        spacing: number;
        maxWidth: number;
    };
}

export interface ReportTemplate {
    id: string;
    userId?: string; // null for default templates
    name: string;
    description: string;
    thumbnail?: string;
    sections: Omit<ReportSection, 'id'>[];
    defaultComments: Omit<ReportComment, 'id' | 'createdAt' | 'updatedAt'>[];
    design: ReportDesign;
    isDefault: boolean;
    createdAt: Date;
}

// Default Design
export const defaultReportDesign: ReportDesign = {
    colorScheme: {
        primary: '#0066ff',
        secondary: '#3385ff',
        accent: '#00d4ff',
        background: '#ffffff',
        text: '#0f172a',
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        headingFontFamily: 'Inter, sans-serif',
        fontSize: 16,
        lineHeight: 1.6,
    },
    layout: {
        margins: 40,
        spacing: 24,
        maxWidth: 800,
    },
};

// Editor State
export interface ReportEditorState {
    report: EditableReport | null;
    activeSection: string | null;
    isDirty: boolean;
    isSaving: boolean;
    viewMode: 'editor' | 'preview' | 'split';
}

