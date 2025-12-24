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


// Widget Types
export const WidgetType = {
    PERFORMANCE_OVERVIEW: 'performance_overview',
    CAMPAIGN_CHART: 'campaign_chart',
    TEXT_BLOCK: 'text_block',
    CUSTOM: 'custom',
} as const;

export type WidgetType = typeof WidgetType[keyof typeof WidgetType];

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    accountId: string;
    campaignIds: string[];
    order: number;
    settings?: {
        // Performance Overview
        metrics?: string[]; // ['impressions', 'clicks', 'ctr', 'cpc', 'conversions', 'roas']
        showComparison?: boolean;

        // Campaign Chart
        chartType?: 'line' | 'bar' | 'area';
        timeRange?: string; // 'last_7_days', 'last_30_days', 'custom'

        // Text Block
        content?: string; // HTML content

        // Custom
        [key: string]: any; // Allow any custom settings
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface WidgetInstance {
    id: string;
    widgetConfigId: string;
    reportId: string;
    data?: any; // Cached data from Google Ads API
    lastUpdated: Date;
}

export interface WidgetTemplate {
    id: string;
    userId?: string; // null for default templates
    name: string;
    description: string;
    type: WidgetType;
    defaultSettings: WidgetConfig['settings'];
    thumbnail?: string;
    isDefault: boolean;
    createdAt: Date;
}

// Editable Report Types
export interface EditableReport {
    id: string;
    userId: string;
    accountId: string;
    campaignIds: string[];
    title: string;
    content: JSONContent;
    sections: ReportSection[];
    widgets: WidgetConfig[]; // Added widget support
    comments: ReportComment[];
    design: ReportDesign;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date; // When the report was published
    lastAutoSave?: Date; // Last auto-save timestamp
    shareUrl?: string; // Public share URL (if published)
    startDate?: Date; // Start date for data filtering
    endDate?: Date; // End date for data filtering
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

