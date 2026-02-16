import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
    BarChart3, TrendingUp, PieChart, Target,
    Image, Filter, Layout, Trophy, X, Search, Grid3x3, Settings,
    Building2, Table as TableIcon, Columns2, Presentation, PartyPopper
} from 'lucide-react';
import { SiGoogleads, SiMeta } from 'react-icons/si';
import './ChartBlockSelector.css';

interface ChartBlockSelectorProps {
    editor: Editor;
}

interface BlockOption {
    type: string;
    label: string;
    description: string;
    icon: any;
    config?: Record<string, any>;
    category: 'google' | 'meta' | 'content' | 'layout' | 'slides';
    action: 'dataBlock' | 'content' | 'event';
    eventName?: string;
}

interface Category {
    id: 'all' | 'google' | 'meta' | 'content' | 'layout' | 'slides';
    label: string;
    icon: any;
    /** If set, renders this React component instead of a Lucide icon */
    logoComponent?: React.ReactNode;
    items: BlockOption[];
}

interface Section {
    id: string;
    label: string;
    logoComponent?: React.ReactNode;
    items: BlockOption[];
}

const GOOGLE_ITEMS: BlockOption[] = [
    {
        type: 'flexible_data',
        label: 'Données Google Flexibles',
        description: 'Tableau/Graphique Google Ads personnalisé',
        icon: Settings,
        config: {
            title: 'Nouveau Bloc',
            visualization: 'table',
            metrics: ['metrics.impressions', 'metrics.clicks'],
            dimension: 'segments.date',
            isNew: true
        },
        category: 'google',
        action: 'dataBlock'
    },
    {
        type: 'performance_overview',
        label: 'Vue d\'ensemble Google',
        description: 'Métriques clés & comparaisons',
        icon: TrendingUp,
        config: {},
        category: 'google',
        action: 'dataBlock'
    },
    {
        type: 'key_metrics',
        label: 'Métriques Clés Google',
        description: 'Grille 2x2 de KPIs Google Ads',
        icon: Target,
        config: {},
        category: 'google',
        action: 'dataBlock'
    },
    {
        type: 'top_performers',
        label: 'Top Campagnes Google',
        description: 'Meilleures campagnes/groupes',
        icon: Trophy,
        config: {},
        category: 'google',
        action: 'dataBlock'
    },
    {
        type: 'campaign_chart',
        label: 'Graphique Google',
        description: 'Ligne, barre, aire Google Ads',
        icon: BarChart3,
        config: { chartType: 'line' },
        category: 'google',
        action: 'dataBlock'
    },
    {
        type: 'funnel_analysis',
        label: 'Entonnoir Google',
        description: 'Tunnel de conversion Google Ads',
        icon: Filter,
        config: {},
        category: 'google',
        action: 'dataBlock'
    },
    {
        type: 'heatmap',
        label: 'Heatmap Google',
        description: 'Carte de chaleur Google Ads',
        icon: Layout,
        config: {},
        category: 'google',
        action: 'dataBlock'
    },
    {
        type: 'device_platform_split',
        label: 'Répartition Google',
        description: 'Par appareil/plateforme Google Ads',
        icon: PieChart,
        config: {},
        category: 'google',
        action: 'dataBlock'
    },
];

const META_ITEMS: BlockOption[] = [
    {
        type: 'flexible_meta_data',
        label: 'Données Meta Flexibles',
        description: 'Tableau/Graphique Meta Ads personnalisé',
        icon: Settings,
        config: {
            title: 'Nouveau Bloc Meta',
            visualization: 'table',
            metrics: ['metrics.impressions', 'metrics.clicks', 'metrics.spend'],
            dimension: 'segments.date',
            isNew: true
        },
        category: 'meta',
        action: 'dataBlock'
    },
    {
        type: 'meta_performance_overview',
        label: "Vue d'ensemble Meta",
        description: 'Performances Meta Ads',
        icon: TrendingUp,
        config: {},
        category: 'meta',
        action: 'dataBlock'
    },
    {
        type: 'meta_campaign_chart',
        label: 'Graphique Meta',
        description: 'Evolution Meta Ads',
        icon: BarChart3,
        config: { chartType: 'line' },
        category: 'meta',
        action: 'dataBlock'
    },
    {
        type: 'meta_key_metrics',
        label: 'Métriques Clés Meta',
        description: 'Dépenses, achats, CPP, leads',
        icon: Target,
        config: {},
        category: 'meta',
        action: 'dataBlock'
    },
    {
        type: 'meta_top_performers',
        label: 'Top Campagnes Meta',
        description: 'Meilleures campagnes Meta',
        icon: Trophy,
        config: {},
        category: 'meta',
        action: 'dataBlock'
    },
    {
        type: 'meta_device_split',
        label: 'Répartition Meta',
        description: 'Par appareil (Meta Ads)',
        icon: PieChart,
        config: {},
        category: 'meta',
        action: 'dataBlock'
    },
    {
        type: 'meta_funnel_analysis',
        label: 'Entonnoir Meta',
        description: 'Impressions > Clics > Leads > Achats',
        icon: Filter,
        config: {},
        category: 'meta',
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
        description: 'Variable dynamique du logo client',
        icon: Building2,
        config: {},
        category: 'content',
        action: 'content'
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
    const ALL_ITEMS = [...GOOGLE_ITEMS, ...META_ITEMS, ...CONTENT_ITEMS, ...LAYOUT_ITEMS, ...SLIDES_ITEMS];

    // Define categories for the sidebar
    const categories: Category[] = [
        { id: 'all', label: 'Tout', icon: Grid3x3, items: ALL_ITEMS },
        { id: 'google', label: 'Google Ads', icon: null, logoComponent: <SiGoogleads className="sidebar-logo-icon sidebar-logo-icon--google" />, items: GOOGLE_ITEMS },
        { id: 'meta', label: 'Meta Ads', icon: null, logoComponent: <SiMeta className="sidebar-logo-icon sidebar-logo-icon--meta" />, items: META_ITEMS },
        { id: 'content', label: 'Contenu', icon: Image, items: CONTENT_ITEMS },
        { id: 'layout', label: 'Mise en page', icon: Columns2, items: LAYOUT_ITEMS },
        { id: 'slides', label: 'Slides', icon: Presentation, items: SLIDES_ITEMS },
    ];

    const handleInsertBlock = (block: BlockOption) => {
        if (block.type === 'clientLogo') {
            // Insert as a dynamic variable instead of a data block
            editor.chain().focus().insertContent({
                type: 'dynamicVariable',
                attrs: { id: 'clientLogo', label: 'Logo Client' },
            }).run();
        } else if (block.action === 'dataBlock') {
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
            const cat = categories.find(c => c.id === activeCategory);
            return [{
                id: activeCategory || 'default',
                label: cat?.label || '',
                logoComponent: cat?.logoComponent,
                items: filteredItems
            }];
        }

        // Multiple sections for "all" category
        const sections: Section[] = [];

        const googleFiltered = filteredItems.filter(i => GOOGLE_ITEMS.includes(i));
        if (googleFiltered.length > 0) {
            sections.push({ id: 'google', label: 'Google Ads', logoComponent: <SiGoogleads className="section-header-logo section-header-logo--google" />, items: googleFiltered });
        }

        const metaFiltered = filteredItems.filter(i => META_ITEMS.includes(i));
        if (metaFiltered.length > 0) {
            sections.push({ id: 'meta', label: 'Meta Ads', logoComponent: <SiMeta className="section-header-logo section-header-logo--meta" />, items: metaFiltered });
        }

        const contentFiltered = filteredItems.filter(i => CONTENT_ITEMS.includes(i));
        if (contentFiltered.length > 0) {
            sections.push({ id: 'content', label: 'Contenu', items: contentFiltered });
        }

        const layoutFiltered = filteredItems.filter(i => LAYOUT_ITEMS.includes(i));
        if (layoutFiltered.length > 0) {
            sections.push({ id: 'layout', label: 'Mise en page', items: layoutFiltered });
        }

        const slidesFiltered = filteredItems.filter(i => SLIDES_ITEMS.includes(i));
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
                                    <div className={`section-header ${section.id === 'meta' ? 'section-header--meta' : ''}`}>
                                        <div className="section-header-left">
                                            {section.logoComponent}
                                            <h5 className="section-title">{section.label}</h5>
                                        </div>
                                        <span className={`section-count ${section.id === 'meta' ? 'section-count--meta' : ''}`}>{section.items.length}</span>
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
                                                <div className={`flyout-item-icon ${item.category === 'meta' ? 'flyout-item-icon--meta' : ''} ${['content', 'layout', 'slides'].includes(item.category) ? 'flyout-item-icon--secondary' : ''}`}>
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
                            className={`chart-sidebar-btn ${isActive ? 'is-active' : ''} ${category.logoComponent ? 'chart-sidebar-btn--logo' : ''}`}
                            onClick={() => setActiveCategory(isActive ? null : category.id)}
                            title={category.label}
                        >
                            {category.logoComponent ? (
                                category.logoComponent
                            ) : (
                                Icon && <Icon size={20} />
                            )}
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
