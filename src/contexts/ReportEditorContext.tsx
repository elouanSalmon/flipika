import React, { createContext, useContext } from 'react';
import type { ReportDesign } from '../types/reportTypes';

interface ReportEditorContextType {
    design: ReportDesign | null;
    accountId: string;
    campaignIds: string[];
    reportId?: string;
    clientId?: string;
    isPublicView?: boolean;
}

const ReportEditorContext = createContext<ReportEditorContextType>({
    design: null,
    accountId: '',
    campaignIds: [],
});

export const useReportEditor = () => useContext(ReportEditorContext);

export const ReportEditorProvider: React.FC<ReportEditorContextType & { children: React.ReactNode }> = ({
    children,
    design,
    accountId,
    campaignIds,
    reportId,
    clientId,
    isPublicView,
}) => {
    return (
        <ReportEditorContext.Provider value={{ design, accountId, campaignIds, reportId, clientId, isPublicView }}>
            {children}
        </ReportEditorContext.Provider>
    );
};
