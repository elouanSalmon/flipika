import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import dataService from '../services/dataService';
import type { Account, Campaign } from '../types/business';
import type { ReportConfig } from '../types/reports';

const ReportsPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showConfig, setShowConfig] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [config, setConfig] = useState<ReportConfig>({
        accountId: '',
        campaignIds: [],
        period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date(),
            preset: 'last_month',
        },
        modules: {
            executiveSummary: true,
            globalMetrics: true,
            campaignAnalysis: true,
            adGroupAnalysis: false,
            keywordPerformance: true,
            adPerformance: false,
            demographics: false,
            geography: false,
            devices: false,
            timeEvolution: true,
            recommendations: true,
            comparison: true,
            budgetVsSpend: true,
        },
        customization: {
            reportName: 'Rapport de performance Google Ads',
            notes: '',
        },
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    useEffect(() => {
        if (config.accountId) {
            loadCampaigns(config.accountId);
        }
    }, [config.accountId]);

    const loadAccounts = async () => {
        try {
            const data = await dataService.getAccounts();
            setAccounts(data);
            if (data.length > 0 && !config.accountId) {
                setConfig(prev => ({ ...prev, accountId: data[0].id }));
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

    const toggleModule = (module: keyof typeof config.modules) => {
        setConfig(prev => ({
            ...prev,
            modules: {
                ...prev.modules,
                [module]: !prev.modules[module],
            },
        }));
    };

    const toggleCampaign = (campaignId: string) => {
        setConfig(prev => ({
            ...prev,
            campaignIds: prev.campaignIds.includes(campaignId)
                ? prev.campaignIds.filter(id => id !== campaignId)
                : [...prev.campaignIds, campaignId],
        }));
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // TODO: Implement actual report generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert('Rapport généré avec succès !');
            setShowConfig(false);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Erreur lors de la génération du rapport');
        } finally {
            setGenerating(false);
        }
    };

    const moduleLabels: Record<keyof typeof config.modules, string> = {
        executiveSummary: 'Résumé exécutif',
        globalMetrics: 'Métriques globales',
        campaignAnalysis: 'Analyse par campagne',
        adGroupAnalysis: 'Analyse par groupe d\'annonces',
        keywordPerformance: 'Performance des mots-clés',
        adPerformance: 'Performance des annonces',
        demographics: 'Analyse démographique',
        geography: 'Analyse géographique',
        devices: 'Analyse des appareils',
        timeEvolution: 'Évolution temporelle',
        recommendations: 'Recommandations',
        comparison: 'Comparaison période précédente',
        budgetVsSpend: 'Budget vs dépenses',
    };

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Rapports</h1>
                    <p className="text-gray-500 mt-1">Générez des rapports détaillés de performance</p>
                </div>
                <button
                    onClick={() => setShowConfig(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <FileText size={18} />
                    Nouveau rapport
                </button>
            </div>

            {/* Report Configuration */}
            {showConfig && (
                <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                        <div>
                            <h2 className="text-xl font-bold">Configuration du rapport</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personnalisez votre rapport de performance</p>
                        </div>
                        <button onClick={() => setShowConfig(false)} className="btn btn-ghost btn-sm">
                            ✕
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-8 space-y-8">
                        {/* Account and Period */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Account Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Compte Google Ads
                                </label>
                                <select
                                    value={config.accountId}
                                    onChange={(e) => setConfig({ ...config, accountId: e.target.value, campaignIds: [] })}
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    {accounts.map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Period Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Période
                                </label>
                                <select
                                    value={config.period.preset}
                                    onChange={(e) => {
                                        const preset = e.target.value as ReportConfig['period']['preset'];
                                        const now = new Date();
                                        let start = new Date();
                                        let end = new Date();

                                        switch (preset) {
                                            case 'last_month':
                                                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                                end = new Date(now.getFullYear(), now.getMonth(), 0);
                                                break;
                                            case 'last_quarter':
                                                const quarter = Math.floor(now.getMonth() / 3);
                                                start = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
                                                end = new Date(now.getFullYear(), quarter * 3, 0);
                                                break;
                                            case 'this_year':
                                                start = new Date(now.getFullYear(), 0, 1);
                                                end = now;
                                                break;
                                            case 'last_year':
                                                start = new Date(now.getFullYear() - 1, 0, 1);
                                                end = new Date(now.getFullYear() - 1, 11, 31);
                                                break;
                                        }

                                        setConfig({
                                            ...config,
                                            period: { start, end, preset },
                                        });
                                    }}
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="last_month">Mois dernier</option>
                                    <option value="last_quarter">Dernier trimestre</option>
                                    <option value="this_year">Année en cours</option>
                                    <option value="last_year">Année dernière</option>
                                    <option value="custom">Personnalisé</option>
                                </select>
                            </div>
                        </div>

                        {/* Campaigns Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Campagnes à inclure
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-all">
                                    <input
                                        type="checkbox"
                                        checked={config.campaignIds.length === campaigns.length}
                                        onChange={(e) => {
                                            setConfig({
                                                ...config,
                                                campaignIds: e.target.checked ? campaigns.map(c => c.id) : [],
                                            });
                                        }}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-semibold text-sm">Toutes les campagnes</span>
                                </label>
                                {campaigns.map(campaign => (
                                    <label
                                        key={campaign.id}
                                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={config.campaignIds.includes(campaign.id)}
                                            onChange={() => toggleCampaign(campaign.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">{campaign.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modules Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Modules à inclure
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sélectionnez les sections à inclure dans le rapport</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(config.modules).map(([key, value]) => (
                                    <label
                                        key={key}
                                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={() => toggleModule(key as keyof typeof config.modules)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium">{moduleLabels[key as keyof typeof config.modules]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Customization */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Personnalisation
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Personnalisez l'apparence de votre rapport</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nom du rapport
                                    </label>
                                    <input
                                        type="text"
                                        value={config.customization.reportName}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            customization: { ...config.customization, reportName: e.target.value },
                                        })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes additionnelles
                                    </label>
                                    <textarea
                                        value={config.customization.notes}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            customization: { ...config.customization, notes: e.target.value },
                                        })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Ajoutez des notes ou commentaires..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => setShowConfig(false)}
                            className="btn btn-ghost px-6"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !config.accountId || config.campaignIds.length === 0}
                            className="btn btn-primary px-6 flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Générer le rapport
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Reports History (placeholder) */}
            {!showConfig && (
                <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-12 text-center">
                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Aucun rapport généré</h3>
                    <p className="text-gray-500 mb-6">
                        Cliquez sur "Nouveau rapport" pour créer votre premier rapport de performance.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
