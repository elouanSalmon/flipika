import { FileText, Download, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useDemoMode } from '../contexts/DemoModeContext';
import { isGoogleAdsConnected } from '../services/googleAds';
import { Link } from 'react-router-dom';

const Reports = () => {
    const { isDemoMode } = useDemoMode();
    const [generating, setGenerating] = useState(false);
    const isConnected = isGoogleAdsConnected();

    // Show mock reports in demo mode, real reports when connected
    const reports = isDemoMode ? [
        { id: 1, name: 'Rapport Mensuel - Octobre 2024', date: '01/11/2024', type: 'Performance Globale' },
        { id: 2, name: 'Analyse Hebdomadaire (S42)', date: '21/10/2024', type: 'Hebdomadaire' },
    ] : [];

    const handleGenerate = () => {
        setGenerating(true);
        // Simulate generation
        setTimeout(() => setGenerating(false), 2000);
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

                <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-full">
                        <AlertCircle size={48} className="text-orange-500" />
                    </div>
                    <div className="max-w-md space-y-3">
                        <h2 className="text-2xl font-bold">Compte Google Ads requis</h2>
                        <p className="text-gray-500">
                            Connectez votre compte Google Ads pour générer des rapports de performance personnalisés.
                        </p>
                    </div>
                    <Link to="/app/dashboard" className="btn btn-primary">
                        Connecter Google Ads
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold">Rapports Clients</h1>
                    <p className="text-gray-500 text-sm">Générez et téléchargez vos rapports de performance.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {generating ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Génération...
                        </>
                    ) : (
                        <>
                            <FileText size={18} />
                            Nouveau Rapport
                        </>
                    )}
                </button>
            </div>

            {isDemoMode && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Rapports générés</p>
                                <h3 className="text-2xl font-bold mt-1">12</h3>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 px-4">Historique</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="p-4">Nom du rapport</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {reports.length > 0 ? reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                                            <FileText size={16} />
                                        </div>
                                        {report.name}
                                    </td>
                                    <td className="p-4 text-gray-500">{report.date}</td>
                                    <td className="p-4"><span className="badge badge-sm badge-ghost">{report.type}</span></td>
                                    <td className="p-4 text-right">
                                        <button className="btn btn-ghost btn-sm text-blue-500 hover:bg-blue-50">
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-500">
                                        Aucun rapport généré pour le moment
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
