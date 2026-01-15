import { Timestamp } from 'firebase/firestore';

export type ReportActionType = 'download' | 'email' | 'google_slides';

export interface ReportSnapshot {
    reportId: string;
    clientId: string;
    reportTitle: string;
    period: {
        startDate: string; // ISO string or formatted string stored for display
        endDate: string;
    };
    generatedAt: Timestamp;
    action: ReportActionType;
    metadata?: {
        recipientEmail?: string; // For email action
        filename?: string; // For download action
        presentationId?: string; // For Google Slides action
        presentationUrl?: string; // For Google Slides action
        user?: {
            uid: string;
            displayName: string;
        };
    };
}
