import React, { useState } from 'react';
import { X, Lock, Unlock, Eye, EyeOff, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './ReportSecurityModal.css';

interface ReportSecurityModalProps {
    isPasswordProtected: boolean;
    onClose: () => void;
    onUpdate: (password: string | null) => Promise<void>;
}

const ReportSecurityModal: React.FC<ReportSecurityModalProps> = ({
    isPasswordProtected,
    onClose,
    onUpdate,
}) => {
    const { t } = useTranslation('reports');
    const [isProtected, setIsProtected] = useState(isPasswordProtected);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleToggleProtection = () => {
        setIsProtected(!isProtected);
        if (isProtected) {
            // If disabling protection, clear password
            setPassword('');
        }
    };

    const handleCopyPassword = () => {
        if (password) {
            navigator.clipboard.writeText(password);
            setCopied(true);
            toast.success(t('security.passwordCopied'));
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isProtected && password.length < 6) {
            toast.error(t('security.passwordTooShort'));
            return;
        }

        setIsLoading(true);

        try {
            // Pass null to remove protection, or the password to set/update it
            await onUpdate(isProtected ? password : null);
            toast.success(
                isProtected
                    ? t('security.protectionEnabled')
                    : t('security.protectionDisabled')
            );
            onClose();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(t('security.updateError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container security-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-content">
                        <div className="modal-icon">
                            {isProtected ? <Lock size={24} /> : <Unlock size={24} />}
                        </div>
                        <div>
                            <h2 className="modal-title">{t('security.title')}</h2>
                            <p className="modal-subtitle">
                                {t('security.description')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-btn" aria-label={t('editor.close')}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Toggle Protection */}
                    <div className="security-toggle">
                        <div className="security-toggle-info">
                            <div className="security-toggle-label">
                                {isProtected ? <Lock size={20} /> : <Unlock size={20} />}
                                <span>{t('security.passwordProtection')}</span>
                            </div>
                            <p className="security-toggle-description">
                                {isProtected
                                    ? t('security.enabledDescription')
                                    : t('security.disabledDescription')}
                            </p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={isProtected}
                                onChange={handleToggleProtection}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {/* Password Input */}
                    {isProtected && (
                        <div className="password-section">
                            <label className="form-label">
                                {t('security.passwordLabel')}
                                <span className="form-label-required">*</span>
                            </label>
                            <div className="password-input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('security.passwordPlaceholder')}
                                    className="form-input password-input"
                                    minLength={6}
                                    required={isProtected}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle-btn"
                                    title={showPassword ? 'Masquer' : 'Afficher'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {password && (
                                    <button
                                        type="button"
                                        onClick={handleCopyPassword}
                                        className="password-copy-btn"
                                        title="Copier le mot de passe"
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                )}
                            </div>
                            <p className="form-help">
                                {t('security.passwordHelp')}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={isLoading}
                        >
                            {t('security.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || (isProtected && password.length < 6)}
                        >
                            {isLoading ? t('security.saving') : t('security.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportSecurityModal;
