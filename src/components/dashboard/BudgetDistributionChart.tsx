import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Account } from '../../types/business';
import Spinner from '../common/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

interface BudgetDistributionChartProps {
    accounts: Account[];
    loading?: boolean;
}

const COLORS = ['#1963d5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const BudgetDistributionChart: React.FC<BudgetDistributionChartProps> = ({ accounts, loading = false }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        tooltipBg: isDark ? '#0a0a0a' : '#ffffff',
        tooltipBorder: isDark ? '#1a1a1a' : '#dcdde0',
        tooltipText: isDark ? '#f0f1f2' : '#050505',
    };

    if (loading) {
        return (
            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6 h-80 flex items-center justify-center">
                <Spinner size={32} />
            </div>
        );
    }

    if (!accounts || accounts.length === 0) {
        return (
            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6 h-80 flex items-center justify-center">
                <div className="text-neutral-400">Aucune donnée disponible</div>
            </div>
        );
    }

    const chartData = accounts.map((account, index) => ({
        name: account.name,
        value: Number(account.currentSpend) || 0,
        color: COLORS[index % COLORS.length],
    }));

    return (
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
            <h3 className="text-lg font-bold mb-6">Répartition du budget par compte</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => `${value.toFixed(2)} €`}
                        contentStyle={{
                            backgroundColor: colors.tooltipBg,
                            border: `1px solid ${colors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: colors.tooltipText,
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BudgetDistributionChart;
