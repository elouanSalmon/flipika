import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'lucide-react';
import './EmailPresetEditor.css';

interface EmailPresetEditorProps {
    subject: string;
    body: string;
    onSubjectChange: (value: string) => void;
    onBodyChange: (value: string) => void;
    clientName: string;
}

const AVAILABLE_VARIABLES = [
    'client_name',
    'period',
    'campaigns',
    'user_name',
    'company'
] as const;

export const EmailPresetEditor: React.FC<EmailPresetEditorProps> = ({
    subject,
    body,
    onSubjectChange,
    onBodyChange,
    clientName
}) => {
    const { t } = useTranslation('clients');
    const [lastFocused, setLastFocused] = useState<'subject' | 'body' | null>(null);

    // Refs for cursor tracking could be used, but simple appending or insertion at last known position is better.
    // For simplicity with standard inputs/textareas, we can track cursor position on blur/change if needed,
    // or just assume we append if not focused? 
    // Actually, "insert at cursor" requires accessing the ref's current selectionStart/End.

    const subjectRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const insertVariable = (variable: string) => {
        const tag = `[${variable}]`;

        if (lastFocused === 'subject' && subjectRef.current) {
            const input = subjectRef.current;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const newValue = subject.substring(0, start) + tag + subject.substring(end);

            onSubjectChange(newValue);

            // Restore focus and cursor position
            setTimeout(() => {
                input.focus();
                input.setSelectionRange(start + tag.length, start + tag.length);
            }, 0);
        } else {
            // Default to body or if body was last focused
            const textarea = bodyRef.current;
            if (textarea) {
                const start = textarea.selectionStart || 0;
                const end = textarea.selectionEnd || 0;
                const newValue = body.substring(0, start) + tag + body.substring(end);

                onBodyChange(newValue);

                // Restore focus and cursor position
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + tag.length, start + tag.length);
                }, 0);
            }
        }
    };

    return (
        <div className="email-preset-editor">
            {/* Variable Toolbar */}
            <div className="email-variables-toolbar">
                <div className="email-variables-label">
                    <Tag />
                    {t('form.emailConfig.variables.label')}:
                </div>
                {AVAILABLE_VARIABLES.map(variable => (
                    <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="email-variable-tag"
                        title={t(`form.emailConfig.variables.tooltips.${variable}`)}
                    >
                        [{variable}]
                    </button>
                ))}
            </div>

            <div className="email-preset-group">
                <label htmlFor="emailSubject" className="email-preset-label">
                    {t('form.emailConfig.subject.label')}
                </label>
                <input
                    ref={subjectRef}
                    type="text"
                    id="emailSubject"
                    value={subject}
                    onChange={(e) => onSubjectChange(e.target.value)}
                    onFocus={() => setLastFocused('subject')}
                    className="email-preset-input"
                    placeholder={t('form.emailConfig.subject.placeholder', { clientName: clientName || 'Client' })}
                />
            </div>

            <div className="email-preset-group">
                <label htmlFor="emailBody" className="email-preset-label">
                    {t('form.emailConfig.body.label')}
                </label>
                <textarea
                    ref={bodyRef}
                    id="emailBody"
                    value={body}
                    onChange={(e) => onBodyChange(e.target.value)}
                    onFocus={() => setLastFocused('body')}
                    rows={6}
                    className="email-preset-textarea"
                    placeholder={t('form.emailConfig.body.placeholder')}
                />
            </div>
        </div>
    );
};
