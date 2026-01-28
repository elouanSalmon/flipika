import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import type { DynamicVariableId } from '../extensions/DynamicVariableExtension';

/**
 * Format a date for display
 */
const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

/**
 * Resolves a dynamic variable to its actual value based on the current context
 */
export function resolveVariable(
    variableId: DynamicVariableId,
    context: {
        client?: { name?: string; logoUrl?: string } | null;
        reportTitle?: string;
        startDate?: Date;
        endDate?: Date;
        userName?: string;
        userEmail?: string;
        userCompany?: string;
    }
): string | null {
    switch (variableId) {
        case 'clientName':
            return context.client?.name || null;
        case 'clientLogo':
            return context.client?.logoUrl || null;
        case 'reportTitle':
            return context.reportTitle || null;
        case 'startDate':
            return context.startDate ? formatDate(context.startDate) : null;
        case 'endDate':
            return context.endDate ? formatDate(context.endDate) : null;
        case 'dateRange':
            if (context.startDate && context.endDate) {
                return `${formatDate(context.startDate)} - ${formatDate(context.endDate)}`;
            }
            return null;
        case 'userName':
            return context.userName || null;
        case 'userEmail':
            return context.userEmail || null;
        case 'userCompany':
            return context.userCompany || null;
        case 'currentDate':
            return formatDate(new Date());
        default:
            return null;
    }
}

/**
 * Component to render dynamic variables in the TipTap editor
 * Shows the variable tag in edit/template mode, and the resolved value when data is available
 */
export const DynamicVariableComponent: React.FC<NodeViewProps> = ({ node }) => {
    const {
        client,
        startDate,
        endDate,
        reportTitle,
        userName,
        userEmail,
        userCompany,
        isTemplateMode
    } = useReportEditor();
    const variableId = node.attrs.id as DynamicVariableId;
    const label = node.attrs.label || variableId;

    // Try to resolve the variable
    const resolvedValue = resolveVariable(variableId, {
        client,
        startDate,
        endDate,
        reportTitle,
        userName,
        userEmail,
        userCompany,
    });

    // In template mode or if value can't be resolved, show the tag
    const showTag = isTemplateMode || !resolvedValue;

    if (variableId === 'clientLogo') {
        const logoUrl = resolvedValue;

        if (showTag || !logoUrl) {
            return (
                <NodeViewWrapper
                    as="span"
                    className="dynamic-variable-inline dynamic-variable-tag"
                    data-variable-id={variableId}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                    [{label}]
                </NodeViewWrapper>
            );
        }

        return (
            <NodeViewWrapper
                as="span"
                className="dynamic-variable-inline dynamic-variable-resolved"
                data-variable-id={variableId}
                style={{ display: 'inline-flex', verticalAlign: 'middle' }}
            >
                <img
                    src={logoUrl}
                    alt="Client Logo"
                    style={{
                        maxHeight: '2.5rem',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        margin: '0.25rem 0'
                    }}
                />
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper
            as="span"
            className={`dynamic-variable-inline ${showTag ? 'dynamic-variable-tag' : 'dynamic-variable-resolved'}`}
            data-variable-id={variableId}
            style={{ display: 'inline' }}
        >
            {showTag ? `[${label}]` : resolvedValue}
        </NodeViewWrapper>
    );
};
