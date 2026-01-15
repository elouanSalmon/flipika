import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ReportSnapshot } from '../types/history';

const COLLECTION_NAME = 'reportHistory';

export const historyService = {
    /**
     * Add a new entry to the history log
     */
    addToHistory: async (
        data: Omit<ReportSnapshot, 'generatedAt'>
    ): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...data,
                generatedAt: serverTimestamp()
            });
            console.log('📝 History snapshot saved:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error saving history snapshot:', error);
            // We verify permissions or network issues here but don't block the UI flow
            // as this is a background tracking feature
            return '';
        }
    },

    /**
     * Get history for a specific client
     */
    getHistoryByClient: async (clientId: string, limitCount = 20): Promise<ReportSnapshot[]> => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('clientId', '==', clientId),
                orderBy('generatedAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as unknown as ReportSnapshot[]; // Cast needed for Timestamp conversion if strictly typed
        } catch (error) {
            console.error('Error fetching client history:', error);
            return [];
        }
    }
};
