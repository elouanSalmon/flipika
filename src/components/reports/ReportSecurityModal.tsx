import React, { useState } from 'react';
import { X, Lock, Unlock, Eye, EyeOff, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
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
            toast.success('Mot de passe copié !');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isProtected && password.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        try {
            // Pass null to remove protection, or the password to set/update it
            await onUpdate(isProtected ? password : null);
            toast.success(
                isProtected
                    ? 'Protection par mot de passe activée'
                    : 'Protection par mot de passe désactivée'
            );
            onClose();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error('Erreur lors de la mise à jour');
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
                            <h2 className="modal-title">Sécurité du rapport</h2>
                            <p className="modal-subtitle">
                                Protégez votre rapport avec un mot de passe
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-btn" aria-label="Fermer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Toggle Protection */}
                    <div className="security-toggle">
                        <div className="security-toggle-info">
                            <div className="security-toggle-label">
                                {isProtected ? <Lock size={20} /> : <Unlock size={20} />}
                                <span>Protection par mot de passe</span>
                            </div>
                            <p className="security-toggle-description">
                                {isProtected
                                    ? 'Les visiteurs devront entrer un mot de passe pour accéder au rapport'
                                    : 'Le rapport est accessible publiquement sans mot de passe'}
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
                                Mot de passe
                                <span className="form-label-required">*</span>
                            </label>
                            <div className="password-input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 caractères"
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
                                Ce mot de passe sera demandé aux visiteurs pour accéder au rapport.
                                Partagez-le de manière sécurisée.
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
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || (isProtected && password.length < 6)}
                        >
                            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportSecurityModal;
