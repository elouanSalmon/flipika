/**
 * Constants for Email Presets
 * Used to ensure consistency between the Client Form (Editor) and Report Preview (Sender).
 */

export const EMAIL_PRESET_KEYS = {
    SUBJECT_DEFAULT: 'form.emailConfig.subject.default',
    BODY_DEFAULT: 'form.emailConfig.body.default'
} as const;

// Namespace is 'clients'
export const EMAIL_PRESET_NAMESPACE = 'clients';

export const getFullKey = (key: string) => `${EMAIL_PRESET_NAMESPACE}:${key}`;
