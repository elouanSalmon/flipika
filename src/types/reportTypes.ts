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


// Slide Types
export const SlideType = {
    PERFORMANCE_OVERVIEW: 'performance_overview',
    CAMPAIGN_CHART: 'campaign_chart',
    KEY_METRICS: 'key_metrics',
    AD_CREATIVE: 'ad_creative',
    FUNNEL_ANALYSIS: 'funnel_analysis',
    TEXT_BLOCK: 'text_block',
    CUSTOM: 'custom',
    DEVICE_PLATFORM_SPLIT: 'device_platform_split',
    HEATMAP: 'heatmap',
    TOP_PERFORMERS: 'top_performers',
    SECTION_TITLE: 'section_title',
    RICH_TEXT: 'rich_text',
    FLEXIBLE_DATA: 'flexible_data',
    // Meta Ads slide types
    META_PERFORMANCE_OVERVIEW: 'meta_performance_overview',
    META_CAMPAIGN_CHART: 'meta_campaign_chart',
    META_FUNNEL_ANALYSIS: 'meta_funnel_analysis',
} as const;

export type SlideType = typeof SlideType[keyof typeof SlideType];

// Slide Scope Types
export interface SlideScope {
    type: 'report_default' | 'specific_campaigns' | 'single_campaign';
    accountId?: string;  // Always uses report account
    campaignIds?: string[];  // Subset of report campaigns
}

export interface SlideConfig {
    id: string;
    type: SlideType;
    accountId: string;
    campaignIds: string[];
    scope?: SlideScope;  // Optional - defaults to report_default
    order: number;
    // Structural Slide Content
    title?: string;      // For SECTION_TITLE
    subtitle?: string;   // For SECTION_TITLE
    body?: string;       // For RICH_TEXT
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

export interface SlideInstance {
    id: string;
    slideConfigId: string;
    reportId: string;
    data?: any; // Cached data from Google Ads API
    lastUpdated: Date;
}

export interface SlideTemplate {
    id: string;
    userId?: string; // null for default templates
    name: string;
    description: string;
    type: SlideType;
    defaultSettings: SlideConfig['settings'];
    thumbnail?: string;
    isDefault: boolean;
    createdAt: Date;
}

// Editable Report Types
export interface EditableReport {
    id: string;
    userId: string;
    clientId?: string; // Client ID associated with this report
    accountId: string;
    accountName?: string; // For display
    campaignIds: string[];
    campaignNames?: string[]; // For display
    metaAccountId?: string; // Meta Ads account ID (if client has Meta linked)
    metaAccountName?: string; // For display
    title: string;
    content: JSONContent;
    sections: ReportSection[];
    slideIds: string[]; // IDs of slides in the slides sub-collection
    slides: SlideConfig[]; // Populated slides (may be empty for list views)
    comments: ReportComment[];
    design: ReportDesign;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date; // When the report was published
    lastAutoSave?: Date; // Last auto-save timestamp
    shareUrl?: string; // Public share URL (if published)
    startDate?: Date; // Start date for data filtering
    endDate?: Date; // End date for data filtering
    dateRangePreset?: string; // Period preset used (if created from template)
    templateId?: string; // ID of template used to create this report (if any)
    isPasswordProtected: boolean; // Whether the report requires a password
    passwordHash?: string; // SHA-256 hash of the password (if protected)
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
        type: 'google_ads' | 'meta_ads' | 'manual';
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
    mode: 'light' | 'dark';
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
    mode: 'light',
    colorScheme: {
        primary: '#1963d5',
        secondary: '#61abf7',
        accent: '#00d4ff',
        background: '#ffffff',
        text: '#141415',
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

