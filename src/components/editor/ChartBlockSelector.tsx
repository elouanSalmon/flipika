import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Search, BarChart3, TrendingUp, PieChart, Plus, Target, Image, Filter, Layout, Trophy, FileText } from 'lucide-react';
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

const AVAILABLE_CHARTS: ChartOption[] = [
    {
        type: 'performance_overview',
        label: 'Performance Overview',
        description: 'Insert a performance metrics grid',
        icon: TrendingUp,
        config: {}
    },
    {
        type: 'campaign_chart',
        label: 'Chart',
        description: 'Insert a line, bar, or area chart',
        icon: BarChart3,
        config: { chartType: 'line' }
    },
    {
        type: 'key_metrics',
        label: 'Key Metrics',
        description: 'Insert a 2x2 grid of key KPIs',
        icon: Target,
        config: {}
    },
    {
        type: 'ad_creative',
        label: 'Ad Creative',
        description: 'Show top performing ad creatives',
        icon: Image,
        config: {}
    },
    {
        type: 'funnel_analysis',
        label: 'Funnel Analysis',
        description: 'Visualize conversion funnel',
        icon: Filter,
        config: {}
    },
    {
        type: 'heatmap',
        label: 'Heatmap',
        description: 'View performance heatmap',
        icon: Layout,
        config: {}
    },
    {
        type: 'device_platform_split',
        label: 'Device Platform Split',
        description: 'Breakdown by device/platform',
        icon: PieChart,
        config: {}
    },
    {
        type: 'top_performers',
        label: 'Top Performers',
        description: 'List of top campaigns/ad groups',
        icon: Trophy,
        config: {}
    },
    {
        type: 'section_title',
        label: 'Section Title',
        description: 'Large section header',
        icon: Layout,
        config: {}
    },
    {
        type: 'rich_text',
        label: 'Rich Text',
        description: 'Rich text content block',
        icon: FileText,
        config: {}
    }
];

export const ChartBlockSelector: React.FC<ChartBlockSelectorProps> = ({ editor }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCharts = AVAILABLE_CHARTS.filter(chart =>
        chart.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chart.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInsertChart = (chart: ChartOption) => {
        editor.chain().focus().insertDataBlock({
            blockType: chart.type,
            config: chart.config
        }).run();
    };

    return (
        <div className="chart-block-selector">
            <div className="chart-selector-header">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Charts</h3>
                <div className="search-container">
                    <Search size={14} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search charts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="chart-search-input"
                    />
                </div>
            </div>

            <div className="chart-list">
                {filteredCharts.map((chart, index) => {
                    const Icon = chart.icon;
                    return (
                        <div
                            key={index}
                            className="chart-option-item"
                            onClick={() => handleInsertChart(chart)}
                            title="Click to insert"
                        >
                            <div className="chart-icon-container">
                                <Icon size={18} />
                            </div>
                            <div className="chart-info">
                                <span className="chart-label">{chart.label}</span>
                                <span className="chart-description">{chart.description}</span>
                            </div>
                            <button className="insert-btn">
                                <Plus size={14} />
                            </button>
                        </div>
                    );
                })}

                {filteredCharts.length === 0 && (
                    <div className="empty-search">
                        No charts found
                    </div>
                )}
            </div>
        </div>
    );
};
