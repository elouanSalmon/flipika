import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Copy, Trash2, Link as LinkIcon, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import themeService from '../../services/themeService';
import Spinner from '../common/Spinner';
import type { ReportTheme } from '../../types/reportThemes';
import type { Account } from '../../types/business';
import ThemePreview from './ThemePreview';
import ThemeEditor from './ThemeEditor';
import ConfirmationModal from '../common/ConfirmationModal';
import './ThemeManager.css';

interface ThemeManagerProps {
    accounts?: Account[];
    compact?: boolean;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ accounts = [], compact = false }) => {
    const { currentUser } = useAuth();
    const [themes, setThemes] = useState<ReportTheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingTheme, setEditingTheme] = useState<ReportTheme | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [themeToDelete, setThemeToDelete] = useState<ReportTheme | null>(null);

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
            toast.error('Erreur lors du chargement des thèmes');
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
            toast.success('Thème dupliqué');
        } catch (error) {
            console.error('Error duplicating theme:', error);
            toast.error('Erreur lors de la duplication');
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
            toast.success('Thème supprimé');
            setThemeToDelete(null);
        } catch (error) {
            console.error('Error deleting theme:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleSaveTheme = async () => {
        await loadThemes();
    };

    if (loading) {
        return (
            <div className="theme-manager-loading">
                <Spinner size={48} />
                <p>Chargement des thèmes...</p>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="theme-manager-compact">
                <div className="theme-manager-compact-header">
                    <h3>Mes thèmes</h3>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary-dark transition-all duration-200 font-medium text-sm shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                        onClick={handleCreateTheme}
                    >
                        <Plus size={16} />
                        Nouveau
                    </button>
                </div>

                {themes.length === 0 ? (
                    <div className="theme-manager-empty-compact">
                        <p>Aucun thème personnalisé</p>
                        <button className="px-4 py-2 border-2 border-primary/30 dark:border-primary/40 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200 font-medium text-sm" onClick={handleCreateTheme}>
                            Créer mon premier thème
                        </button>
                    </div>
                ) : (
                    <div className="theme-manager-grid-compact">
                        {themes.slice(0, 3).map(theme => (
                            <div key={theme.id} className="theme-card-compact">
                                <ThemePreview theme={theme} size="small" />
                                <div className="theme-card-compact-info">
                                    <div className="theme-card-compact-name">{theme.name}</div>
                                    <button
                                        className="px-3 py-1 border-2 border-primary/30 dark:border-primary/40 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200 font-medium text-xs"
                                        onClick={() => handleEditTheme(theme)}
                                    >
                                        Modifier
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
        <div className="theme-manager">
            <div className="theme-manager-header">
                <div className="theme-manager-header-left">
                    <div className="header-title-row">
                        <Palette size={32} className="header-icon" />
                        <h2>Mes thèmes de rapport</h2>
                    </div>
                    <p className="header-subtitle">Créez et gérez vos thèmes personnalisés pour vos rapports Google Ads</p>
                </div>
                <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary-dark transition-all duration-200 font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                    onClick={handleCreateTheme}
                >
                    <Plus size={18} />
                    Créer un thème
                </button>
            </div>

            {
                themes.length === 0 ? (
                    <div className="theme-manager-empty">
                        <div className="theme-manager-empty-icon">
                            <Palette />
                        </div>
                        <h3>Aucun thème personnalisé</h3>
                        <p>
                            Créez votre premier thème pour personnaliser l'apparence de vos rapports
                            et l'appliquer automatiquement à vos comptes Google Ads.
                        </p>
                        <button
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary-dark transition-all duration-200 font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                            onClick={handleCreateTheme}
                        >
                            <Plus size={20} />
                            Créer mon premier thème
                        </button>
                    </div>
                ) : (
                    <div className="theme-manager-grid">
                        {themes.map(theme => (
                            <div key={theme.id} className="theme-card">
                                <div className="theme-card-preview">
                                    <ThemePreview theme={theme} size="medium" />
                                    {theme.isDefault && (
                                        <div className="theme-card-badge">Thème par défaut</div>
                                    )}
                                </div>

                                <div className="theme-card-content">
                                    <div className="theme-card-header">
                                        <h3 className="theme-card-title">{theme.name}</h3>
                                        {theme.description && (
                                            <p className="theme-card-description">{theme.description}</p>
                                        )}
                                    </div>

                                    {theme.linkedAccountIds.length > 0 && (
                                        <div className="theme-card-linked">
                                            <LinkIcon size={14} />
                                            <span>
                                                {theme.linkedAccountIds.length} compte{theme.linkedAccountIds.length > 1 ? 's' : ''} lié{theme.linkedAccountIds.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}

                                    <div className="theme-card-actions">
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary-dark transition-all duration-200 font-medium text-sm shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                                            onClick={() => handleEditTheme(theme)}
                                            title="Modifier"
                                        >
                                            <Edit2 size={14} />
                                            Modifier
                                        </button>
                                        <button
                                            className="flex items-center justify-center p-2 border-2 border-primary/30 dark:border-primary/40 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200"
                                            onClick={() => handleDuplicateTheme(theme)}
                                            title="Dupliquer"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button
                                            className="flex items-center justify-center p-2 border-2 border-red-500/30 dark:border-red-500/40 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                            onClick={() => handleDeleteTheme(theme)}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
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
                title="Supprimer le thème"
                message={`Êtes-vous sûr de vouloir supprimer le thème "${themeToDelete?.name}" ?`}
                confirmLabel="Supprimer"
                isDestructive={true}
            />
        </div >
    );
};

export default ThemeManager;
