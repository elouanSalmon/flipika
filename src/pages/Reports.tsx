import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Download, FileText, Lock, Eye, EyeOff, Settings, Layout } from 'lucide-react';
import { useDemoMode } from '../contexts/DemoModeContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import dataService from '../services/dataService';
import { generateExecutiveSummary, generateMetricsSection, generateCampaignAnalysis, generateRecommendations } from '../services/sectionGenerator';
import SectionLibrary from '../components/reports/SectionLibrary';
import SectionItem from '../components/reports/SectionItem';
import DesignPanel from '../components/reports/DesignPanel';
import type { Account, Campaign, CampaignMetrics } from '../types/business';
import type { ReportSection, ReportDesign, SectionTemplate } from '../types/reportTypes';
import { SectionType, defaultReportDesign } from '../types/reportTypes';
import './Reports.css';

const ReportsPage = () => {
    const navigate = useNavigate();
    const { isDemoMode } = useDemoMode();
    const { isConnected } = useGoogleAds();
    const hasAccess = isConnected || isDemoMode;

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

    // Two-step workflow: configuration then editor
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [isEditorMode, setIsEditorMode] = useState(false);

    // Module selection for initial generation
    const [selectedModules, setSelectedModules] = useState({
        executiveSummary: true,
        metrics: true,
        campaignAnalysis: true,
        recommendations: true,
    });

    const [sections, setSections] = useState<ReportSection[]>([]);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [design, setDesign] = useState<ReportDesign>(defaultReportDesign);
    const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');
    const [showDesignPanel, setShowDesignPanel] = useState(true);
    const [reportTitle, setReportTitle] = useState('Rapport de Performance Google Ads');
    const [isDirty, setIsDirty] = useState(false);
    const [generating, setGenerating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (hasAccess) {
            loadAccounts();
        }
    }, [hasAccess]);

    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        }
    }, [selectedAccountId]);

    const loadAccounts = async () => {
        try {
            const data = await dataService.getAccounts();
            setAccounts(data);
            if (data.length > 0 && !selectedAccountId) {
                setSelectedAccountId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    const loadCampaigns = async (accountId: string) => {
        try {
            const data = await dataService.getCampaigns(accountId);
            setCampaigns(data);
        } catch (error) {
            console.error('Error loading campaigns:', error);
        }
    };

    const handleAddSection = (template: SectionTemplate) => {
        const newSection: ReportSection = {
            id: `section-${Date.now()}`,
            type: template.type,
            title: template.title,
            content: template.defaultContent,
            order: sections.length,
        };

        // Auto-populate data-driven sections
        if (template.requiresData && selectedCampaignIds.length > 0) {
            const account = accounts.find(a => a.id === selectedAccountId);
            const selectedCampaigns = campaigns.filter(c => selectedCampaignIds.includes(c.id));
            const aggregatedMetrics = calculateAggregatedMetrics(selectedCampaigns);

            if (template.type === SectionType.EXECUTIVE_SUMMARY && account) {
                newSection.content = generateExecutiveSummary(
                    aggregatedMetrics,
                    account.name,
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    new Date()
                );
            } else if (template.type === SectionType.METRICS) {
                newSection.content = generateMetricsSection(aggregatedMetrics);
            } else if (template.type === SectionType.CAMPAIGN_ANALYSIS) {
                newSection.content = generateCampaignAnalysis(selectedCampaigns);
            } else if (template.type === SectionType.RECOMMENDATIONS) {
                newSection.content = generateRecommendations(selectedCampaigns, aggregatedMetrics);
            }
        }

        setSections([...sections, newSection]);
        setActiveSectionId(newSection.id);
        setIsDirty(true);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                return newItems.map((item, index) => ({ ...item, order: index }));
            });
            setIsDirty(true);
        }
    };

    const handleUpdateSection = (id: string, content: any) => {
        setSections(sections.map(s => s.id === id ? { ...s, content } : s));
        setIsDirty(true);
    };

    const handleDeleteSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
        if (activeSectionId === id) {
            setActiveSectionId(null);
        }
        setIsDirty(true);
    };

    const calculateAggregatedMetrics = (selectedCampaigns: Campaign[]): CampaignMetrics => {
        const aggregated = selectedCampaigns.reduce((acc, campaign) => ({
            impressions: acc.impressions + campaign.metrics.impressions,
            clicks: acc.clicks + campaign.metrics.clicks,
            cost: acc.cost + campaign.metrics.cost,
            conversions: acc.conversions + campaign.metrics.conversions,
            conversionValue: acc.conversionValue + campaign.metrics.conversionValue,
            ctr: 0,
            cpc: 0,
            cpa: 0,
            roas: 0,
            qualityScore: campaign.metrics.qualityScore || 0,
        }), {
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            conversionValue: 0,
            ctr: 0,
            cpc: 0,
            cpa: 0,
            roas: 0,
            qualityScore: 0,
        });

        aggregated.ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0;
        aggregated.cpc = aggregated.clicks > 0 ? aggregated.cost / aggregated.clicks : 0;
        aggregated.cpa = aggregated.conversions > 0 ? aggregated.cost / aggregated.conversions : 0;
        aggregated.roas = aggregated.cost > 0 ? aggregated.conversionValue / aggregated.cost : 0;

        return aggregated;
    };

    const handleGenerateInitialReport = () => {
        if (selectedCampaignIds.length === 0) {
            alert('Veuillez sélectionner au moins une campagne');
            return;
        }

        const account = accounts.find(a => a.id === selectedAccountId);
        const selectedCampaigns = campaigns.filter(c => selectedCampaignIds.includes(c.id));
        const aggregatedMetrics = calculateAggregatedMetrics(selectedCampaigns);

        const newSections: ReportSection[] = [];
        let order = 0;

        // Cover page
        newSections.push({
            id: `section-cover-${Date.now()}`,
            type: SectionType.COVER,
            title: 'Page de couverture',
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'heading',
                        attrs: { level: 1 },
                        content: [{ type: 'text', text: reportTitle }]
                    },
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: account?.name || '' }]
                    },
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: new Date().toLocaleDateString('fr-FR') }]
                    }
                ]
            },
            order: order++,
        });

        // Executive Summary
        if (selectedModules.executiveSummary && account) {
            newSections.push({
                id: `section-summary-${Date.now()}`,
                type: SectionType.EXECUTIVE_SUMMARY,
                title: 'Résumé Exécutif',
                content: generateExecutiveSummary(
                    aggregatedMetrics,
                    account.name,
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    new Date()
                ),
                order: order++,
            });
        }

        // Metrics
        if (selectedModules.metrics) {
            newSections.push({
                id: `section-metrics-${Date.now()}`,
                type: SectionType.METRICS,
                title: 'Métriques Globales',
                content: generateMetricsSection(aggregatedMetrics),
                order: order++,
            });
        }

        // Campaign Analysis
        if (selectedModules.campaignAnalysis) {
            newSections.push({
                id: `section-analysis-${Date.now()}`,
                type: SectionType.CAMPAIGN_ANALYSIS,
                title: 'Analyse des Campagnes',
                content: generateCampaignAnalysis(selectedCampaigns),
                order: order++,
            });
        }

        // Recommendations
        if (selectedModules.recommendations) {
            newSections.push({
                id: `section-recommendations-${Date.now()}`,
                type: SectionType.RECOMMENDATIONS,
                title: 'Recommandations',
                content: generateRecommendations(selectedCampaigns, aggregatedMetrics),
                order: order++,
            });
        }

        setSections(newSections);
        setShowConfigModal(false);
        setIsEditorMode(true);
        setIsDirty(true);
    };

    const toggleCampaign = (campaignId: string) => {
        setSelectedCampaignIds(prev =>
            prev.includes(campaignId)
                ? prev.filter(id => id !== campaignId)
                : [...prev, campaignId]
        );
    };

    const toggleModule = (module: keyof typeof selectedModules) => {
        setSelectedModules(prev => ({
            ...prev,
            [module]: !prev[module]
        }));
    };

    const handleGeneratePDF = async () => {
        if (sections.length === 0) {
            alert('Veuillez ajouter au moins une section au rapport');
            return;
        }

        setGenerating(true);
        try {
            const account = accounts.find(a => a.id === selectedAccountId);
            const selectedCampaigns = campaigns.filter(c => selectedCampaignIds.includes(c.id));
            const aggregatedMetrics = calculateAggregatedMetrics(selectedCampaigns);

            // Import and use enhanced report generator
            const { default: ReportGenerator } = await import('../services/reportGenerator');
            const generator = new ReportGenerator();

            // Generate PDF with custom design
            const pdfBlob = await generator.generateReportFromSections(
                sections,
                design,
                reportTitle,
                account,
                selectedCampaigns,
                aggregatedMetrics
            );

            // Download PDF
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setIsDirty(false);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Erreur lors de la génération du rapport: ' + (error as Error).message);
        } finally {
            setGenerating(false);
        }
    };

    if (!hasAccess) {
        return (
            <div className="reports-page">
                <div className="reports-restricted">
                    <div className="reports-restricted-icon">
                        <Lock size={48} />
                    </div>
                    <h2 className="reports-restricted-title">Accès restreint</h2>
                    <p className="reports-restricted-text">
                        Pour accéder à l'éditeur de rapports, vous devez connecter un compte Google Ads ou activer le mode démo.
                    </p>
                    <div className="reports-restricted-actions">
                        <button onClick={() => navigate('/app/settings')} className="btn btn-primary">
                            Connecter Google Ads
                        </button>
                        <button onClick={() => navigate('/app/dashboard')} className="btn btn-secondary">
                            Activer le mode démo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-page">
            {/* Configuration Modal */}
            {showConfigModal && (
                <div className="reports-config-modal-overlay">
                    <div className="reports-config-modal">
                        <div className="reports-config-header">
                            <h2>Configuration du rapport</h2>
                            <p>Personnalisez votre rapport de performance</p>
                            <button
                                className="reports-config-close"
                                onClick={() => setShowConfigModal(false)}
                                aria-label="Fermer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="reports-config-content">
                            {/* Account Selection */}
                            <div className="reports-config-section">
                                <h3>Compte Google Ads</h3>
                                <select
                                    value={selectedAccountId}
                                    onChange={(e) => {
                                        setSelectedAccountId(e.target.value);
                                        setSelectedCampaignIds([]);
                                    }}
                                    className="reports-config-select"
                                >
                                    {accounts.map(account => (
                                        <option key={account.id} value={account.id}>{account.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Campaign Selection */}
                            <div className="reports-config-section">
                                <h3>Campagnes à inclure</h3>
                                <div className="reports-config-checkbox-group">
                                    <label className="reports-config-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedCampaignIds.length === campaigns.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCampaignIds(campaigns.map(c => c.id));
                                                } else {
                                                    setSelectedCampaignIds([]);
                                                }
                                            }}
                                        />
                                        <span className="checkbox-label-bold">Toutes les campagnes</span>
                                    </label>
                                    {campaigns.map(campaign => (
                                        <label key={campaign.id} className="reports-config-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedCampaignIds.includes(campaign.id)}
                                                onChange={() => toggleCampaign(campaign.id)}
                                            />
                                            <span>{campaign.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Module Selection */}
                            <div className="reports-config-section">
                                <h3>Modules à inclure</h3>
                                <p className="reports-config-description">
                                    Sélectionnez les sections à inclure dans le rapport
                                </p>
                                <div className="reports-config-modules">
                                    <label className="reports-config-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedModules.executiveSummary}
                                            onChange={() => toggleModule('executiveSummary')}
                                        />
                                        <span>Résumé exécutif</span>
                                    </label>
                                    <label className="reports-config-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedModules.metrics}
                                            onChange={() => toggleModule('metrics')}
                                        />
                                        <span>Métriques globales</span>
                                    </label>
                                    <label className="reports-config-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedModules.campaignAnalysis}
                                            onChange={() => toggleModule('campaignAnalysis')}
                                        />
                                        <span>Analyse par campagne</span>
                                    </label>
                                    <label className="reports-config-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedModules.recommendations}
                                            onChange={() => toggleModule('recommendations')}
                                        />
                                        <span>Recommandations</span>
                                    </label>
                                </div>
                            </div>

                            {/* Customization */}
                            <div className="reports-config-section">
                                <h3>Personnalisation</h3>
                                <p className="reports-config-description">
                                    Personnalisez l'apparence de votre rapport
                                </p>
                                <div className="reports-config-input-group">
                                    <label>Nom du rapport</label>
                                    <input
                                        type="text"
                                        value={reportTitle}
                                        onChange={(e) => setReportTitle(e.target.value)}
                                        className="reports-config-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="reports-config-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowConfigModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateInitialReport}
                                disabled={selectedCampaignIds.length === 0}
                            >
                                Générer le rapport
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="reports-header">
                <div className="reports-header-left">
                    <FileText size={24} />
                    {isEditorMode ? (
                        <>
                            <input
                                type="text"
                                value={reportTitle}
                                onChange={(e) => {
                                    setReportTitle(e.target.value);
                                    setIsDirty(true);
                                }}
                                className="reports-title-input"
                            />
                            {isDirty && <span className="reports-dirty-indicator">●</span>}
                        </>
                    ) : (
                        <h1 className="reports-page-title">Rapports</h1>
                    )}
                </div>
                <div className="reports-header-right">
                    {!isEditorMode && (
                        <button
                            onClick={() => setShowConfigModal(true)}
                            className="btn btn-primary"
                        >
                            Nouveau rapport
                        </button>
                    )}
                    {isEditorMode && (
                        <>
                            <select
                                value={selectedAccountId}
                                onChange={(e) => {
                                    setSelectedAccountId(e.target.value);
                                    setSelectedCampaignIds([]);
                                }}
                                className="reports-select"
                            >
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowDesignPanel(!showDesignPanel)}
                                className={`btn btn-icon ${showDesignPanel ? 'btn-active' : ''}`}
                                title="Design"
                            >
                                <Settings size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
                                className="btn btn-icon"
                                title={viewMode === 'editor' ? 'Aperçu' : 'Éditeur'}
                            >
                                {viewMode === 'editor' ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <button
                                onClick={handleGeneratePDF}
                                disabled={generating || sections.length === 0}
                                className="btn btn-primary"
                            >
                                {generating ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Exporter PDF
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Editor */}
            {isEditorMode ? (
                <div className="reports-editor">
                    <SectionLibrary onAddSection={handleAddSection} />

                    <div className="reports-canvas">
                        {sections.length === 0 ? (
                            <div className="reports-empty-state">
                                <Layout size={64} />
                                <h3>Commencez votre rapport</h3>
                                <p>Glissez des sections depuis la bibliothèque ou cliquez pour les ajouter</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={sections.map(s => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {sections.map((section) => (
                                        <SectionItem
                                            key={section.id}
                                            section={section}
                                            isActive={activeSectionId === section.id}
                                            onUpdate={handleUpdateSection}
                                            onDelete={handleDeleteSection}
                                            onActivate={setActiveSectionId}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>

                    {showDesignPanel && (
                        <DesignPanel
                            design={design}
                            onChange={(newDesign) => {
                                setDesign(newDesign);
                                setIsDirty(true);
                            }}
                            onClose={() => setShowDesignPanel(false)}
                        />
                    )}
                </div>
            ) : (
                <div className="reports-welcome">
                    <div className="reports-welcome-content">
                        <FileText size={80} />
                        <h2>Créez votre premier rapport</h2>
                        <p>Générez des rapports professionnels personnalisés pour vos campagnes Google Ads</p>
                        <button
                            onClick={() => setShowConfigModal(true)}
                            className="btn btn-primary btn-large"
                        >
                            Commencer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
