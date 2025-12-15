import React from 'react';
import { getAllSectionTemplates } from '../../services/sectionTemplates';
import type { SectionTemplate } from '../../types/reportTypes';
import {
    FileText,
    FileBarChart,
    BarChart3,
    TrendingUp,
    PieChart,
    Lightbulb,
    Type,
    Table as TableIcon,
} from 'lucide-react';
import './SectionLibrary.css';

interface SectionLibraryProps {
    onAddSection: (template: SectionTemplate) => void;
}

const iconMap: Record<string, React.ReactNode> = {
    FileText: <FileText size={20} />,
    FileBarChart: <FileBarChart size={20} />,
    BarChart3: <BarChart3 size={20} />,
    TrendingUp: <TrendingUp size={20} />,
    PieChart: <PieChart size={20} />,
    Lightbulb: <Lightbulb size={20} />,
    Type: <Type size={20} />,
    Table: <TableIcon size={20} />,
};

const SectionLibrary: React.FC<SectionLibraryProps> = ({ onAddSection }) => {
    const templates = getAllSectionTemplates();

    return (
        <div className="section-library">
            <div className="section-library-header">
                <h3 className="section-library-title">Sections</h3>
                <p className="section-library-subtitle">Glissez pour ajouter</p>
            </div>

            <div className="section-library-list">
                {templates.map((template) => (
                    <button
                        key={template.type}
                        className="section-library-item"
                        onClick={() => onAddSection(template)}
                        title={template.description}
                    >
                        <div className="section-library-item-icon">
                            {iconMap[template.icon] || <FileText size={20} />}
                        </div>
                        <div className="section-library-item-content">
                            <div className="section-library-item-title">{template.title}</div>
                            <div className="section-library-item-description">{template.description}</div>
                            {template.requiresData && (
                                <span className="section-library-item-badge">Données requises</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SectionLibrary;
