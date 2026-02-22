import {
    collection,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { Client, CreateClientInput, UpdateClientInput, DataSource, AdPlatform } from '../types/client';

const COLLECTION_NAME = 'clients';

export const clientService = {
    /**
     * Upload logo to Storage and return URL
     */
    async uploadLogo(userId: string, file: File, clientId: string = 'temp'): Promise<string> {
        // Generate unique path: users/{userId}/clients/{clientId}/logo_{timestamp}_{filename}
        // Note: clientId might not be known yet for creation, so we might need a placeholder or generated ID.
        // Actually, for better organization, we can use a random ID or just the filename if unique enough.
        const path = `users/${userId}/clients/${clientId}/logo_${Date.now()}`;
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
    },

    /**
     * Create a new client
     */
    async createClient(userId: string, input: CreateClientInput): Promise<string> {
        try {
            // Check uniqueness of Google Ads Customer ID
            const q = query(
                collection(db, 'users', userId, COLLECTION_NAME),
                where('googleAdsCustomerId', '==', input.googleAdsCustomerId)
            );
            const existing = await getDocs(q);
            if (!existing.empty) {
                throw new Error('This Google Ads Customer ID is already linked to another client.');
            }

            let logoUrl = '';

            // We perform a trick here: we don't have the ID yet.
            // 1. Create doc to get ID
            // 2. Upload logo using ID
            // 3. Update doc with logoUrl

            // Step 1: Add doc with basic info first (or use doc() to generate ID locally)
            const clientsRef = collection(db, 'users', userId, COLLECTION_NAME);
            const newClientRef = doc(clientsRef); // Generate ID locally
            const clientId = newClientRef.id;

            // Step 2: Upload logo if exists
            if (input.logoFile) {
                logoUrl = await this.uploadLogo(userId, input.logoFile, clientId);
            }

            // Step 3: Build dataSources array
            const now = Timestamp.now();
            const dataSources: Array<{ platform: string; accountId: string; accountName: string; addedAt: Timestamp }> = [];
            if (input.googleAdsCustomerId) {
                dataSources.push({
                    platform: 'google_ads',
                    accountId: input.googleAdsCustomerId,
                    accountName: '',
                    addedAt: now,
                });
            }
            if (input.metaAdsAccountId) {
                dataSources.push({
                    platform: 'meta_ads',
                    accountId: input.metaAdsAccountId,
                    accountName: '',
                    addedAt: now,
                });
            }

            await setDoc(newClientRef, {
                name: input.name,
                email: input.email,
                googleAdsCustomerId: input.googleAdsCustomerId,
                dataSources,
                logoUrl: logoUrl,
                createdAt: now,
                updatedAt: now,
                ...(input.emailPreset && { emailPreset: input.emailPreset }),
                ...(input.defaultTemplateId && { defaultTemplateId: input.defaultTemplateId }),
                ...(input.defaultThemeId && { defaultThemeId: input.defaultThemeId }),
                ...(input.linkedThemeIds && { linkedThemeIds: input.linkedThemeIds })
            });

            return clientId;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    /**
     * Get all clients for a user
     */
    async getClients(userId: string): Promise<Client[]> {
        try {
            // Removing orderBy temporarily until index is confirmed or created
            // If orderBy is critical, we need to ensure the composite index exists.
            // For now, simpler query to avoid errors on new collection.
            const clientsRef = collection(db, 'users', userId, COLLECTION_NAME);
            const snapshot = await getDocs(clientsRef);

            // Sort in memory for now to avoid index error
            const clients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Client[];

            return clients.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.toMillis() - a.createdAt.toMillis();
                }
                return 0;
            });
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    /**
     * Get a single client
     * Note: Requires userId from AuthContext usually, but if we only have clientId, 
     * we might need to search or pass userId. 
     * For now, assuming we know userId is needed.
     * BUT: The service call in ReportPreview didn't pass userId.
     * We need to fix the service call or this method.
     * The `report` object usually doesn't store userId unless we added it. 
     * `EditableReport` has `userId`.
     * So we need `getClient(userId, clientId)`.
     */
    async getClient(userId: string, clientId: string): Promise<Client | null> {
        try {
            const docRef = doc(db, 'users', userId, COLLECTION_NAME, clientId);

            // Simpler: getDoc
            const { getDoc } = await import('firebase/firestore');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Client;
            }
            return null;
        } catch (error) {
            console.error('Error fetching client:', error);
            return null;
        }
    },

    /**
     * Update a client
     */
    async updateClient(userId: string, clientId: string, input: UpdateClientInput): Promise<void> {
        try {
            const docRef = doc(db, 'users', userId, COLLECTION_NAME, clientId);
            const updates: any = {
                updatedAt: serverTimestamp()
            };

            if (input.name) updates.name = input.name;
            if (input.email) updates.email = input.email;

            if (input.googleAdsCustomerId) {
                // Check uniqueness if changing ID
                const q = query(
                    collection(db, 'users', userId, COLLECTION_NAME),
                    where('googleAdsCustomerId', '==', input.googleAdsCustomerId)
                );
                const existing = await getDocs(q);
                // Filter out self
                const other = existing.docs.find(d => d.id !== clientId);
                if (other) {
                    throw new Error('This Google Ads Customer ID is already linked to another client.');
                }
                updates.googleAdsCustomerId = input.googleAdsCustomerId;

                // Sync dataSources: update google_ads entry or add one
                const { getDoc: getDocFn } = await import('firebase/firestore');
                const currentDoc = await getDocFn(docRef);
                const currentData = currentDoc.data();
                const currentSources: DataSource[] = currentData?.dataSources || [];
                const otherSources = currentSources.filter(s => s.platform !== 'google_ads');
                updates.dataSources = [...otherSources, {
                    platform: 'google_ads' as const,
                    accountId: input.googleAdsCustomerId,
                    accountName: '',
                    addedAt: currentSources.find(s => s.platform === 'google_ads')?.addedAt || Timestamp.now(),
                }];
            }

            // Handle Meta Ads account changes
            if (input.metaAdsAccountId !== undefined) {
                // Need to read current dataSources to update meta_ads entry
                if (!updates.dataSources) {
                    const { getDoc: getDocFn2 } = await import('firebase/firestore');
                    const currentDoc2 = await getDocFn2(docRef);
                    const currentData2 = currentDoc2.data();
                    const currentSources2: DataSource[] = currentData2?.dataSources || [];

                    if (input.metaAdsAccountId) {
                        const otherSources = currentSources2.filter(s => s.platform !== 'meta_ads');
                        updates.dataSources = [...otherSources, {
                            platform: 'meta_ads' as const,
                            accountId: input.metaAdsAccountId,
                            accountName: '',
                            addedAt: currentSources2.find(s => s.platform === 'meta_ads')?.addedAt || Timestamp.now(),
                        }];
                    } else {
                        // Remove meta_ads source
                        updates.dataSources = (currentSources2 || []).filter(
                            (s: DataSource) => s.platform !== 'meta_ads'
                        );
                    }
                } else {
                    // dataSources was already updated above (google_ads change), also handle meta_ads
                    const currentDs = updates.dataSources as DataSource[];
                    if (input.metaAdsAccountId) {
                        const withoutMeta = currentDs.filter(s => s.platform !== 'meta_ads');
                        updates.dataSources = [...withoutMeta, {
                            platform: 'meta_ads' as const,
                            accountId: input.metaAdsAccountId,
                            accountName: '',
                            addedAt: Timestamp.now(),
                        }];
                    } else {
                        updates.dataSources = currentDs.filter(
                            (s: DataSource) => s.platform !== 'meta_ads'
                        );
                    }
                }
            }

            if (input.logoFile) {
                // Upload new logo
                const newLogoUrl = await this.uploadLogo(userId, input.logoFile, clientId);
                updates.logoUrl = newLogoUrl;

                // Note: Clean up old logo? Ideally yes, but acceptable to skip for MVP/Safety.
                // We will assume overwriting path logic or just leaving old files is fine for now.
            }

            // Handle preset configuration
            if (input.defaultTemplateId !== undefined) {
                updates.defaultTemplateId = input.defaultTemplateId;
            }

            if (input.defaultThemeId !== undefined) {
                updates.defaultThemeId = input.defaultThemeId;
            }

            if (input.linkedThemeIds !== undefined) {
                updates.linkedThemeIds = input.linkedThemeIds;
            }

            if (input.emailPreset) {
                updates.emailPreset = input.emailPreset;
            }

            if (input.monthlyBudget !== undefined) {
                updates.monthlyBudget = input.monthlyBudget;
            }

            await updateDoc(docRef, updates);
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    },

    /**
     * Add a data source to a client
     */
    async addDataSource(userId: string, clientId: string, dataSource: DataSource): Promise<void> {
        try {
            const docRef = doc(db, 'users', userId, COLLECTION_NAME, clientId);
            const { getDoc: getDocFn } = await import('firebase/firestore');
            const docSnap = await getDocFn(docRef);
            if (!docSnap.exists()) throw new Error('Client not found');

            const client = docSnap.data();
            const existing: DataSource[] = client.dataSources || [];

            const duplicate = existing.find(
                d => d.platform === dataSource.platform && d.accountId === dataSource.accountId
            );
            if (duplicate) {
                throw new Error('DUPLICATE_DATA_SOURCE');
            }

            const updates: Record<string, unknown> = {
                dataSources: [...existing, dataSource],
                updatedAt: serverTimestamp(),
            };

            // Keep legacy field in sync
            if (dataSource.platform === 'google_ads') {
                updates.googleAdsCustomerId = dataSource.accountId;
            }

            await updateDoc(docRef, updates);
        } catch (error) {
            console.error('Error adding data source:', error);
            throw error;
        }
    },

    /**
     * Remove a data source from a client
     */
    async removeDataSource(userId: string, clientId: string, platform: AdPlatform, accountId: string): Promise<void> {
        try {
            const docRef = doc(db, 'users', userId, COLLECTION_NAME, clientId);
            const { getDoc: getDocFn } = await import('firebase/firestore');
            const docSnap = await getDocFn(docRef);
            if (!docSnap.exists()) throw new Error('Client not found');

            const client = docSnap.data();
            const existing: DataSource[] = client.dataSources || [];
            const updated = existing.filter(
                d => !(d.platform === platform && d.accountId === accountId)
            );

            const updates: Record<string, unknown> = {
                dataSources: updated,
                updatedAt: serverTimestamp(),
            };

            // Clear legacy field if removing Google Ads source
            if (platform === 'google_ads') {
                updates.googleAdsCustomerId = '';
            }

            await updateDoc(docRef, updates);
        } catch (error) {
            console.error('Error removing data source:', error);
            throw error;
        }
    },

    /**
     * Delete a client
     */
    async deleteClient(userId: string, clientId: string, logoUrl?: string): Promise<void> {
        try {
            // Delete Firestore doc
            const docRef = doc(db, 'users', userId, COLLECTION_NAME, clientId);
            await deleteDoc(docRef);

            // Delete logo if exists
            // We need to parse path from URL or just try/catch
            if (logoUrl) {
                try {
                    // Create a reference from the URL
                    const logoRef = ref(storage, logoUrl);
                    await deleteObject(logoRef);
                } catch (e) {
                    console.warn('Failed to delete logo file, proceeding:', e);
                }
            }
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }
};

export const getClient = clientService.getClient;
