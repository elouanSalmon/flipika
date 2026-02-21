import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import {
    onAuthStateChanged,
    type User,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    EmailAuthProvider,
    linkWithCredential,
    updatePassword,
    reauthenticateWithCredential,
    signInWithCredential
} from 'firebase/auth';
import type { UserProfile, UpdateUserProfileData } from '../types/userProfile';
import { getUserProfile, updateUserProfile as updateUserProfileService } from '../services/userProfileService';

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    profileLoading: boolean;
    loginWithGoogle: () => Promise<void>;
    loginWithGoogleCredential: (credentialString: string) => Promise<void>;
    linkGoogleAds: () => Promise<boolean>;
    logout: () => Promise<void>;
    hasPasswordProvider: () => boolean;
    createPassword: (password: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updateProfile: (updates: UpdateUserProfileData) => Promise<void>;
    refreshProfile: (silent?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Load user profile
                setProfileLoading(true);
                try {
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);
                } catch (error) {
                    console.error('Error loading user profile:', error);
                    setUserProfile(null);
                } finally {
                    setProfileLoading(false);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const loginWithGoogleCredential = async (credentialString: string) => {
        const credential = GoogleAuthProvider.credential(credentialString);
        await signInWithCredential(auth, credential);
    };

    const linkGoogleAds = async (): Promise<boolean> => {
        try {
            // Get current user's ID token
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            const idToken = await user.getIdToken();

            // Call backend HTTP endpoint directly with auth header
            const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://us-central1-flipika.cloudfunctions.net';
            const response = await fetch(`${functionsBaseUrl}/initiateOAuth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    origin: window.location.origin
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to initiate OAuth');
            }

            const data = await response.json();

            if (data.success && data.authUrl) {
                // Redirect to Google OAuth
                window.location.href = data.authUrl;
                return true;
            }

            return false;
        } catch (error) {
            console.error("Error initiating OAuth:", error);
            throw error;
        }
    };

    const logout = async () => {
        localStorage.removeItem('google_ads_token'); // Clear ads token on logout
        setUserProfile(null);
        await signOut(auth);
    };

    const hasPasswordProvider = (): boolean => {
        if (!currentUser) return false;
        return currentUser.providerData.some(provider => provider.providerId === 'password');
    };

    const createPassword = async (password: string): Promise<void> => {
        if (!currentUser) {
            throw new Error('User not authenticated');
        }
        if (!currentUser.email) {
            throw new Error('User email not found');
        }

        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await linkWithCredential(currentUser, credential);
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        if (!currentUser) {
            throw new Error('User not authenticated');
        }
        if (!currentUser.email) {
            throw new Error('User email not found');
        }

        // Reauthenticate user before changing password
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);

        // Update password
        await updatePassword(currentUser, newPassword);
    };

    const updateProfile = async (updates: UpdateUserProfileData): Promise<void> => {
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        await updateUserProfileService(currentUser.uid, updates);

        // Refresh profile after update, silently to avoid UI flicker
        await refreshProfile(true);
    };

    const refreshProfile = async (silent: boolean = false): Promise<void> => {
        if (!currentUser) return;

        if (!silent) {
            setProfileLoading(true);
        }
        try {
            const profile = await getUserProfile(currentUser.uid);
            setUserProfile(profile);
        } catch (error) {
            console.error('Error refreshing user profile:', error);
        } finally {
            if (!silent) {
                setProfileLoading(false);
            }
        }
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        profileLoading,
        loginWithGoogle,
        loginWithGoogleCredential,
        linkGoogleAds,
        logout,
        hasPasswordProvider,
        createPassword,
        changePassword,
        updateProfile,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
