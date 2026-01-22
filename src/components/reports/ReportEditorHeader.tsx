import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, Share2, Archive, Trash2, MoreVertical, ArrowLeft, Settings, Link, Lock, Unlock, Mail, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import AutoSaveIndicator from './AutoSaveIndicator';
import ThemeToggle from '../ThemeToggle';
import Logo from '../Logo';
import ConfirmationModal from '../common/ConfirmationModal';
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
    onExportToGoogleSlides?: () => void; // Export to Google Slides

    // State
    isSaving: boolean;
    isLoadingSettings?: boolean;
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
    onExportToGoogleSlides,
    isSaving,
    isLoadingSettings = false,
    canPublish,
}) => {
    const { t } = useTranslation('reports');
    const [showActions, setShowActions] = React.useState(false);
    const [showShareMenu, setShowShareMenu] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const navigate = useNavigate();

    return (
        <div className="report-editor-header">
            <div className="report-editor-header-left">
                <div className="report-editor-logo">
                    <Logo subtitle="IA" onClick={() => navigate('/app/reports')} />
                </div>
                <button
                    onClick={() => navigate('/app/reports')}
                    className="btn-back"
                    title={t('header.backToReports')}
                    aria-label={t('header.backToReports')}
                >
                    <ArrowLeft size={20} />
                </button>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="report-title-input"
                    placeholder={t('header.titlePlaceholder')}
                />
                <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />
                <span className={`report-status-badge status-${status}`}>
                    {t(`card.status.${status}`)}
                </span>
            </div>

            <div className="report-editor-header-right">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Primary Actions */}
                <button
                    onClick={onOpenSettings}
                    disabled={isLoadingSettings}
                    className="btn btn-secondary"
                    title={t('header.settings')}
                >
                    {isLoadingSettings ? (
                        <>
                            <svg className="animate-spin h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t('header.loading')}</span>
                        </>
                    ) : (
                        <>
                            <Settings size={18} />
                            <span>{t('header.settings')}</span>
                        </>
                    )}
                </button>

                <button
                    onClick={onSave}
                    disabled={isSaving || autoSaveStatus === 'saving'}
                    className="btn btn-secondary"
                    title={t('header.save')}
                >
                    <Save size={18} />
                    <span>{t('header.save')}</span>
                </button>

                {status === 'draft' && (
                    <button
                        onClick={onPublish}
                        disabled={!canPublish || isSaving}
                        className="btn btn-primary"
                        title={t('header.publish')}
                    >
                        <Share2 size={18} />
                        <span>{t('header.publish')}</span>
                    </button>
                )}

                {/* Share Dropdown for Published Reports */}
                {status === 'published' && (
                    <div className="actions-menu-wrapper">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="btn btn-primary"
                            title={t('header.share')}
                        >
                            <Share2 size={18} />
                            <span>{t('header.share')}</span>
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
                                                toast.success(t('header.linkCopied'));
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            <Link size={18} />
                                            <span>{t('header.copyLink')}</span>
                                        </button>
                                    )}

                                    {shareUrl && (
                                        <button
                                            onClick={() => {
                                                const fullUrl = `${window.location.origin}${shareUrl}`;
                                                window.open(fullUrl, '_blank');
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            <ExternalLink size={18} />
                                            <span>{t('header.openInNewTab')}</span>
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
                                            {isPasswordProtected ? <Lock size={18} /> : <Unlock size={18} />}
                                            <span>{isPasswordProtected ? t('header.managePassword') : t('header.protectPassword')}</span>
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
                                            <Mail size={18} />
                                            <span>{t('header.shareEmail')}</span>
                                        </button>
                                    )}

                                    {onExportToGoogleSlides && (
                                        <button
                                            onClick={() => {
                                                console.log('📊 Google Slides export button clicked');
                                                onExportToGoogleSlides();
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-10H8v2h8v-2zm0 4H8v2h8v-2z" />
                                            </svg>
                                            <span>{t('header.exportGoogleSlides')}</span>
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
                        title={t('header.moreActions')}
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
                                        <Archive size={18} />
                                        <span>{t('header.archive')}</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(true);
                                        setShowActions(false);
                                    }}
                                    className="actions-menu-item danger"
                                >
                                    <Trash2 size={18} />
                                    <span>{t('header.delete')}</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onDelete}
                title={t('header.deleteModal.title')}
                message={t('header.deleteModal.message')}
                confirmLabel={t('header.deleteModal.confirm')}
                isDestructive={true}
            />
        </div>
    );
};

export default ReportEditorHeader;
