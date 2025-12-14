import { FileText, Download, Settings as SettingsIcon, Check } from 'lucide-react';
import { useState } from 'react';
import { useDemoMode } from '../contexts/DemoModeContext';
import { isGoogleAdsConnected, getLinkedCustomerId } from '../services/googleAds';
import { Link } from 'react-router-dom';

interface ReportConfig {
    accountId: string;
    startDate: string;
    endDate: string;
    includeMetrics: {
        spend: boolean;
        impressions: boolean;
        clicks: boolean;
        conversions: boolean;
        ctr: boolean;
        cpc: boolean;
        roas: boolean;
    };
    includeCampaigns: boolean;
    includeCharts: boolean;
}

const Reports = () => {
    const { isDemoMode } = useDemoMode();
    const [generating, setGenerating] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const isConnected = isGoogleAdsConnected();

    // Mock accounts for demo
    const mockAccounts = [
        { id: 'demo-account-1', name: 'Mon Entreprise SAS' },
        { id: 'demo-account-2', name: 'E-commerce Store' },
    ];

    const [config, setConfig] = useState<ReportConfig>({
        accountId: isDemoMode ? mockAccounts[0].id : getLinkedCustomerId() || '',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        includeMetrics: {
            spend: true,
            impressions: true,
            clicks: true,
            conversions: true,
            ctr: true,
            cpc: true,
            roas: true,
        },
        includeCampaigns: true,
        includeCharts: true,
    });

    const reports = isDemoMode ? [
        {
            id: 1,
            name: 'Rapport Mensuel - Décembre 2024',
            date: '14/12/2024',
            type: 'Performance Globale',
            accountName: 'Mon Entreprise SAS'
        },
        {
            id: 2,
            name: 'Analyse Hebdomadaire (S50)',
            date: '10/12/2024',
            type: 'Hebdomadaire',
            accountName: 'E-commerce Store'
        },
    ] : [];

    const handleGenerate = async () => {
        setGenerating(true);
        // Simulate PDF generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGenerating(false);
        setShowConfig(false);
        // In real implementation, this would call a PDF generation service
    };

    const toggleMetric = (metric: keyof typeof config.includeMetrics) => {
        setConfig(prev => ({
            ...prev,
            includeMetrics: {
                ...prev.includeMetrics,
                [metric]: !prev.includeMetrics[metric]
            }
        }));
    };

    // Not connected and not in demo mode
    if (!isConnected && !isDemoMode) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Rapports Clients</h1>
                        <p className="text-gray-500 text-sm">Générez et téléchargez vos rapports de performance.</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-16 text-center space-y-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                        <FileText size={56} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="max-w-md space-y-3">
                        <h2 className="text-2xl font-bold">Compte Google Ads requis</h2>
                        <p className="text-gray-500 text-base leading-relaxed">
                            Connectez votre compte Google Ads pour générer des rapports de performance personnalisés avec vos données réelles.
                        </p>
                    </div>
                    <Link to="/app/dashboard" className="btn btn-primary btn-lg mt-4">
                        Connecter Google Ads
                    </Link>
                </div>
            </div>
        );
    }

    const accounts = isDemoMode ? mockAccounts : [{ id: config.accountId, name: 'Compte principal' }];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Rapports Clients</h1>
                        <p className="text-gray-500 text-sm">Générez et téléchargez vos rapports de performance personnalisés</p>
                    </div>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FileText size={18} />
                        Nouveau Rapport
                    </button>
                </div>
            </div>

            {/* Report Configuration Modal/Panel */}
            {showConfig && (
                <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Configuration du rapport</h2>
                        <button onClick={() => setShowConfig(false)} className="btn btn-ghost btn-sm">
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Compte Google Ads
                            </label>
                            <select
                                value={config.accountId}
                                onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Période
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="date"
                                    value={config.startDate}
                                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="flex items-center text-gray-400">→</span>
                                <input
                                    type="date"
                                    value={config.endDate}
                                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Metrics Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Métriques à inclure
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(config.includeMetrics).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleMetric(key as keyof typeof config.includeMetrics)}
                                    className={`p-3 rounded-xl border-2 transition-all ${value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium capitalize">{key}</span>
                                        {value && <Check size={16} className="text-blue-600" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Options supplémentaires
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.includeCampaigns}
                                    onChange={(e) => setConfig({ ...config, includeCampaigns: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Détail des campagnes</p>
                                    <p className="text-xs text-gray-500">Inclure le tableau détaillé de toutes les campagnes</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.includeCharts}
                                    onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Graphiques de performance</p>
                                    <p className="text-xs text-gray-500">Ajouter des visualisations graphiques</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                            onClick={() => setShowConfig(false)}
                            className="btn btn-ghost"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="btn btn-primary flex items-center gap-2"
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

            {/* Stats Cards */}
            {isDemoMode && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Rapports générés</p>
                                <h3 className="text-3xl font-bold">12</h3>
                                <p className="text-xs text-gray-500 mt-1">Ce mois-ci</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
                                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Téléchargements</p>
                                <h3 className="text-3xl font-bold">48</h3>
                                <p className="text-xs text-gray-500 mt-1">Total</p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-xl">
                                <Download className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Comptes analysés</p>
                                <h3 className="text-3xl font-bold">2</h3>
                                <p className="text-xs text-gray-500 mt-1">Actifs</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-xl">
                                <SettingsIcon className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reports History */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold">Historique des rapports</h3>
                    <p className="text-sm text-gray-500 mt-1">Accédez à vos rapports précédemment générés</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="p-4">Nom du rapport</th>
                                <th className="p-4">Compte</th>
                                <th className="p-4">Date de génération</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {reports.length > 0 ? reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="font-medium">{report.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{report.accountName}</td>
                                    <td className="p-4 text-gray-500">{report.date}</td>
                                    <td className="p-4">
                                        <span className="badge badge-sm badge-ghost">{report.type}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="btn btn-ghost btn-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                            <Download size={16} />
                                            <span className="ml-2">Télécharger</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                <FileText size={32} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700 dark:text-gray-300">Aucun rapport généré</p>
                                                <p className="text-sm text-gray-500 mt-1">Cliquez sur "Nouveau Rapport" pour commencer</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
