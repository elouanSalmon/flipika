import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { tutorialService, type TutorialStatus } from '../services/tutorialService';

interface TutorialContextType {
    status: TutorialStatus | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
    updateStep: (stepId: string, value: boolean) => Promise<void>;
    dismissTutorial: () => Promise<void>;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within a TutorialProvider');
    }
    return context;
};

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, userProfile, updateProfile } = useAuth();
    const [status, setStatus] = useState<TutorialStatus | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkStatus = useCallback(async () => {
        if (!currentUser) {
            setStatus(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const newStatus = await tutorialService.checkStatus(currentUser.uid);
            setStatus(newStatus);

            // Auto-complete tutorial if all steps are done
            if (newStatus.isComplete && userProfile && !userProfile.hasCompletedTutorial) {
                try {
                    await updateProfile({ hasCompletedTutorial: true });
                    console.log('Tutorial marked as complete');
                } catch (err) {
                    console.error('Failed to auto-complete tutorial profile status', err);
                }
            }

        } catch (error) {
            console.error('Failed to check tutorial status:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, userProfile, updateProfile]);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (currentUser) {
                // Only set loading on initial mount/user change
                setIsLoading(prev => !status ? true : prev);
                if (mounted) await checkStatus();
            } else {
                setIsLoading(false);
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, [currentUser, checkStatus]);

    const value = {
        status,
        isLoading,
        refresh: async () => {
            await checkStatus();
        },
        updateStep: async (_stepId: string, _value: boolean) => {
            // Implementation for manual step updates - for now just refresh to sync with backend
            // In a real app we might optimistically update 'status' state here
            await checkStatus();
        },
        dismissTutorial: async () => {
            // For session dismissal, we could set a local state or use the service
            // But the main logic is handled by userProfile.hasCompletedTutorial update in the widget
            // Here we just update local status to reflect 'dismissed' if we used that field
            if (status) {
                setStatus({ ...status, isDismissed: true });
            }
        }
    };

    return (
        <TutorialContext.Provider value={value}>
            {children}
        </TutorialContext.Provider>
    );
};
