import React, { createContext, useContext } from 'react';
import type { ReportDesign } from '../types/reportTypes';
import type { Client } from '../types/client';

interface ReportEditorContextType {
    design: ReportDesign | null;
    accountId: string;
    metaAccountId?: string;
    campaignIds: string[];
    reportId?: string;
    reportTitle?: string;
    clientId?: string;
    client?: Client | null;
    userId?: string;
    userName?: string;
    userEmail?: string;
    userCompany?: string;
    isPublicView?: boolean;
    isTemplateMode?: boolean; // When true, blocks always show demo data
    startDate?: Date;
    endDate?: Date;
    onOpenSettings?: () => void;
}

const ReportEditorContext = createContext<ReportEditorContextType>({
    design: null,
    accountId: '',
    campaignIds: [],
    client: null,
    isTemplateMode: false,
});

export const useReportEditor = () => useContext(ReportEditorContext);

export const ReportEditorProvider: React.FC<ReportEditorContextType & { children: React.ReactNode }> = ({
    children,
    design,
    accountId,
    metaAccountId,
    campaignIds,
    reportId,
    reportTitle,
    clientId,
    client,
    userId,
    userName,
    userEmail,
    userCompany,
    isPublicView,
    isTemplateMode,
    startDate,
    endDate,
    onOpenSettings,
}) => {
    const contextValue = React.useMemo(() => ({
        design,
        accountId,
        metaAccountId,
        campaignIds,
        reportId,
        reportTitle,
        clientId,
        client,
        userId,
        userName,
        userEmail,
        userCompany,
        isPublicView,
        isTemplateMode,
        startDate,
        endDate,
        onOpenSettings
    }), [
        design,
        accountId,
        metaAccountId,
        campaignIds,
        reportId,
        reportTitle,
        clientId,
        client,
        userId,
        userName,
        userEmail,
        userCompany,
        isPublicView,
        isTemplateMode,
        startDate,
        endDate,
        onOpenSettings
    ]);

    return (
        <ReportEditorContext.Provider value={contextValue}>
            {children}
        </ReportEditorContext.Provider>
    );
};
