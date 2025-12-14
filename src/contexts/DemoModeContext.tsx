import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { DemoSettings } from '../types/demo';
import dataService from '../services/dataService';

interface DemoModeContextType {
    isDemoMode: boolean;
    demoSettings: DemoSettings;
    toggleDemoMode: () => void;
    updateDemoSettings: (settings: Partial<DemoSettings>) => void;
    resetDemoData: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
    const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('demoMode');
        return saved === 'true';
    });

    const [demoSettings, setDemoSettings] = useState<DemoSettings>(() => {
        const saved = localStorage.getItem('demoSettings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Fallback to defaults
            }
        }
        return {
            enabled: isDemoMode,
            accountCount: 3,
            complexity: 'medium',
            industry: 'ecommerce',
        };
    });

    // Sync demo mode with data service
    useEffect(() => {
        dataService.setDemoMode(isDemoMode);
    }, [isDemoMode]);

    // Sync demo settings with data service
    useEffect(() => {
        if (isDemoMode) {
            dataService.setDemoConfig({
                accountCount: demoSettings.accountCount,
                complexity: demoSettings.complexity,
                industry: demoSettings.industry,
            });
        }
    }, [isDemoMode, demoSettings]);

    const toggleDemoMode = () => {
        setIsDemoMode(prev => {
            const newValue = !prev;
            localStorage.setItem('demoMode', String(newValue));
            setDemoSettings(s => ({ ...s, enabled: newValue }));
            return newValue;
        });
    };

    const updateDemoSettings = (newSettings: Partial<DemoSettings>) => {
        setDemoSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('demoSettings', JSON.stringify(updated));
            return updated;
        });
    };

    const resetDemoData = () => {
        // This will trigger data regeneration
        dataService.setDemoConfig({
            accountCount: demoSettings.accountCount,
            complexity: demoSettings.complexity,
            industry: demoSettings.industry,
            seed: Date.now(), // New seed for fresh data
        });
    };

    return (
        <DemoModeContext.Provider
            value={{
                isDemoMode,
                demoSettings,
                toggleDemoMode,
                updateDemoSettings,
                resetDemoData,
            }}
        >
            {children}
        </DemoModeContext.Provider>
    );
};

export const useDemoMode = () => {
    const context = useContext(DemoModeContext);
    if (!context) {
        throw new Error('useDemoMode must be used within DemoModeProvider');
    }
    return context;
};
