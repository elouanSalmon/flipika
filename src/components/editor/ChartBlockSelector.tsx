import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
    BarChart3, TrendingUp, PieChart, Target,
    Image, Filter, Layout, Trophy, X, Search, Grid3x3, Settings
} from 'lucide-react';
import './ChartBlockSelector.css';

interface ChartBlockSelectorProps {
    editor: Editor;
}

interface ChartOption {
    type: string;
    label: string;
    description: string;
    icon: React.ElementType;
    config: any;
    category: 'analytics' | 'charts' | 'content';
}

interface Category {
    id: string;
    label: string;
    icon: React.ElementType;
    items: ChartOption[];
}

interface Section {
    id: string;
    label: string;
    items: ChartOption[];
}

const ANALYTICS_ITEMS: ChartOption[] = [
    {
        type: 'performance_overview',
        label: 'Vue d\'ensemble',
        description: 'Métriques clés & comparaisons',
        icon: TrendingUp,
        config: {},
        category: 'analytics'
    },
    {
        type: 'key_metrics',
        label: 'Métriques Clés',
        description: 'Grille 2x2 de KPIs',
        icon: Target,
        config: {},
        category: 'analytics'
    },
    {
        type: 'top_performers',
        label: 'Meilleurs Éléments',
        description: 'Top campagnes/groupes',
        icon: Trophy,
        config: {},
        category: 'analytics'
    },
    {
        type: 'flexible_data',
        label: 'Données Flexibles',
        description: 'Tableau/Graphique personnalisé',
        icon: Settings,
        config: {
            title: 'Nouveau Bloc',
            visualization: 'table',
            metrics: ['metrics.impressions', 'metrics.clicks'],
            dimension: 'segments.date',
            isNew: true
        },
        category: 'analytics'
    },
];

const CHARTS_ITEMS: ChartOption[] = [
    {
        type: 'campaign_chart',
        label: 'Graphique',
        description: 'Ligne, barre, aire',
        icon: BarChart3,
        config: { chartType: 'line' },
        category: 'charts'
    },
    {
        type: 'funnel_analysis',
        label: 'Entonnoir',
        description: 'Taux de conversion',
        icon: Filter,
        config: {},
        category: 'charts'
    },
    {
        type: 'heatmap',
        label: 'Heatmap',
        description: 'Carte de chaleur',
        icon: Layout,
        config: {},
        category: 'charts'
    },
    {
        type: 'device_platform_split',
        label: 'Répartition',
        description: 'Par appareil/plateforme',
        icon: PieChart,
        config: {},
        category: 'charts'
    },
];

const CONTENT_ITEMS: ChartOption[] = [
    {
        type: 'ad_creative',
        label: 'Créatifs Pub',
        description: 'Aperçu des visuels',
        icon: Image,
        config: {},
        category: 'content'
    },
];

export const ChartBlockSelector: React.FC<ChartBlockSelectorProps> = ({ editor }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close flyout when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveCategory(null);
                setSearchTerm('');
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Combine all items into one master list
    const ALL_ITEMS = [...ANALYTICS_ITEMS, ...CHARTS_ITEMS, ...CONTENT_ITEMS];

    // Define categories for the sidebar
    const categories: Category[] = [
        { id: 'all', label: 'Tout', icon: Grid3x3, items: ALL_ITEMS },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, items: ANALYTICS_ITEMS },
        { id: 'charts', label: 'Graphiques', icon: BarChart3, items: CHARTS_ITEMS },
        { id: 'content', label: 'Contenu', icon: Image, items: CONTENT_ITEMS },
    ];

    const handleInsertChart = (chart: ChartOption) => {
        editor.chain().focus().insertDataBlock({
            blockType: chart.type,
            config: chart.config
        }).run();

        setActiveCategory(null);
        setSearchTerm('');
    };

    // Get items to display based on active category
    const getActiveItems = (): ChartOption[] => {
        if (!activeCategory) return [];
        const category = categories.find(c => c.id === activeCategory);
        return category?.items || [];
    };

    // Filter items based on search term
    const getFilteredItems = (): ChartOption[] => {
        const items = getActiveItems();
        if (!searchTerm.trim()) return items;

        const term = searchTerm.toLowerCase();
        return items.filter(item =>
            item.label.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
        );
    };

    // Group items by section for "all" category
    const getSections = (): Section[] => {
        const filteredItems = getFilteredItems();

        if (activeCategory !== 'all') {
            // Single section for specific categories
            return [{
                id: activeCategory || 'default',
                label: categories.find(c => c.id === activeCategory)?.label || '',
                items: filteredItems
            }];
        }

        // Multiple sections for "all" category
        const sections: Section[] = [];

        const analyticsFiltered = filteredItems.filter(i => i.category === 'analytics');
        if (analyticsFiltered.length > 0) {
            sections.push({ id: 'analytics', label: 'Analytics', items: analyticsFiltered });
        }

        const chartsFiltered = filteredItems.filter(i => i.category === 'charts');
        if (chartsFiltered.length > 0) {
            sections.push({ id: 'charts', label: 'Graphiques', items: chartsFiltered });
        }

        const contentFiltered = filteredItems.filter(i => i.category === 'content');
        if (contentFiltered.length > 0) {
            sections.push({ id: 'content', label: 'Contenu', items: contentFiltered });
        }

        return sections;
    };

    const sections = getSections();
    const hasResults = sections.some(s => s.items.length > 0);

    // Auto-focus search when flyout opens
    useEffect(() => {
        if (activeCategory && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [activeCategory]);

    return (
        <div className="chart-selector-container" ref={containerRef}>
            {/* Flyout Menu */}
            <div className={`chart-flyout ${activeCategory ? 'is-open' : ''}`}>
                <div className="chart-flyout-header">
                    <div className="flyout-search-wrapper">
                        <Search size={16} className="flyout-search-icon" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Rechercher un bloc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flyout-search-input"
                        />
                    </div>
                    <button className="close-flyout" onClick={() => { setActiveCategory(null); setSearchTerm(''); }}>
                        <X size={16} />
                    </button>
                </div>

                <div className="chart-flyout-content">
                    {!hasResults ? (
                        <div className="flyout-empty-state">
                            <Search size={32} className="empty-state-icon" />
                            <p className="empty-state-text">Aucun résultat trouvé</p>
                            <p className="empty-state-subtext">Essayez un autre terme de recherche</p>
                        </div>
                    ) : (
                        sections.map((section) => (
                            <div key={section.id} className="chart-section">
                                {activeCategory === 'all' && (
                                    <div className="section-header">
                                        <h5 className="section-title">{section.label}</h5>
                                        <span className="section-count">{section.items.length}</span>
                                    </div>
                                )}
                                <div className="chart-flyout-grid">
                                    {section.items.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={index}
                                                className="chart-flyout-item"
                                                onClick={() => handleInsertChart(item)}
                                            >
                                                <div className="flyout-item-icon">
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flyout-item-content">
                                                    <span className="flyout-item-label">{item.label}</span>
                                                    <span className="flyout-item-desc">{item.description}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Vertical Toolbar */}
            <div className="chart-sidebar">
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            className={`chart-sidebar-btn ${isActive ? 'is-active' : ''}`}
                            onClick={() => setActiveCategory(isActive ? null : category.id)}
                            title={category.label}
                        >
                            <Icon size={20} />
                            {category.items.length > 0 && (
                                <span className="sidebar-badge">{category.items.length}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
