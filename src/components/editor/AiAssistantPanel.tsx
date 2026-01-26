import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Sparkles, BarChart2, TrendingUp, AlertTriangle, Plus, X, Loader2, Lightbulb } from 'lucide-react';
import { fetchInsights } from '../../services/aiService';
import { insertInsightSlide } from './extensions/InsightCommand';
import { useReportEditor } from '../../contexts/ReportEditorContext';
import liveDataService from '../../services/liveDataService';
import type { Insight } from '../../types/ai';
import type { CampaignMetrics } from '../../types/business';

interface AiAssistantPanelProps {
    editor: Editor;
    isOpen: boolean;
    onClose: () => void;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ editor, isOpen, onClose }) => {
    const {
        accountId,
        campaignIds,
        startDate,
        endDate
    } = useReportEditor();

    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to auto-fetch or wait for user action
    // Let's make it auto-fetch on open if empty
    useEffect(() => {
        if (isOpen && insights.length === 0 && !loading && !error) {
            handleGenerateInsights();
        }
    }, [isOpen]);

    const handleGenerateInsights = async () => {
        if (!startDate || !endDate || !accountId) {
            setError("Données manquantes (date ou compte).");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Fetch real data needed for the AI
            // We need global metrics and campaigns list
            const campaignData = accountId
                ? await liveDataService.getCampaigns(accountId)
                : await liveDataService.getAllCampaigns();

            // Filter by selected campaigns if any
            const relevantCampaigns = campaignIds.length > 0
                ? campaignData.filter(c => campaignIds.includes(c.id))
                : campaignData;

            // Calculate global metrics from campaigns (if you have a better source, use it)
            const globalMetricsCalc: CampaignMetrics = relevantCampaigns.reduce((acc, c) => ({
                impressions: acc.impressions + c.metrics.impressions,
                clicks: acc.clicks + c.metrics.clicks,
                cost: acc.cost + c.metrics.cost,
                conversions: acc.conversions + c.metrics.conversions,
                conversionValue: acc.conversionValue + c.metrics.conversionValue,
                ctr: 0, // Recalculated below
                cpc: 0,
                cpa: 0,
                roas: 0,
                qualityScore: 0
            }), {
                impressions: 0, clicks: 0, cost: 0, conversions: 0,
                conversionValue: 0, ctr: 0, cpc: 0, cpa: 0, roas: 0, qualityScore: 0
            });

            // Recalculate rates
            if (globalMetricsCalc.impressions > 0) globalMetricsCalc.ctr = (globalMetricsCalc.clicks / globalMetricsCalc.impressions) * 100;
            if (globalMetricsCalc.clicks > 0) globalMetricsCalc.cpc = globalMetricsCalc.cost / globalMetricsCalc.clicks;
            if (globalMetricsCalc.conversions > 0) globalMetricsCalc.cpa = globalMetricsCalc.cost / globalMetricsCalc.conversions;
            if (globalMetricsCalc.cost > 0) globalMetricsCalc.roas = globalMetricsCalc.conversionValue / globalMetricsCalc.cost;

            // 2. Call AI Service
            const response = await fetchInsights(
                { start: startDate, end: endDate },
                relevantCampaigns,
                globalMetricsCalc
            );

            setInsights(response.insights);
        } catch (err: any) {
            console.error(err);
            setError("Erreur lors de l'analyse IA. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddInsight = (insight: Insight) => {
        insertInsightSlide(editor, insight);
        // Optional: Mark as used or give feedback
    };

    if (!isOpen) return null;

    return (
        <div className="ai-assistant-panel">
            <div className="ai-panel-header">
                <div className="ai-panel-title">
                    <Sparkles className="ai-icon" size={18} />
                    <span>Assistant Analyste</span>
                </div>
                <button onClick={onClose} className="ai-close-btn">
                    <X size={16} />
                </button>
            </div>

            <div className="ai-panel-content">
                {error && (
                    <div className="ai-error">
                        <AlertTriangle size={16} />
                        <p>{error}</p>
                        <button onClick={handleGenerateInsights} className="ai-retry-btn">Réessayer</button>
                    </div>
                )}

                {loading ? (
                    <div className="ai-loading">
                        <Loader2 className="animate-spin" size={24} />
                        <p>Analyse des données en cours...</p>
                        <span className="ai-loading-sub">Detection des variations et opportunités</span>
                    </div>
                ) : (
                    <>
                        {insights.length === 0 && !error ? (
                            <div className="ai-empty">
                                <Lightbulb size={24} />
                                <p>Aucune insight détectée pour le moment.</p>
                                <button onClick={handleGenerateInsights} className="ai-btn-primary">
                                    Lancer l'analyse
                                </button>
                            </div>
                        ) : (
                            <div className="ai-insights-list">
                                <p className="ai-list-header">Suggestions basées sur vos données</p>
                                {insights.map((insight) => (
                                    <div key={insight.id} className={`insight-card ${insight.type}`}>
                                        <div className="insight-header">
                                            <span className="insight-tag">
                                                {insight.type === 'performance' && <TrendingUp size={12} />}
                                                {insight.type === 'opportunity' && <Sparkles size={12} />}
                                                {insight.type === 'alert' && <AlertTriangle size={12} />}
                                                {insight.type.toUpperCase()}
                                            </span>
                                            <button
                                                onClick={() => handleAddInsight(insight)}
                                                className="insight-add-btn"
                                                title="Ajouter au rapport"
                                            >
                                                <Plus size={14} /> Ajouter
                                            </button>
                                        </div>
                                        <h4 className="insight-title">{insight.title}</h4>
                                        <p className="insight-analysis">{insight.analysis}</p>
                                        <div className="insight-chart-preview">
                                            <BarChart2 size={12} />
                                            <span>Graphique suggéré : {insight.chartConfig.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="ai-panel-footer">
                <button onClick={handleGenerateInsights} className="ai-refresh-btn" disabled={loading}>
                    Actualiser l'analyse
                </button>
            </div>
        </div>
    );
};
