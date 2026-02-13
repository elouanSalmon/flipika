import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Copy, Trash2, Palette, Info, Grid, List as ListIcon, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import themeService from '../../services/themeService';
import FeatureAccessGuard from '../common/FeatureAccessGuard';
import Spinner from '../common/Spinner';
import { useTranslation } from 'react-i18next';
import type { ReportTheme } from '../../types/reportThemes';
import type { Client } from '../../types/client';
import ThemePreview from './ThemePreview';
import ThemeEditor from './ThemeEditor';
import { useTutorial } from '../../contexts/TutorialContext';
import ConfirmationModal from '../common/ConfirmationModal';
import InfoModal from '../common/InfoModal';
import FilterBar from '../common/FilterBar';
import ClientLogoAvatar from '../common/ClientLogoAvatar';
import './ThemeManager.css'; // Keeping for potential specific tweaks

interface ThemeManagerProps {
    clients?: Client[];
    compact?: boolean;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ clients = [], compact = false }) => {
    const { currentUser } = useAuth();
    const { isConnected } = useGoogleAds();
    const { canAccess } = useSubscription();
    const { isDemoMode } = useDemoMode();
    const { t } = useTranslation('themes');
    const { refresh: refreshTutorial } = useTutorial();
    const [themes, setThemes] = useState<ReportTheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingTheme, setEditingTheme] = useState<ReportTheme | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [themeToDelete, setThemeToDelete] = useState<ReportTheme | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filters
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    const hasAccess = (canAccess && isConnected) || isDemoMode;
    const canCreateTheme = hasAccess; // Harmonized naming

    const filteredThemes = selectedClientId
        ? themes.filter(theme => clients.find(c => c.id === selectedClientId)?.defaultThemeId === theme.id)
        : themes;

    useEffect(() => {
        if (currentUser) {
            loadThemes();
        }
    }, [currentUser]);

    const loadThemes = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const userThemes = await themeService.getUserThemes(currentUser.uid);
            setThemes(userThemes);
        } catch (error) {
            console.error('Error loading themes:', error);
            toast.error(t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTheme = () => {
        setEditingTheme(null);
        setShowEditor(true);
    };

    const handleEditTheme = (theme: ReportTheme) => {
        setEditingTheme(theme);
        setShowEditor(true);
    };

    const handleDuplicateTheme = async (theme: ReportTheme) => {
        try {
            const newName = `${theme.name} (Copie)`;
            await themeService.duplicateTheme(theme.id, newName);
            await loadThemes();
            await refreshTutorial(); // Refresh tutorial status
            toast.success(t('messages.duplicateSuccess'));
        } catch (error) {
            console.error('Error duplicating theme:', error);
            toast.error(t('messages.duplicateError'));
        }
    };

    const handleDeleteTheme = (theme: ReportTheme) => {
        setThemeToDelete(theme);
        setDeleteModalOpen(true);
    };

    const confirmDeleteTheme = async () => {
        if (!themeToDelete) return;

        try {
            await themeService.deleteTheme(themeToDelete.id);
            await loadThemes();
            await refreshTutorial(); // Refresh tutorial status
            toast.success(t('messages.deleteSuccess'));
            setThemeToDelete(null);
        } catch (error) {
            console.error('Error deleting theme:', error);
            toast.error(t('messages.deleteError'));
        }
    };

    const handleSaveTheme = async () => {
        await loadThemes();
        await refreshTutorial(); // Refresh tutorial status
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Spinner size={48} />
                <p className="text-neutral-500">{t('list.loading')}</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t('list.title')}</h3>
                    <button
                        className="btn btn-primary btn-sm flex items-center gap-2"
                        onClick={handleCreateTheme}
                        disabled={!canCreateTheme}
                        style={{
                            opacity: !canCreateTheme ? 0.5 : 1,
                            cursor: !canCreateTheme ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Plus size={16} />
                        {t('list.newButton')}
                    </button>
                </div>

                {themes.length === 0 ? (
                    <div className="text-center p-8 bg-white/50 dark:bg-neutral-800/50 backdrop-blur rounded-xl border border-neutral-100 dark:border-neutral-700">
                        <p className="text-sm text-neutral-500 mb-3">{t('emptyState.noCustomThemes')}</p>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleCreateTheme}
                            disabled={!canCreateTheme}
                            style={{
                                opacity: !canCreateTheme ? 0.5 : 1,
                                cursor: !canCreateTheme ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {t('emptyState.createFirstButton')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {themes.slice(0, 3).map(theme => (
                            <div key={theme.id} className="listing-card p-3 group">
                                <div className="rounded-lg overflow-hidden mb-3 border border-neutral-100 dark:border-neutral-700">
                                    <ThemePreview theme={theme} size="small" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate pr-2 flex items-center gap-2">
                                        {theme.name}
                                        <div className="status-badge success px-1.5 py-0.5 text-[10px]" title={t('card.status.ready', { defaultValue: 'Prêt' })}>
                                            <CheckCircle2 size={10} />
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-xs"
                                        onClick={() => handleEditTheme(theme)}
                                    >
                                        {t('card.actions.edit')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showEditor && currentUser && (
                    <ThemeEditor
                        userId={currentUser.uid}
                        theme={editingTheme}
                        clients={clients}
                        onSave={handleSaveTheme}
                        onClose={() => setShowEditor(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-title-row">
                        <Palette size={32} className="header-icon" />
                        <h1>{t('list.pageTitle')}</h1>
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="info-button"
                            style={{
                                padding: '0.5rem',
                                background: 'transparent',
                                border: '2px solid var(--color-border, #e5e7eb)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                color: 'var(--color-text-secondary, #6b7280)'
                            }}
                            title={t('info.buttonLabel')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary, #2563eb)';
                                e.currentTarget.style.color = 'var(--color-primary, #2563eb)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border, #e5e7eb)';
                                e.currentTarget.style.color = 'var(--color-text-secondary, #6b7280)';
                            }}
                        >
                            <Info size={20} />
                        </button>
                    </div>
                    <p className="header-subtitle">{t('list.pageSubtitle')}</p>
                </div>
                <button
                    className="create-btn"
                    onClick={handleCreateTheme}
                    disabled={!canCreateTheme}
                    style={{
                        opacity: !canCreateTheme ? 0.5 : 1,
                        cursor: !canCreateTheme ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Plus size={20} />
                    {t('list.createButton')}
                </button>
            </div>

            <FeatureAccessGuard featureName="les thèmes">
                <div className="controls-section mb-6">
                    {clients.length > 0 && (
                        <div className="mb-4">
                            <FilterBar
                                clients={clients.map(c => ({ id: c.id, name: c.name }))}
                                selectedClientId={selectedClientId}
                                onClientChange={setSelectedClientId}
                            />
                        </div>
                    )}

                    <div className="view-controls flex justify-end gap-2">
                        <button
                            className={`p-2.5 rounded-lg border-2 transition-all ${viewMode === 'grid'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-primary hover:text-primary'
                                }`}
                            onClick={() => setViewMode('grid')}
                            title={t('gridView', { defaultValue: 'Vue grille' })}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`p-2.5 rounded-lg border-2 transition-all ${viewMode === 'list'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-primary hover:text-primary'
                                }`}
                            onClick={() => setViewMode('list')}
                            title={t('listView', { defaultValue: 'Vue liste' })}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>

                {
                    filteredThemes.length === 0 && themes.length > 0 ? (
                        <div className="empty-state">
                            <Palette size={64} className="empty-icon" />
                            <h2>{t('emptyState.notFoundTitle')}</h2>
                            <p>{t('emptyState.notFoundDescription')}</p>
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedClientId('')}
                            >
                                {t('emptyState.viewAllButton')}
                            </button>
                        </div>
                    ) : themes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center bg-white/50 dark:bg-neutral-800/50 backdrop-blur rounded-2xl border border-neutral-100 dark:border-neutral-700">
                            <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                                <Palette className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{t('emptyState.noCustomThemes')}</h3>
                            <p className="text-neutral-500 mb-6 max-w-md">
                                {t('emptyState.createFirstDescription')}
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateTheme}
                                disabled={!canCreateTheme}
                                style={{
                                    opacity: !canCreateTheme ? 0.5 : 1,
                                    cursor: !canCreateTheme ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <Plus size={20} className="mr-2" />
                                {t('emptyState.createFirstButton')}
                            </button>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {filteredThemes.map(theme => (
                                <div key={theme.id} className={`listing-card group !overflow-hidden ${viewMode === 'list' ? 'flex flex-row p-0' : 'p-0'}`}>
                                    {/* Preview Area */}
                                    <div className={`relative bg-neutral-5 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-700 ${viewMode === 'list' ? 'w-48 border-b-0 border-r shrink-0 p-2 flex items-center justify-center' : 'p-4'}`}>
                                        <ThemePreview theme={theme} size={viewMode === 'list' ? 'small' : 'medium'} />
                                        {theme.isDefault && (
                                            <div className={`absolute bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${viewMode === 'list' ? 'top-2 right-2 px-1.5 py-0.5 text-[10px]' : 'top-3 right-3 px-2 py-1'}`}>
                                                {viewMode === 'list' ? 'Défaut' : t('card.defaultBadge')}
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 p-4 justify-between' : 'p-5'}`}>
                                        <div className={viewMode === 'list' ? 'flex justify-between items-start' : 'mb-4'}>
                                            <div className="w-full">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1 truncate">{theme.name}</h3>
                                                    {viewMode === 'grid' && (
                                                        <div className="status-badge success flex-shrink-0" title={t('card.status.ready', { defaultValue: 'Prêt' })}>
                                                            <CheckCircle2 size={12} />
                                                            <span>{t('card.status.ready', { defaultValue: 'Prêt' })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {theme.description && (
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{theme.description}</p>
                                                )}
                                            </div>

                                            {/* List View Actions - Always visible */}
                                            {viewMode === 'list' && (
                                                <div className="flex items-center gap-2">
                                                    <div className="status-badge success hidden sm:flex" title={t('card.status.ready', { defaultValue: 'Prêt à l\'emploi' })}>
                                                        <CheckCircle2 size={10} />
                                                        <span>{t('card.status.ready', { defaultValue: 'Prêt' })}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDuplicateTheme(theme)}
                                                        className="p-2 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title={t('card.actions.duplicate')}
                                                    >
                                                        <Copy size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditTheme(theme)}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title={t('card.actions.edit')}
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTheme(theme)}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title={t('card.actions.delete')}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer / Stats - Client Logos */}
                                        <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-2' : 'mt-4'}`}>
                                            {(() => {
                                                const linkedClients = clients.filter(c => theme.linkedClientIds?.includes(c.id));
                                                const linkedCount = linkedClients.length;
                                                const maxDisplay = 4;
                                                return linkedCount > 0 ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex items-center -space-x-1.5">
                                                            {linkedClients.slice(0, maxDisplay).map(client => (
                                                                <ClientLogoAvatar
                                                                    key={client.id}
                                                                    logo={client.logoUrl}
                                                                    name={client.name}
                                                                    size="sm"
                                                                    className="ring-2 ring-white dark:ring-neutral-800"
                                                                />
                                                            ))}
                                                            {linkedCount > maxDisplay && (
                                                                <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 ring-2 ring-white dark:ring-neutral-800">
                                                                    +{linkedCount - maxDisplay}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                                                            {t('card.linkedClients_plural', { count: linkedCount })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">{t('card.noLinkedClients')}</span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Grid View Hover Actions */}
                                    {viewMode === 'grid' && (
                                        <div className="listing-card-actions">
                                            <button
                                                onClick={() => handleDuplicateTheme(theme)}
                                                className="action-btn-icon"
                                                title={t('card.actions.duplicate')}
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditTheme(theme)}
                                                className="action-btn-icon text-primary hover:bg-primary/10"
                                                title={t('card.actions.edit')}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTheme(theme)}
                                                className="action-btn-icon destructive"
                                                title={t('card.actions.delete')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                }
            </FeatureAccessGuard >

            {
                showEditor && currentUser && (
                    <ThemeEditor
                        userId={currentUser.uid}
                        theme={editingTheme}
                        clients={clients}
                        onSave={handleSaveTheme}
                        onClose={() => setShowEditor(false)}
                    />
                )
            }

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setThemeToDelete(null);
                }}
                onConfirm={confirmDeleteTheme}
                title={t('messages.deleteConfirmTitle')}
                message={t('messages.deleteConfirmMessage', { name: themeToDelete?.name })}
                confirmLabel={t('messages.deleteConfirmButton')}
                isDestructive={true}
            />

            <InfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title={t('info.modalTitle')}
                content={t('info.modalContent')}
            />
        </div >
    );
};

export default ThemeManager;
