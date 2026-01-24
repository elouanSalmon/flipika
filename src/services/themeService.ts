import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ReportTheme, CreateThemeDTO, UpdateThemeDTO, ThemePreset } from '../types/reportThemes';
import { getAllThemePresets, getThemePresetById } from '../data/defaultThemes';

/**
 * Service for managing report themes
 */
class ThemeService {
    private readonly COLLECTION_NAME = 'report_themes';

    /**
     * Convert Firestore timestamp to Date
     */
    private convertTimestamps(data: any): any {
        const converted = { ...data };
        if (converted.createdAt instanceof Timestamp) {
            converted.createdAt = converted.createdAt.toDate();
        }
        if (converted.updatedAt instanceof Timestamp) {
            converted.updatedAt = converted.updatedAt.toDate();
        }
        return converted;
    }

    /**
     * Create a new theme
     */
    async createTheme(userId: string, themeData: CreateThemeDTO): Promise<ReportTheme> {
        const themeRef = doc(collection(db, this.COLLECTION_NAME));
        const now = new Date();

        const theme: ReportTheme = {
            ...themeData,
            id: themeRef.id,
            userId,
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(themeRef, {
            ...theme,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return theme;
    }

    /**
     * Get a theme by ID
     */
    async getTheme(themeId: string): Promise<ReportTheme | null> {
        const themeRef = doc(db, this.COLLECTION_NAME, themeId);
        const themeSnap = await getDoc(themeRef);

        if (!themeSnap.exists()) {
            return null;
        }

        const data = themeSnap.data();
        return this.convertTimestamps({ id: themeSnap.id, ...data }) as ReportTheme;
    }

    /**
     * Get all themes for a user
     */
    async getUserThemes(userId: string): Promise<ReportTheme[]> {
        const themesRef = collection(db, this.COLLECTION_NAME);
        const q = query(themesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return this.convertTimestamps({ id: doc.id, ...data }) as ReportTheme;
        });
    }

    /**
     * Update a theme
     */
    async updateTheme(themeId: string, updates: UpdateThemeDTO): Promise<void> {
        const themeRef = doc(db, this.COLLECTION_NAME, themeId);

        await updateDoc(themeRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    }

    /**
     * Delete a theme
     */
    async deleteTheme(themeId: string): Promise<void> {
        const themeRef = doc(db, this.COLLECTION_NAME, themeId);
        await deleteDoc(themeRef);
    }

    /**
     * Link a theme to a client
     */
    async linkThemeToClient(themeId: string, clientId: string): Promise<void> {
        const theme = await this.getTheme(themeId);
        if (!theme) {
            throw new Error('Theme not found');
        }

        const linkedClientIds = theme.linkedClientIds || [];
        if (!linkedClientIds.includes(clientId)) {
            linkedClientIds.push(clientId);
            await this.updateTheme(themeId, { linkedClientIds });
        }
    }

    /**
     * Unlink a theme from a client
     */
    async unlinkThemeFromClient(themeId: string, clientId: string): Promise<void> {
        const theme = await this.getTheme(themeId);
        if (!theme) {
            throw new Error('Theme not found');
        }

        const linkedClientIds = theme.linkedClientIds.filter(id => id !== clientId);
        await this.updateTheme(themeId, { linkedClientIds });
    }

    /**
     * Get the theme linked to a specific client
     */
    async getThemeForClient(userId: string, clientId: string): Promise<ReportTheme | null> {
        const themes = await this.getUserThemes(userId);
        const linkedTheme = themes.find(theme =>
            theme.linkedClientIds?.includes(clientId)
        );

        return linkedTheme || null;
    }

    /**
     * Get the default theme for a user
     */
    async getDefaultTheme(userId: string): Promise<ReportTheme | null> {
        const themes = await this.getUserThemes(userId);
        const defaultTheme = themes.find(theme => theme.isDefault);

        return defaultTheme || null;
    }

    /**
     * Set a theme as default for a user
     */
    async setDefaultTheme(userId: string, themeId: string): Promise<void> {
        // First, unset all other default themes
        const themes = await this.getUserThemes(userId);
        const updatePromises = themes
            .filter(theme => theme.isDefault && theme.id !== themeId)
            .map(theme => this.updateTheme(theme.id, { isDefault: false }));

        await Promise.all(updatePromises);

        // Then set the new default
        await this.updateTheme(themeId, { isDefault: true });
    }

    /**
     * Get all system theme presets
     */
    getSystemPresets(): ThemePreset[] {
        return getAllThemePresets();
    }

    /**
     * Create a theme from a preset
     */
    async createThemeFromPreset(
        userId: string,
        presetId: string,
        name: string,
        description?: string
    ): Promise<ReportTheme> {
        const preset = getThemePresetById(presetId);
        if (!preset) {
            throw new Error('Preset not found');
        }

        const themeData: CreateThemeDTO = {
            userId,
            name,
            description: description || preset.description,
            design: preset.design,
            defaultModules: preset.defaultModules,
            linkedClientIds: [],
            isDefault: false,
        };

        return this.createTheme(userId, themeData);
    }

    /**
     * Duplicate an existing theme
     */
    async duplicateTheme(themeId: string, newName: string): Promise<ReportTheme> {
        const originalTheme = await this.getTheme(themeId);
        if (!originalTheme) {
            throw new Error('Theme not found');
        }

        const duplicatedThemeData: CreateThemeDTO = {
            userId: originalTheme.userId,
            name: newName,
            description: originalTheme.description,
            design: { ...originalTheme.design },
            defaultModules: originalTheme.defaultModules ? { ...originalTheme.defaultModules } : undefined,
            linkedClientIds: [], // Don't copy linked clients
            isDefault: false, // Don't copy default status
            thumbnail: originalTheme.thumbnail,
        };

        return this.createTheme(originalTheme.userId, duplicatedThemeData);
    }
}

export default new ThemeService();
