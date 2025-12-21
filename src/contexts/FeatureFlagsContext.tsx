import React, { createContext, useContext, type ReactNode } from 'react';

/**
 * Feature flags configuration interface
 * Controls which features are enabled/disabled in the application
 */
export interface FeatureFlags {
    enableDashboard: boolean;
    enableAudit: boolean;
    enableReports: boolean;
    enableCopilot: boolean;
    enableFullLanding: boolean;
}

/**
 * Context for accessing feature flags throughout the application
 */
const FeatureFlagsContext = createContext<FeatureFlags | undefined>(undefined);

/**
 * Provider component that reads feature flags from environment variables
 * and makes them available to the entire application
 */
export const FeatureFlagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Read feature flags from Vite environment variables
    // Default to true if not specified for backward compatibility
    const featureFlags: FeatureFlags = {
        enableDashboard: import.meta.env.VITE_FEATURE_DASHBOARD !== 'false',
        enableAudit: import.meta.env.VITE_FEATURE_AUDIT !== 'false',
        enableReports: import.meta.env.VITE_FEATURE_REPORTS !== 'false',
        enableCopilot: import.meta.env.VITE_FEATURE_COPILOT !== 'false',
        enableFullLanding: import.meta.env.VITE_FEATURE_FULL_LANDING === 'true',
    };

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            {children}
        </FeatureFlagsContext.Provider>
    );
};

/**
 * Custom hook to access feature flags
 * @throws Error if used outside of FeatureFlagsProvider
 * @returns FeatureFlags object with current feature flag states
 */
export const useFeatureFlags = (): FeatureFlags => {
    const context = useContext(FeatureFlagsContext);

    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }

    return context;
};
