import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
    BarChart3, TrendingUp, PieChart, Target,
    Image, Filter, Layout, Trophy, X, Search, Grid3x3, Settings,
    Building2, Table as TableIcon, Columns2, Presentation, PartyPopper
} from 'lucide-react';
import './ChartBlockSelector.css';

interface ChartBlockSelectorProps {
    editor: Editor;
}

interface BlockOption {
    type: string;
    label: string;
    description: string;
    icon: React.ElementType;
    config?: any;
    category: 'analytics' | 'charts' | 'content' | 'layout' | 'slides';
    action?: 'dataBlock' | 'content' | 'event';
    eventName?: string;
}

interface Category {
    id: string;
    label: string;
    icon: React.ElementType;
    items: BlockOption[];
}

interface Section {
    id: string;
    label: string;
    items: BlockOption[];
}

const ANALYTICS_ITEMS: BlockOption[] = [
    {
        type: 'flexible_data',
        label: 'Donnees Flexibles',
        description: 'Tableau/Graphique personnalise',
        icon: Settings,
        config: {
            title: 'Nouveau Bloc',
            visualization: 'table',
            metrics: ['metrics.impressions', 'metrics.clicks'],
            dimension: 'segments.date',
            isNew: true
        },
        category: 'analytics',
        action: 'dataBlock'
    },
    {
        type: 'performance_overview',
        label: 'Vue d\'ensemble',
        description: 'Metriques cles & comparaisons',
        icon: TrendingUp,
        config: {},
        category: 'analytics',
        action: 'dataBlock'
    },
    {
        type: 'key_metrics',
        label: 'Metriques Cles',
        description: 'Grille 2x2 de KPIs',
        icon: Target,
        config: {},
        category: 'analytics',
        action: 'dataBlock'
    },
    {
        type: 'top_performers',
        label: 'Meilleurs Elements',
        description: 'Top campagnes/groupes',
        icon: Trophy,
        config: {},
        category: 'analytics',
        action: 'dataBlock'
    },
];

const CHARTS_ITEMS: BlockOption[] = [
    {
        type: 'campaign_chart',
        label: 'Graphique',
        description: 'Ligne, barre, aire',
        icon: BarChart3,
        config: { chartType: 'line' },
        category: 'charts',
        action: 'dataBlock'
    },
    {
        type: 'funnel_analysis',
        label: 'Entonnoir',
        description: 'Taux de conversion',
        icon: Filter,
        config: {},
        category: 'charts',
        action: 'dataBlock'
    },
    {
        type: 'heatmap',
        label: 'Heatmap',
        description: 'Carte de chaleur',
        icon: Layout,
        config: {},
        category: 'charts',
        action: 'dataBlock'
    },
    {
        type: 'device_platform_split',
        label: 'Repartition',
        description: 'Par appareil/plateforme',
        icon: PieChart,
        config: {},
        category: 'charts',
        action: 'dataBlock'
    },
];

const CONTENT_ITEMS: BlockOption[] = [
    {
        type: 'ad_creative',
        label: 'Creatifs Pub',
        description: 'Apercu des visuels',
        icon: Image,
        config: {},
        category: 'content',
        action: 'dataBlock'
    },
    {
        type: 'clientLogo',
        label: 'Logo Client',
        description: 'Affiche le logo du client',
        icon: Building2,
        config: {},
        category: 'content',
        action: 'dataBlock'
    },
];

const LAYOUT_ITEMS: BlockOption[] = [
    {
        type: 'table',
        label: 'Tableau',
        description: 'Tableau de donnees editable',
        icon: TableIcon,
        category: 'layout',
        action: 'content',
        config: { rows: 3, cols: 3, withHeaderRow: true }
    },
    {
        type: 'columns',
        label: 'Colonnes',
        description: 'Diviser en 2 colonnes',
        icon: Columns2,
        category: 'layout',
        action: 'content'
    },
];

const SLIDES_ITEMS: BlockOption[] = [
    {
        type: 'cover_page',
        label: 'Page de garde',
        description: 'Slide de presentation',
        icon: Presentation,
        category: 'slides',
        action: 'event',
        eventName: 'flipika:insert-cover-page'
    },
    {
        type: 'conclusion_page',
        label: 'Conclusion',
        description: 'Slide de remerciement',
        icon: PartyPopper,
        category: 'slides',
        action: 'event',
        eventName: 'flipika:insert-conclusion-page'
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
    const ALL_ITEMS = [...ANALYTICS_ITEMS, ...CHARTS_ITEMS, ...CONTENT_ITEMS, ...LAYOUT_ITEMS, ...SLIDES_ITEMS];

    // Define categories for the sidebar
    const categories: Category[] = [
        { id: 'all', label: 'Tout', icon: Grid3x3, items: ALL_ITEMS },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, items: ANALYTICS_ITEMS },
        { id: 'charts', label: 'Graphiques', icon: BarChart3, items: CHARTS_ITEMS },
        { id: 'content', label: 'Contenu', icon: Image, items: CONTENT_ITEMS },
        { id: 'layout', label: 'Mise en page', icon: Columns2, items: LAYOUT_ITEMS },
        { id: 'slides', label: 'Slides', icon: Presentation, items: SLIDES_ITEMS },
    ];

    const handleInsertBlock = (block: BlockOption) => {
        if (block.action === 'dataBlock') {
            // Insert a data block
            editor.chain().focus().insertDataBlock({
                blockType: block.type,
                config: block.config || {}
            }).run();
        } else if (block.action === 'content') {
            // Insert native TipTap content
            if (block.type === 'table') {
                editor.chain().focus().insertTable({
                    rows: block.config?.rows || 3,
                    cols: block.config?.cols || 3,
                    withHeaderRow: block.config?.withHeaderRow ?? true
                }).run();
            } else if (block.type === 'columns') {
                editor.chain().focus().insertContent({
                    type: 'columnGroup',
                    content: [
                        { type: 'column', content: [{ type: 'paragraph' }] },
                        { type: 'column', content: [{ type: 'paragraph' }] },
                    ],
                }).run();
            }
        } else if (block.action === 'event' && block.eventName) {
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent(block.eventName));
        }

        setActiveCategory(null);
        setSearchTerm('');
    };

    // Get items to display based on active category
    const getActiveItems = (): BlockOption[] => {
        if (!activeCategory) return [];
        const category = categories.find(c => c.id === activeCategory);
        return category?.items || [];
    };

    // Filter items based on search term
    const getFilteredItems = (): BlockOption[] => {
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

        const layoutFiltered = filteredItems.filter(i => i.category === 'layout');
        if (layoutFiltered.length > 0) {
            sections.push({ id: 'layout', label: 'Mise en page', items: layoutFiltered });
        }

        const slidesFiltered = filteredItems.filter(i => i.category === 'slides');
        if (slidesFiltered.length > 0) {
            sections.push({ id: 'slides', label: 'Slides', items: slidesFiltered });
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
                                                onClick={() => handleInsertBlock(item)}
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
