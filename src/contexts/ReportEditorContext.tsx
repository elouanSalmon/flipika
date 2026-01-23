import React, { createContext, useContext } from 'react';
import type { ReportDesign } from '../types/reportTypes';
import type { Client } from '../types/client';

interface ReportEditorContextType {
    design: ReportDesign | null;
    accountId: string;
    campaignIds: string[];
    reportId?: string;
    clientId?: string;
    client?: Client | null;
    userId?: string;
    isPublicView?: boolean;
    onOpenSettings?: () => void;
}

const ReportEditorContext = createContext<ReportEditorContextType>({
    design: null,
    accountId: '',
    campaignIds: [],
    client: null,
});

export const useReportEditor = () => useContext(ReportEditorContext);

export const ReportEditorProvider: React.FC<ReportEditorContextType & { children: React.ReactNode }> = ({
    children,
    design,
    accountId,
    campaignIds,
    reportId,
    clientId,
    client,
    userId,
    isPublicView,
    onOpenSettings,
}) => {
    return (
        <ReportEditorContext.Provider value={{
            design,
            accountId,
            campaignIds,
            reportId,
            clientId,
            client,
            userId,
            isPublicView,
            onOpenSettings
        }}>
            {children}
        </ReportEditorContext.Provider>
    );
};
