import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, type User, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    linkGoogleAds: () => Promise<boolean>;
    logout: () => Promise<void>;
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
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/adwords');
        provider.addScope('https://www.googleapis.com/auth/analytics.readonly');
        // Force account selection to ensure user picks the right ads account
        provider.setCustomParameters({
            prompt: 'select_account consent'
        });

        try {
            // We use signInWithPopup to get the credential with the new scope
            // In a real app with backend, we would send the code/token to the server
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const accessToken = credential?.accessToken;

            if (accessToken) {
                // For MVP: We just store in local storage to simulate "connected" state
                // Real implementation: Send to backend to store refresh token
                localStorage.setItem('google_ads_token', accessToken);
                // Trigger a user profile update (stub)
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error linking Google Ads:", error);
            throw error;
        }
    };

    const logout = async () => {
        localStorage.removeItem('google_ads_token'); // Clear ads token on logout
        await signOut(auth);
    };

    const value = {
        currentUser,
        loading,
        loginWithGoogle,
        linkGoogleAds,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
