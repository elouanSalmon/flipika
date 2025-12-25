import React from 'react';
import { Plus, BarChart3, TrendingUp, FileText, Layout } from 'lucide-react';
import { WidgetType } from '../../types/reportTypes';
import ThemeSelector from '../themes/ThemeSelector';
import type { ReportTheme } from '../../types/reportThemes';
import './WidgetLibrary.css';

interface WidgetTemplate {
    type: WidgetType;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: 'analytics' | 'content';
}

interface WidgetLibraryProps {
    onAddWidget: (type: WidgetType) => void;
    // Theme props
    userId: string;
    accountId: string;
    selectedTheme: ReportTheme | null;
    onThemeSelect: (theme: ReportTheme | null) => void;
    onCreateTheme: () => void;
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
    {
        type: WidgetType.PERFORMANCE_OVERVIEW,
        title: 'Vue d\'ensemble des performances',
        description: 'Métriques clés : impressions, clics, coût, conversions',
        icon: <TrendingUp size={24} />,
        category: 'analytics',
    },
    {
        type: WidgetType.CAMPAIGN_CHART,
        title: 'Graphique de campagne',
        description: 'Visualisation des données de campagne',
        icon: <BarChart3 size={24} />,
        category: 'analytics',
    },
    {
        type: WidgetType.TEXT_BLOCK,
        title: 'Bloc de texte',
        description: 'Texte riche avec formatage',
        icon: <FileText size={24} />,
        category: 'content',
    },
    {
        type: WidgetType.CUSTOM,
        title: 'Widget personnalisé',
        description: 'Créez votre propre widget',
        icon: <Layout size={24} />,
        category: 'content',
    },
];

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
    onAddWidget,
    userId,
    accountId,
    selectedTheme,
    onThemeSelect,
    onCreateTheme,
}) => {
    const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'analytics' | 'content'>('all');

    const filteredTemplates = selectedCategory === 'all'
        ? WIDGET_TEMPLATES
        : WIDGET_TEMPLATES.filter(t => t.category === selectedCategory);

    return (
        <div className="widget-library">
            {/* Theme Selector Section */}
            <div className="widget-library-theme-section">
                <ThemeSelector
                    userId={userId}
                    accountId={accountId}
                    selectedTheme={selectedTheme}
                    onThemeSelect={onThemeSelect}
                    onCreateTheme={onCreateTheme}
                />
            </div>

            <div className="widget-library-header">
                <h3>Bibliothèque de Widgets</h3>
                <p>Glissez ou cliquez pour ajouter</p>
            </div>

            {/* Category Filter */}
            <div className="widget-categories">
                <button
                    className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                >
                    Tous
                </button>
                <button
                    className={`category-btn ${selectedCategory === 'analytics' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('analytics')}
                >
                    Analytique
                </button>
                <button
                    className={`category-btn ${selectedCategory === 'content' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('content')}
                >
                    Contenu
                </button>
            </div>

            {/* Widget Templates */}
            <div className="widget-templates">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.type}
                        className="widget-template"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('widgetType', template.type);
                            e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => onAddWidget(template.type)}
                    >
                        <div className="widget-template-icon">
                            {template.icon}
                        </div>
                        <div className="widget-template-content">
                            <h4>{template.title}</h4>
                            <p>{template.description}</p>
                        </div>
                        <button className="widget-template-add" title="Ajouter">
                            <Plus size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WidgetLibrary;
