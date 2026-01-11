import React from 'react';
import { Plus, BarChart3, TrendingUp, FileText, Layout, Image } from 'lucide-react';
import { SlideType } from '../../types/reportTypes';
import ThemeSelector from '../themes/ThemeSelector';
import type { ReportTheme } from '../../types/reportThemes';
import './SlideLibrary.css';

interface SlideTemplate {
    type: SlideType;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: 'analytics' | 'content';
    scopeType: 'modifiable' | 'single_campaign' | 'multiple_campaigns';  // NEW: Scope classification
}

interface SlideLibraryProps {
    onAddSlide: (type: SlideType) => void;
    // Theme props (optional for Template context)
    userId?: string;
    accountId?: string;
    selectedTheme?: ReportTheme | null;
    onThemeSelect?: (theme: ReportTheme | null) => void;
    onCreateTheme?: () => void;
    // Additional props for modal behavior
    onClose?: () => void;
}

const SLIDE_TEMPLATES: SlideTemplate[] = [
    {
        type: SlideType.PERFORMANCE_OVERVIEW,
        title: 'Vue d\'ensemble des performances',
        description: 'Métriques clés : impressions, clics, coût, conversions',
        icon: <TrendingUp size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',  // Can be all, specific, or single
    },
    {
        type: SlideType.KEY_METRICS,
        title: 'Métriques Clés',
        description: 'Dépenses, Revenus, ROAS et CPA avec variations',
        icon: <BarChart3 size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',  // Can be all, specific, or single
    },
    {
        type: SlideType.CAMPAIGN_CHART,
        title: 'Graphique de campagne',
        description: 'Visualisation des données de campagne',
        icon: <BarChart3 size={24} />,
        category: 'analytics',
        scopeType: 'multiple_campaigns',  // Designed for comparison
    },
    {
        type: SlideType.AD_CREATIVE,
        title: 'Aperçu d\'annonce',
        description: 'Mockup d\'annonce Google Ads avec performances',
        icon: <Image size={24} />,
        category: 'analytics',
        scopeType: 'single_campaign',  // Only for single campaign
    },
    {
        type: SlideType.TEXT_BLOCK,
        title: 'Bloc de texte',
        description: 'Texte riche avec formatage',
        icon: <FileText size={24} />,
        category: 'content',
        scopeType: 'modifiable',  // Not data-driven
    },
    {
        type: SlideType.CUSTOM,
        title: 'Slide personnalisé',
        description: 'Créez votre propre slide',
        icon: <Layout size={24} />,
        category: 'content',
        scopeType: 'modifiable',  // Flexible
    },
];

const SlideLibrary: React.FC<SlideLibraryProps> = ({
    onAddSlide,
    userId,
    accountId,
    selectedTheme,
    onThemeSelect,
    onCreateTheme,
}) => {
    const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'analytics' | 'content'>('all');
    const [selectedScope, setSelectedScope] = React.useState<'all' | 'modifiable' | 'single_campaign' | 'multiple_campaigns'>('all');

    // Filter by both category and scope
    const filteredTemplates = SLIDE_TEMPLATES.filter(t => {
        const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
        const scopeMatch = selectedScope === 'all' || t.scopeType === selectedScope;
        return categoryMatch && scopeMatch;
    });

    return (
        <div className="slide-library">
            {/* Theme Selector Section - Only show if props are provided */}
            {userId && accountId && onThemeSelect && onCreateTheme && (
                <div className="slide-library-theme-section">
                    <ThemeSelector
                        userId={userId}
                        accountId={accountId}
                        selectedTheme={selectedTheme || null}
                        onThemeSelect={onThemeSelect}
                        onCreateTheme={onCreateTheme}
                    />
                </div>
            )}

            <div className="slide-library-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3>Bibliothèque de Slides</h3>
                    <p>Glissez ou cliquez pour ajouter</p>
                </div>
                {/* Close button for when used in modal */}
                {/* onClose is handled by parent modal usually, but we can add it here if needed, 
                    currently the parent handles the close button in the header */}
            </div>

            {/* Category Filter */}
            <div className="slide-categories" style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Catégorie
                </label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'analytics' | 'content')}
                    style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    <option value="all">Toutes les catégories</option>
                    <option value="analytics">Analytique</option>
                    <option value="content">Contenu</option>
                </select>
            </div>

            {/* Scope Filter */}
            <div className="slide-categories" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Portée des données
                </label>
                <select
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value as 'all' | 'modifiable' | 'single_campaign' | 'multiple_campaigns')}
                    style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    <option value="all">Toutes les portées</option>
                    <option value="modifiable">Modifiable</option>
                    <option value="multiple_campaigns">Campagnes multiples</option>
                    <option value="single_campaign">Campagne unique</option>
                </select>
            </div>

            {/* Slide Templates */}
            <div className="slide-templates">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.type}
                        className="slide-template"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('slideType', template.type);
                            e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => onAddSlide(template.type)}
                    >
                        <div className="slide-template-icon">
                            {template.icon}
                        </div>
                        <div className="slide-template-content">
                            <h4>{template.title}</h4>
                            <p>{template.description}</p>
                        </div>
                        <button className="slide-template-add" title="Ajouter">
                            <Plus size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SlideLibrary;
