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
    reauthenticateWithCredential
} from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    linkGoogleAds: () => Promise<boolean>;
    logout: () => Promise<void>;
    hasPasswordProvider: () => boolean;
    createPassword: (password: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const linkGoogleAds = async () => {
        try {
            // Get current user's ID token
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            const idToken = await user.getIdToken();

            // Call backend HTTP endpoint directly with auth header
            const response = await fetch('https://us-central1-flipika.cloudfunctions.net/initiateOAuth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
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

    const value = {
        currentUser,
        loading,
        loginWithGoogle,
        linkGoogleAds,
        logout,
        hasPasswordProvider,
        createPassword,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
