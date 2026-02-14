import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HealthScore from '../components/audit/HealthScore';
import AuditCategory from '../components/audit/AuditCategory';
import dataService from '../services/dataService';
import { Download, RefreshCw } from 'lucide-react';
import type { Account, Campaign, AuditResult } from '../types/business';
import GoogleAdsGuard from '../components/common/GoogleAdsGuard';

const AuditPage = () => {
    const [searchParams] = useSearchParams();

    // navigate removed if unused, but check if used in other places.
    // In original code, navigate was used in restricted view buttons.
    // If not used elsewhere, remove it.

    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [period, setPeriod] = useState<'30' | '60' | '90'>('30');

    useEffect(() => {
        loadAccounts();
    }, []);

    useEffect(() => {
        const accountId = searchParams.get('account');
        if (accountId && accounts.length > 0) {
            setSelectedAccountId(accountId);
            loadCampaigns(accountId);
        } else if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id);
            loadCampaigns(accounts[0].id);
        }
    }, [searchParams, accounts]);

    const loadAccounts = async () => {
        try {
            const data = await dataService.getAccounts();
            setAccounts(data);
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

    const handleRunAudit = async () => {
        if (!selectedAccountId) return;

        setLoading(true);
        try {
            const result = await dataService.getAuditResult(
                selectedAccountId,
                selectedCampaignId === 'all' ? undefined : selectedCampaignId
            );
            setAuditResult(result);
        } catch (error) {
            console.error('Error running audit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCompleted = (recId: string) => {
        if (!auditResult) return;

        setAuditResult(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                recommendations: prev.recommendations.map(rec =>
                    rec.id === recId ? { ...rec, status: 'COMPLETED' as const } : rec
                ),
            };
        });
    };

    const handleAddNote = (recId: string, note: string) => {
        if (!auditResult) return;

        setAuditResult(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                recommendations: prev.recommendations.map(rec =>
                    rec.id === recId ? { ...rec, notes: note } : rec
                ),
            };
        });
    };

    const handleExportPDF = () => {
        // TODO: Implement PDF export
        alert('Export PDF en cours de développement');
    };

    return (
        <div className="space-y-6 md:space-y-8 p-4 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Audit de campagne</h1>
                <p className="text-neutral-500 mt-1 text-sm md:text-base">Analyse approfondie et recommandations d'optimisation</p>
            </div>

            {/* Main Content */}
            <GoogleAdsGuard mode="block" feature="l'audit de campagne">


                {/* Configuration */}
                <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold mb-4">Configuration de l'audit</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">{/* Account selection */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Compte Google Ads
                            </label>
                            <select
                                value={selectedAccountId}
                                onChange={(e) => {
                                    setSelectedAccountId(e.target.value);
                                    loadCampaigns(e.target.value);
                                    setAuditResult(null);
                                }}
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 focus:ring-2 focus:ring-primary"
                            >
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Campaign selection */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Campagne
                            </label>
                            <select
                                value={selectedCampaignId}
                                onChange={(e) => {
                                    setSelectedCampaignId(e.target.value);
                                    setAuditResult(null);
                                }}
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">Toutes les campagnes</option>
                                {campaigns.map(campaign => (
                                    <option key={campaign.id} value={campaign.id}>
                                        {campaign.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Period selection */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Période d'analyse
                            </label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as '30' | '60' | '90')}
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 focus:ring-2 focus:ring-primary"
                            >
                                <option value="30">30 derniers jours</option>
                                <option value="60">60 derniers jours</option>
                                <option value="90">90 derniers jours</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleRunAudit}
                        disabled={loading || !selectedAccountId}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Analyse en cours...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={18} />
                                Lancer l'audit
                            </>
                        )}
                    </button>
                </div>

                {/* Audit Results */}
                {auditResult && (
                    <>
                        {/* Health Score - Full Width */}
                        <HealthScore
                            score={auditResult.overallScore}
                            breakdown={{
                                structure: auditResult.categories.structure.score,
                                targeting: auditResult.categories.targeting.score,
                                keywords: auditResult.categories.keywords.score,
                                ads: auditResult.categories.ads.score,
                                budget: auditResult.categories.budget.score,
                                extensions: auditResult.categories.extensions.score,
                                landingPages: auditResult.categories.landingPages.score,
                            }}
                        />

                        {/* Quick stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Recommandations totales</p>
                                <p className="text-3xl font-bold">{auditResult.recommendations.length}</p>
                            </div>
                            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Priorité urgente</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {auditResult.recommendations.filter(r => r.priority === 'URGENT').length}
                                </p>
                            </div>
                            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Impact élevé</p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {auditResult.recommendations.filter(r => r.impact === 'HIGH').length}
                                </p>
                            </div>
                        </div>

                        {/* Export button */}
                        <div className="flex justify-end">
                            <button onClick={handleExportPDF} className="btn btn-ghost flex items-center gap-2">
                                <Download size={18} />
                                Exporter en PDF
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Recommandations par catégorie</h2>

                            {Object.entries(auditResult.categories).map(([key, categoryData]) => (
                                <AuditCategory
                                    key={key}
                                    name={key}
                                    score={categoryData.score}
                                    categoryData={categoryData}
                                    onMarkAsCompleted={handleMarkAsCompleted}
                                    onAddNote={handleAddNote}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!auditResult && !loading && (
                    <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-12 text-center">
                        <RefreshCw size={48} className="mx-auto mb-4 text-neutral-400" />
                        <h3 className="text-lg font-semibold mb-2">Aucun audit en cours</h3>
                        <p className="text-neutral-500">
                            Sélectionnez un compte et une campagne, puis cliquez sur "Lancer l'audit" pour commencer l'analyse.
                        </p>
                    </div>
                )}

            </GoogleAdsGuard>
        </div >
    );
};

export default AuditPage;
