import React from 'react';
import { Plus, BarChart3, TrendingUp, FileText, Layout, Image, Filter, PieChart, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SlideType } from '../../types/reportTypes';
import ThemeSelector from '../themes/ThemeSelector';
import type { ReportTheme } from '../../types/reportThemes';
import './SlideLibrary.css';

interface SlideTemplate {
    type: SlideType;
    icon: React.ReactNode;
    category: 'analytics' | 'content';
    scopeType: 'modifiable' | 'single_campaign' | 'multiple_campaigns';
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
        icon: <TrendingUp size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.KEY_METRICS,
        icon: <BarChart3 size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.CAMPAIGN_CHART,
        icon: <BarChart3 size={24} />,
        category: 'analytics',
        scopeType: 'multiple_campaigns',
    },
    {
        type: SlideType.AD_CREATIVE,
        icon: <Image size={24} />,
        category: 'analytics',
        scopeType: 'single_campaign',
    },
    {
        type: SlideType.FUNNEL_ANALYSIS,
        icon: <Filter size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.TEXT_BLOCK,
        icon: <FileText size={24} />,
        category: 'content',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.HEATMAP,
        icon: <Layout size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.CUSTOM,
        icon: <Layout size={24} />,
        category: 'content',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.DEVICE_PLATFORM_SPLIT,
        icon: <PieChart size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.TOP_PERFORMERS,
        icon: <Trophy size={24} />,
        category: 'analytics',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.SECTION_TITLE,
        icon: <Layout size={24} />,
        category: 'content',
        scopeType: 'modifiable',
    },
    {
        type: SlideType.RICH_TEXT,
        icon: <FileText size={24} />,
        category: 'content',
        scopeType: 'modifiable',
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
    const { t } = useTranslation('reports');
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



            {/* Category Filter */}
            <div className="slide-categories" style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    {t('slideLibrary.categoryLabel')}
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
                    <option value="all">{t('slideLibrary.categories.all')}</option>
                    <option value="analytics">{t('slideLibrary.categories.analytics')}</option>
                    <option value="content">{t('slideLibrary.categories.content')}</option>
                </select>
            </div>

            {/* Scope Filter */}
            <div className="slide-categories" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    {t('slideLibrary.scopeLabel')}
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
                    <option value="all">{t('slideLibrary.scopes.all')}</option>
                    <option value="modifiable">{t('slideLibrary.scopes.modifiable')}</option>
                    <option value="multiple_campaigns">{t('slideLibrary.scopes.multiple_campaigns')}</option>
                    <option value="single_campaign">{t('slideLibrary.scopes.single_campaign')}</option>
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
                            <h4>{t(`slides.types.${template.type}.title`)}</h4>
                            <p>{t(`slides.types.${template.type}.description`)}</p>
                        </div>
                        <button className="slide-template-add" title={t('slideLibrary.add')}>
                            <Plus size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SlideLibrary;
