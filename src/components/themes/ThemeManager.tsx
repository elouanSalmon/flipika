import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Copy, Trash2, Link as LinkIcon, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import themeService from '../../services/themeService';
import Spinner from '../common/Spinner';
import { useTranslation } from 'react-i18next';
import type { ReportTheme } from '../../types/reportThemes';
import type { Account } from '../../types/business';
import ThemePreview from './ThemePreview';
import ThemeEditor from './ThemeEditor';
import ConfirmationModal from '../common/ConfirmationModal';
import FilterBar from '../common/FilterBar';
import './ThemeManager.css'; // Keeping for potential specific tweaks

interface ThemeManagerProps {
    accounts?: Account[];
    compact?: boolean;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ accounts = [], compact = false }) => {
    const { currentUser } = useAuth();
    const { t } = useTranslation('themes');
    const [themes, setThemes] = useState<ReportTheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingTheme, setEditingTheme] = useState<ReportTheme | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [themeToDelete, setThemeToDelete] = useState<ReportTheme | null>(null);

    // Filters
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    const filteredThemes = selectedAccountId
        ? themes.filter(theme => theme.linkedAccountIds.includes(selectedAccountId))
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
            await loadThemes();
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
            await themeService.deleteTheme(themeToDelete.id);
            await loadThemes();
            toast.success(t('messages.deleteSuccess'));
            setThemeToDelete(null);
        } catch (error) {
            console.error('Error deleting theme:', error);
            toast.error(t('messages.deleteError'));
        }
    };

    const handleSaveTheme = async () => {
        await loadThemes();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Spinner size={48} />
                <p className="text-gray-500">{t('list.loading')}</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('list.title')}</h3>
                    <button
                        className="btn btn-primary btn-sm flex items-center gap-2"
                        onClick={handleCreateTheme}
                    >
                        <Plus size={16} />
                        {t('list.newButton')}
                    </button>
                </div>

                {themes.length === 0 ? (
                    <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 mb-3">{t('emptyState.noCustomThemes')}</p>
                        <button className="btn btn-secondary btn-sm" onClick={handleCreateTheme}>
                            {t('emptyState.createFirstButton')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {themes.slice(0, 3).map(theme => (
                            <div key={theme.id} className="listing-card p-3 group">
                                <div className="rounded-lg overflow-hidden mb-3 border border-gray-100 dark:border-gray-700">
                                    <ThemePreview theme={theme} size="small" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate pr-2">{theme.name}</div>
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
                        accounts={accounts}
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
                    </div>
                    <p className="header-subtitle">{t('list.pageSubtitle')}</p>
                </div>
                <button
                    className="create-btn"
                    onClick={handleCreateTheme}
                >
                    <Plus size={20} />
                    {t('list.createButton')}
                </button>
            </div>

            {
                accounts.length > 0 && (
                    <div className="mb-6">
                        <FilterBar
                            accounts={accounts.map(a => ({ id: a.id, name: a.name }))}
                            selectedAccountId={selectedAccountId}
                            onAccountChange={setSelectedAccountId}
                        />
                    </div>
                )
            }

            {
                filteredThemes.length === 0 && themes.length > 0 ? (
                    <div className="empty-state">
                        <Palette size={64} className="empty-icon" />
                        <h2>{t('emptyState.notFoundTitle')}</h2>
                        <p>{t('emptyState.notFoundDescription')}</p>
                        <button
                            className="btn-secondary"
                            onClick={() => setSelectedAccountId('')}
                        >
                            {t('emptyState.viewAllButton')}
                        </button>
                    </div>
                ) : themes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                            <Palette className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('emptyState.noCustomThemes')}</h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            {t('emptyState.createFirstDescription')}
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateTheme}
                        >
                            <Plus size={20} className="mr-2" />
                            {t('emptyState.createFirstButton')}
                        </button>
                    </div>
                ) : (
                    <div className="themes-grid">
                        {filteredThemes.map(theme => (
                            <div key={theme.id} className="listing-card p-0 group">
                                {/* Preview Area */}
                                <div className="relative bg-gray-5 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700">
                                    <ThemePreview theme={theme} size="medium" />
                                    {theme.isDefault && (
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                                            {t('card.defaultBadge')}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">{theme.name}</h3>
                                        {theme.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">{theme.description}</p>
                                        )}
                                    </div>

                                    {/* Footer / Stats */}
                                    <div className="flex items-center justify-between mt-4">
                                        {theme.linkedAccountIds.length > 0 ? (
                                            <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                                                <LinkIcon size={12} />
                                                <span>
                                                    {t('card.linkedAccounts_plural', { count: theme.linkedAccountIds.length })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">{t('card.noLinkedAccounts')}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Actions */}
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
                            </div>
                        ))}
                    </div>
                )
            }

            {
                showEditor && currentUser && (
                    <ThemeEditor
                        userId={currentUser.uid}
                        theme={editingTheme}
                        accounts={accounts}
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
        </div >
    );
};

export default ThemeManager;
