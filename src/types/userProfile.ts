export interface UserProfile {
    uid: string;
    email: string;
    username: string; // unique, 3-30 chars, alphanumeric + hyphens/underscores
    firstName: string; // required
    lastName: string; // required
    company?: string; // optional
    description?: string; // optional
    photoURL?: string;
    hasCompletedOnboarding: boolean;
    hasCompletedTutorial: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserProfileData {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    company?: string;
    description?: string;
    photoURL?: string;
}

export interface UpdateUserProfileData {
    username?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    description?: string;
    photoURL?: string;
    hasCompletedOnboarding?: boolean;
    hasCompletedTutorial?: boolean;
}

// Username validation constants
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_REGEX = /^[a-z0-9_-]+$/; // lowercase alphanumeric, hyphens, underscores
export const COMPANY_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

// Validation helper functions
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
    if (!username || username.length < USERNAME_MIN_LENGTH) {
        return { valid: false, error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` };
    }
    if (username.length > USERNAME_MAX_LENGTH) {
        return { valid: false, error: `Username must be at most ${USERNAME_MAX_LENGTH} characters` };
    }
    if (!USERNAME_REGEX.test(username.toLowerCase())) {
        return { valid: false, error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' };
    }
    return { valid: true };
};

export const normalizeUsername = (username: string): string => {
    return username.toLowerCase().trim();
};
