import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Share2, Archive, Trash2, MoreVertical, ArrowLeft, Zap, Settings, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import AutoSaveIndicator from './AutoSaveIndicator';
import './ReportEditorHeader.css';

interface ReportEditorHeaderProps {
    title: string;
    onTitleChange: (title: string) => void;
    autoSaveStatus: 'saved' | 'saving' | 'error';
    lastSaved?: Date;
    status: 'draft' | 'published' | 'archived';
    shareUrl?: string; // Public share URL for published reports

    // Actions
    onSave: () => void;
    onPublish: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onOpenSettings: () => void;

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
    onSave,
    onPublish,
    onArchive,
    onDelete,
    onOpenSettings,
    isSaving,
    canPublish,
}) => {
    const [showActions, setShowActions] = React.useState(false);
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

                {status === 'published' && shareUrl && (
                    <button
                        onClick={() => {
                            const fullUrl = `${window.location.origin}${shareUrl}`;
                            navigator.clipboard.writeText(fullUrl);
                            toast.success('Lien copié dans le presse-papier !');
                        }}
                        className="btn btn-secondary"
                        title="Copier le lien public"
                    >
                        <Link size={18} />
                        <span>Copier le lien</span>
                    </button>
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
