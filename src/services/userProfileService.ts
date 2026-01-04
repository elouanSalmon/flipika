import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { UserProfile, CreateUserProfileData, UpdateUserProfileData } from '../types/userProfile';
import { normalizeUsername, validateUsername } from '../types/userProfile';

const USERS_COLLECTION = 'users';
const USERNAMES_COLLECTION = 'usernames'; // For username uniqueness tracking

/**
 * Check if a username is available
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
        const normalizedUsername = normalizeUsername(username);

        // Validate format first
        const validation = validateUsername(normalizedUsername);
        if (!validation.valid) {
            return false;
        }

        // Check in usernames collection
        const usernameDoc = await getDoc(doc(db, USERNAMES_COLLECTION, normalizedUsername));
        return !usernameDoc.exists();
    } catch (error) {
        console.error('Error checking username availability:', error);
        throw error;
    }
};

/**
 * Create a new user profile
 */
export const createUserProfile = async (
    userId: string,
    data: CreateUserProfileData
): Promise<void> => {
    try {
        const normalizedUsername = normalizeUsername(data.username);

        // Validate username
        const validation = validateUsername(normalizedUsername);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Check availability
        const isAvailable = await checkUsernameAvailability(normalizedUsername);
        if (!isAvailable) {
            throw new Error('Username is already taken');
        }

        const userProfile: any = {
            uid: userId,
            email: data.email,
            username: normalizedUsername,
            firstName: data.firstName,
            lastName: data.lastName,
            hasCompletedOnboarding: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Only add optional fields if they have values
        if (data.company) {
            userProfile.company = data.company;
        }
        if (data.description) {
            userProfile.description = data.description;
        }
        if (data.photoURL) {
            userProfile.photoURL = data.photoURL;
        }

        // Create user profile document
        await setDoc(doc(db, USERS_COLLECTION, userId), userProfile);

        // Reserve username
        await setDoc(doc(db, USERNAMES_COLLECTION, normalizedUsername), {
            userId,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
};

/**
 * Update an existing user profile
 */
export const updateUserProfile = async (
    userId: string,
    updates: UpdateUserProfileData
): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const currentProfile = userDoc.data() as UserProfile;
        const updateData: any = { updatedAt: serverTimestamp() };

        // Only add fields that are being updated and not undefined
        Object.keys(updates).forEach(key => {
            const value = (updates as any)[key];
            if (value !== undefined) {
                updateData[key] = value;
            }
        });

        // If username is being updated
        if (updates.username && updates.username !== currentProfile.username) {
            const normalizedUsername = normalizeUsername(updates.username);

            // Validate new username
            const validation = validateUsername(normalizedUsername);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Check availability
            const isAvailable = await checkUsernameAvailability(normalizedUsername);
            if (!isAvailable) {
                throw new Error('Username is already taken');
            }

            // Delete old username reservation
            await setDoc(doc(db, USERNAMES_COLLECTION, currentProfile.username), {
                userId: null,
                deletedAt: serverTimestamp(),
            });

            // Reserve new username
            await setDoc(doc(db, USERNAMES_COLLECTION, normalizedUsername), {
                userId,
                createdAt: serverTimestamp(),
            });

            updateData.username = normalizedUsername;
        }

        // Update user profile
        await updateDoc(userRef, updateData);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

        if (!userDoc.exists()) {
            return null;
        }

        const data = userDoc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

/**
 * Get user profile by username
 */
export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
    try {
        const normalizedUsername = normalizeUsername(username);

        // Get userId from username reservation
        const usernameDoc = await getDoc(doc(db, USERNAMES_COLLECTION, normalizedUsername));

        if (!usernameDoc.exists() || !usernameDoc.data()?.userId) {
            return null;
        }

        const userId = usernameDoc.data().userId;
        return getUserProfile(userId);
    } catch (error) {
        console.error('Error getting user profile by username:', error);
        throw error;
    }
};

/**
 * Mark onboarding as complete
 */
export const completeOnboarding = async (userId: string): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
            hasCompletedOnboarding: true,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        throw error;
    }
};
