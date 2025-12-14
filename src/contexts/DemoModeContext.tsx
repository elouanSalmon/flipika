import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface DemoModeContextType {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
    const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
        const stored = localStorage.getItem('flipika_demo_mode');
        return stored === 'true';
    });

    useEffect(() => {
        localStorage.setItem('flipika_demo_mode', isDemoMode.toString());
    }, [isDemoMode]);

    const toggleDemoMode = () => {
        setIsDemoMode(prev => !prev);
    };

    return (
        <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode }}>
            {children}
        </DemoModeContext.Provider>
    );
};

export const useDemoMode = () => {
    const context = useContext(DemoModeContext);
    if (context === undefined) {
        throw new Error('useDemoMode must be used within a DemoModeProvider');
    }
    return context;
};
