// API response types

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: APIError;
    timestamp: Date;
}

export interface APIError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface GoogleAdsAPIResponse {
    results: any[];
    fieldMask: string;
    nextPageToken?: string;
}
