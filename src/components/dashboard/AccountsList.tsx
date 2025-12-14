import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, BarChart3, Search, Filter } from 'lucide-react';
import type { Account } from '../../types/business';

interface AccountsListProps {
    accounts: Account[];
    onViewDetails?: (accountId: string) => void;
    onAudit?: (accountId: string) => void;
    onGenerateReport?: (accountId: string) => void;
    loading?: boolean;
}

const AccountsList: React.FC<AccountsListProps> = ({
    accounts,
    onViewDetails,
    onAudit,
    onGenerateReport,
    loading = false,
}) => {
    const getPerformanceColor = (score: number): string => {
        if (score >= 70) return 'bg-green-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getStatusBadge = (status: Account['status']) => {
        const styles = {
            active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
            paused: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
        };

        const labels = {
            active: 'Actif',
            inactive: 'Inactif',
            paused: 'En pause',
        };

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4">Comptes clients</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse p-4 bg-gray-100 dark:bg-gray-700 rounded-xl h-20"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Comptes clients</h3>
                    <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm">
                            <Search size={16} />
                        </button>
                        <button className="btn btn-ghost btn-sm">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/30">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Compte
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Budget
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Dépenses
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Campagnes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Performance
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {accounts.map(account => {
                            const spendPercentage = account.budgetMonthly
                                ? (account.currentSpend / account.budgetMonthly) * 100
                                : 0;

                            return (
                                <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{account.name}</p>
                                            <p className="text-xs text-gray-500">{account.id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(account.status)}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">
                                            {account.budgetMonthly?.toLocaleString('fr-FR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{' '}
                                            €
                                        </p>
                                        <p className="text-xs text-gray-500">/ mois</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {account.currentSpend.toLocaleString('fr-FR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}{' '}
                                                €
                                            </p>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${spendPercentage > 90 ? 'bg-red-500' : spendPercentage > 70 ? 'bg-orange-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(spendPercentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500">{spendPercentage.toFixed(0)}% du budget</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold">{account.campaignCount}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getPerformanceColor(account.performanceScore)}`}></div>
                                            <span className="font-semibold">{account.performanceScore}/100</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onViewDetails?.(account.id)}
                                                className="btn btn-ghost btn-sm"
                                                title="Voir détails"
                                            >
                                                <BarChart3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onAudit?.(account.id)}
                                                className="btn btn-ghost btn-sm"
                                                title="Auditer"
                                            >
                                                <TrendingUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => onGenerateReport?.(account.id)}
                                                className="btn btn-ghost btn-sm"
                                                title="Générer rapport"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountsList;
