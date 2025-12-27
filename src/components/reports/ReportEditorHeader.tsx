import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Share2, Archive, Trash2, MoreVertical, ArrowLeft, Zap, Settings, Link, Lock, Unlock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AutoSaveIndicator from './AutoSaveIndicator';
import ThemeToggle from '../ThemeToggle';
import './ReportEditorHeader.css';

interface ReportEditorHeaderProps {
    title: string;
    onTitleChange: (title: string) => void;
    autoSaveStatus: 'saved' | 'saving' | 'error';
    lastSaved?: Date;
    status: 'draft' | 'published' | 'archived';
    shareUrl?: string; // Public share URL for published reports
    isPasswordProtected?: boolean; // Whether the report is password protected

    // Actions
    onSave: () => void;
    onPublish: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onOpenSettings: () => void;
    onOpenSecurity?: () => void; // Open security modal
    onShareByEmail?: () => void; // Share by email

    // State
    isSaving: boolean;
    canPublish: boolean;
}

const ReportEditorHeader: React.FC<ReportEditorHeaderProps> = ({
    title,
    onTitleChange,
    autoSaveStatus,
    lastSaved,
    status,
    shareUrl,
    isPasswordProtected = false,
    onSave,
    onPublish,
    onArchive,
    onDelete,
    onOpenSettings,
    onOpenSecurity,
    onShareByEmail,
    isSaving,
    canPublish,
}) => {
    const [showActions, setShowActions] = React.useState(false);
    const [showShareMenu, setShowShareMenu] = React.useState(false);
    const navigate = useNavigate();

    return (
        <div className="report-editor-header">
            <div className="report-editor-header-left">
                <div className="report-editor-logo">
                    <div className="logo-icon">
                        <Zap size={24} />
                    </div>
                    <div className="logo-content">
                        <span className="logo-text gradient-text">Flipika</span>
                        <span className="logo-subtitle">IA</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/app/reports')}
                    className="btn-back"
                    title="Retour aux rapports"
                    aria-label="Retour aux rapports"
                >
                    <ArrowLeft size={20} />
                </button>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="report-title-input"
                    placeholder="Titre du rapport"
                />
                <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />
                <span className={`report-status-badge status-${status}`}>
                    {status === 'draft' && 'Brouillon'}
                    {status === 'published' && 'Publié'}
                    {status === 'archived' && 'Archivé'}
                </span>
            </div>

            <div className="report-editor-header-right">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Primary Actions */}
                <button
                    onClick={onOpenSettings}
                    className="btn btn-secondary"
                    title="Paramètres du rapport"
                >
                    <Settings size={18} />
                    <span>Paramètres</span>
                </button>

                <button
                    onClick={onSave}
                    disabled={isSaving || autoSaveStatus === 'saving'}
                    className="btn btn-secondary"
                    title="Sauvegarder"
                >
                    <Save size={18} />
                    <span>Sauvegarder</span>
                </button>

                {status === 'draft' && (
                    <button
                        onClick={onPublish}
                        disabled={!canPublish || isSaving}
                        className="btn btn-primary"
                        title="Publier le rapport"
                    >
                        <Share2 size={18} />
                        <span>Publier</span>
                    </button>
                )}

                {/* Share Dropdown for Published Reports */}
                {status === 'published' && (
                    <div className="actions-menu-wrapper">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="btn btn-primary"
                            title="Options de partage"
                        >
                            <Share2 size={18} />
                            <span>Partager</span>
                        </button>

                        {showShareMenu && (
                            <>
                                <div
                                    className="actions-menu-overlay"
                                    onClick={() => setShowShareMenu(false)}
                                />
                                <div className="actions-menu share-menu">
                                    {shareUrl && (
                                        <button
                                            onClick={() => {
                                                const fullUrl = `${window.location.origin}${shareUrl}`;
                                                navigator.clipboard.writeText(fullUrl);
                                                toast.success('Lien copié dans le presse-papier !');
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            <Link size={16} />
                                            <span>Copier le lien</span>
                                        </button>
                                    )}

                                    {onOpenSecurity && (
                                        <button
                                            onClick={() => {
                                                onOpenSecurity();
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            {isPasswordProtected ? <Lock size={16} /> : <Unlock size={16} />}
                                            <span>{isPasswordProtected ? 'Gérer le mot de passe' : 'Protéger par mot de passe'}</span>
                                        </button>
                                    )}

                                    {onShareByEmail && (
                                        <button
                                            onClick={() => {
                                                console.log('📧 Email share button clicked');
                                                onShareByEmail();
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            <Mail size={16} />
                                            <span>Partager par email</span>
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* More Actions Menu */}
                <div className="actions-menu-wrapper">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="btn btn-icon"
                        title="Plus d'actions"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showActions && (
                        <>
                            <div
                                className="actions-menu-overlay"
                                onClick={() => setShowActions(false)}
                            />
                            <div className="actions-menu">
                                {status !== 'archived' && (
                                    <button
                                        onClick={() => {
                                            onArchive();
                                            setShowActions(false);
                                        }}
                                        className="actions-menu-item"
                                    >
                                        <Archive size={16} />
                                        <span>Archiver</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
                                            onDelete();
                                        }
                                        setShowActions(false);
                                    }}
                                    className="actions-menu-item danger"
                                >
                                    <Trash2 size={16} />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportEditorHeader;
