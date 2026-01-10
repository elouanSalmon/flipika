import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface TutorialStatus {
    steps: {
        hasClient: boolean;
        hasTheme: boolean;
        hasTemplate: boolean;
        hasSchedule: boolean;
        hasGeneratedReport: boolean; // Just generated
        hasSentReport: boolean;      // Marked as sent
    };
    progress: number; // 0-100
    isComplete: boolean;
    isDismissed: boolean;
}

export const tutorialService = {
    /**
     * Check all tutorial steps for a given user
     */
    async checkStatus(userId: string): Promise<TutorialStatus> {
        // Run checks in parallel for performance
        const [
            hasClient,
            hasTheme,
            hasTemplate,
            hasSchedule,
            hasGeneratedReport,
            hasSentReport
        ] = await Promise.all([
            this.checkHasClient(userId),
            this.checkHasTheme(userId),
            this.checkHasTemplate(userId),
            this.checkHasSchedule(userId),
            this.checkHasGeneratedReport(userId),
            this.checkHasSentReport(userId)
        ]);

        const steps = {
            hasClient,
            hasTheme,
            hasTemplate,
            hasSchedule,
            hasGeneratedReport,
            hasSentReport
        };

        const totalSteps = Object.keys(steps).length;
        const completedSteps = Object.values(steps).filter(Boolean).length;
        const progress = Math.round((completedSteps / totalSteps) * 100);

        return {
            steps,
            progress,
            isComplete: completedSteps === totalSteps,
            isDismissed: false
        };
    },


    async checkHasClient(userId: string): Promise<boolean> {
        // Clients are in subcollection: users/{userId}/clients
        const q = query(collection(db, 'users', userId, 'clients'), limit(1));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    async checkHasTheme(userId: string): Promise<boolean> {
        // Themes are in root collection: report_themes
        const q = query(
            collection(db, 'report_themes'),
            where('userId', '==', userId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    async checkHasTemplate(userId: string): Promise<boolean> {
        // Templates are in root collection: reportTemplates
        const q = query(
            collection(db, 'reportTemplates'),
            where('userId', '==', userId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    async checkHasSchedule(userId: string): Promise<boolean> {
        // Schedules are in root collection: scheduledReports
        const q = query(
            collection(db, 'scheduledReports'),
            where('userId', '==', userId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    async checkHasGeneratedReport(userId: string): Promise<boolean> {
        // Reports are in root collection: reports
        const q = query(
            collection(db, 'reports'),
            where('userId', '==', userId),
            limit(1)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    async checkHasSentReport(userId: string): Promise<boolean> {
        // Check report history for 'sent' status in root collection
        const q = query(
            collection(db, 'reports'),
            where('userId', '==', userId),
            where('status', 'in', ['sent', 'published']),
            limit(1)
        );
        // Note: If 'status' isn't indexed with userId, this might fail or require index.
        // For MVP, if status='sent' isn't common, maybe check all user reports? 
        // Or assume if they have > 0 reports, one might be sent?
        // Let's stick to the query, if index needed Firebase will tell.
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    }
};
