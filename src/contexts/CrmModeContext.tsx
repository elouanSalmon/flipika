import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { UserProfile } from '../types/userProfile';

const CRM_ADMIN_EMAIL = 'helloflipika@gmail.com';

interface CrmModeContextType {
    isCrmMode: boolean;
    isCrmModeAvailable: boolean;
    impersonatedUser: UserProfile | null;
    effectiveUserId: string | null;
    enterCrmMode: (user: UserProfile) => void;
    exitCrmMode: () => void;
}

const CrmModeContext = createContext<CrmModeContextType | undefined>(undefined);

const SESSION_KEY = 'crmImpersonatedUser';

export const CrmModeProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const isCrmModeAvailable = currentUser?.email === CRM_ADMIN_EMAIL;

    const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(() => {
        try {
            const saved = sessionStorage.getItem(SESSION_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const isCrmMode = isCrmModeAvailable && impersonatedUser !== null;

    // effectiveUserId: when impersonating, use the target user's ID; otherwise current admin's
    const effectiveUserId = isCrmMode && impersonatedUser
        ? impersonatedUser.uid
        : (currentUser?.uid ?? null);

    useEffect(() => {
        if (impersonatedUser) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(impersonatedUser));
        } else {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }, [impersonatedUser]);

    // If the logged-in user lost admin access, clean up
    useEffect(() => {
        if (!isCrmModeAvailable && impersonatedUser) {
            setImpersonatedUser(null);
        }
    }, [isCrmModeAvailable]);

    const enterCrmMode = (user: UserProfile) => {
        if (!isCrmModeAvailable) return;
        setImpersonatedUser(user);
    };

    const exitCrmMode = () => {
        setImpersonatedUser(null);
    };

    return (
        <CrmModeContext.Provider
            value={{
                isCrmMode,
                isCrmModeAvailable,
                impersonatedUser,
                effectiveUserId,
                enterCrmMode,
                exitCrmMode,
            }}
        >
            {children}
        </CrmModeContext.Provider>
    );
};

export const useCrmMode = () => {
    const context = useContext(CrmModeContext);
    if (!context) {
        throw new Error('useCrmMode must be used within CrmModeProvider');
    }
    return context;
};
