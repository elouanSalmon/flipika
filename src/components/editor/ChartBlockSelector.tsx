import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
    BarChart3, TrendingUp, PieChart, Target,
    Image, Filter, Layout, Trophy, FileText, X, Search
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
}

interface Category {
    id: string;
    label: string;
    icon: React.ElementType;
    items: ChartOption[];
}

const ANALYTICS_ITEMS: ChartOption[] = [
    {
        type: 'performance_overview',
        label: 'Vue d\'ensemble',
        description: 'Métriques clés & comparaisons',
        icon: TrendingUp,
        config: {}
    },
    {
        type: 'key_metrics',
        label: 'Métriques Clés',
        description: 'Grille 2x2 de KPIs',
        icon: Target,
        config: {}
    },
    {
        type: 'top_performers',
        label: 'Meilleurs Éléments',
        description: 'Top campagnes/groupes',
        icon: Trophy,
        config: {}
    },
];

const CHARTS_ITEMS: ChartOption[] = [
    {
        type: 'campaign_chart',
        label: 'Graphique',
        description: 'Ligne, barre, aire',
        icon: BarChart3,
        config: { chartType: 'line' }
    },
    {
        type: 'funnel_analysis',
        label: 'Entonnoir',
        description: 'Taux de conversion',
        icon: Filter,
        config: {}
    },
    {
        type: 'heatmap',
        label: 'Heatmap',
        description: 'Carte de chaleur',
        icon: Layout,
        config: {}
    },
    {
        type: 'device_platform_split',
        label: 'Répartition',
        description: 'Par appareil/plateforme',
        icon: PieChart,
        config: {}
    },
];

const CONTENT_ITEMS: ChartOption[] = [
    {
        type: 'section_title',
        label: 'Titre de Section',
        description: 'Grand en-tête de section',
        icon: Layout,
        config: {}
    },
    {
        type: 'rich_text',
        label: 'Texte Riche',
        description: 'Bloc de contenu textuel',
        icon: FileText,
        config: {}
    },
    {
        type: 'ad_creative',
        label: 'Créatifs Pub',
        description: 'Aperçu des visuels',
        icon: Image,
        config: {}
    },
];

export const ChartBlockSelector: React.FC<ChartBlockSelectorProps> = ({ editor }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close flyout when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveCategory(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Combine all charts into one master list
    const ALL_ITEMS = [...ANALYTICS_ITEMS, ...CHARTS_ITEMS, ...CONTENT_ITEMS];

    const categories: Category[] = [
        { id: 'search', label: 'Recherche', icon: Search, items: ALL_ITEMS }, // Items will be filtered by search
        { id: 'all_charts', label: 'Graphiques', icon: BarChart3, items: ALL_ITEMS },
    ];

    const handleInsertChart = (chart: ChartOption) => {
        editor.chain().focus().insertDataBlock({
            blockType: chart.type,
            config: chart.config
        }).run();
    };

    const isSearchActive = activeCategory === 'search';
    const activeItems = isSearchActive ? ALL_ITEMS : (categories.find(c => c.id === activeCategory)?.items || []);

    // Filter items if search is active
    const [searchTerm, setSearchTerm] = useState('');
    const displayedItems = activeItems.filter(item => {
        if (!isSearchActive && !searchTerm) return true;
        const term = isSearchActive ? searchTerm : ''; // Only filter if in search mode OR if we add search to main list later
        return item.label.toLowerCase().includes(term.toLowerCase()) ||
            item.description.toLowerCase().includes(term.toLowerCase());
    });

    // Auto-focus search input when search category is activated
    const searchInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (isSearchActive && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        } else {
            setSearchTerm(''); // Reset search when closing
        }
    }, [isSearchActive]);

    return (
        <div className="chart-selector-container" ref={containerRef}>
            {/* Flyout Menu */}
            <div className={`chart-flyout ${activeCategory ? 'is-open' : ''}`}>
                <div className="chart-flyout-header">
                    {activeCategory === 'search' ? (
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
                    ) : (
                        <h4>{categories.find(c => c.id === activeCategory)?.label}</h4>
                    )}
                    <button className="close-flyout" onClick={() => setActiveCategory(null)}>
                        <X size={16} />
                    </button>
                </div>
                <div className="chart-flyout-grid">
                    {displayedItems.map((item, index) => {
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
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
