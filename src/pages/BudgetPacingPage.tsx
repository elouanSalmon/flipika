import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, Minus,
    Users, DollarSign, Calendar,
    ArrowRight, Save, Check, RefreshCw,
    Grid, List, AlertTriangle, CheckCircle2,
    Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { executeQuery } from '../services/googleAds';
import { fetchMetaInsights } from '../services/metaAds';
import toast from 'react-hot-toast';
import type { Client } from '../types/client';

// ─── Helpers ───────────────────────────────────────────
function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDayOfMonth(date: Date): number {
    return date.getDate();
}

function formatDateGAQL(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

type PacingStatus = 'on_track' | 'under' | 'over' | 'no_budget';

interface PacingData {
    budget: number;
    spent: number;
    idealSpend: number;
    forecastedSpend: number;
    pacingRatio: number;
    status: PacingStatus;
    daysInMonth: number;
    dayOfMonth: number;
    daysRemaining: number;
    progressPercent: number;
    dailyRecommended: number;
    burnRate: number;
    remaining: number;
}

function calculatePacing(budget: number, spent: number, today: Date): PacingData {
    const daysInMonth = getDaysInMonth(today);
    const dayOfMonth = getDayOfMonth(today);
    const daysRemaining = daysInMonth - dayOfMonth;

    const idealSpend = (budget / daysInMonth) * dayOfMonth;
    const forecastedSpend = dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : 0;
    const pacingRatio = idealSpend > 0 ? spent / idealSpend : 0;
    const progressPercent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const remaining = Math.max(budget - spent, 0);
    const dailyRecommended = daysRemaining > 0 ? remaining / daysRemaining : 0;
    const burnRate = dayOfMonth > 0 ? spent / dayOfMonth : 0;

    let status: PacingStatus;
    if (budget <= 0) status = 'no_budget';
    else if (pacingRatio > 1.15) status = 'over';
    else if (pacingRatio < 0.85) status = 'under';
    else status = 'on_track';

    return {
        budget, spent, idealSpend, forecastedSpend,
        pacingRatio, status, daysInMonth, dayOfMonth,
        daysRemaining, progressPercent, dailyRecommended,
        burnRate, remaining,
    };
}

// ─── Spend fetching ────────────────────────────────────
interface SpendResult {
    spend: number;
    isAuto: boolean;
    isLoading: boolean;
    error: string | null;
}

async function fetchClientSpend(client: Client): Promise<{ spend: number; isAuto: boolean }> {
    if (!client.dataSources || client.dataSources.length === 0) {
        return { spend: 0, isAuto: false };
    }

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startStr = formatDateGAQL(firstOfMonth);
    const endStr = formatDateGAQL(today);

    let totalSpend = 0;
    let hasAutoData = false;

    for (const ds of client.dataSources) {
        try {
            if (ds.platform === 'google_ads') {
                const query = `SELECT metrics.cost_micros FROM customer WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`;
                const result = await executeQuery(ds.accountId, query);
                if (result.success && result.results) {
                    for (const row of result.results) {
                        const costMicros = Number(row?.metrics?.costMicros || row?.metrics?.cost_micros || 0);
                        totalSpend += costMicros / 1_000_000;
                    }
                    hasAutoData = true;
                }
            } else if (ds.platform === 'meta_ads') {
                const result = await fetchMetaInsights(ds.accountId, startStr, endStr, {
                    level: 'account',
                    fields: ['spend'],
                });
                if (result.success && result.data) {
                    for (const row of result.data) {
                        totalSpend += Number(row.spend || 0);
                    }
                    hasAutoData = true;
                }
            }
        } catch (err) {
            console.warn(`[BudgetPacing] Failed to fetch spend for ${ds.platform}/${ds.accountId}:`, err);
        }
    }

    return { spend: totalSpend, isAuto: hasAutoData };
}

// ─── Animation variants ────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, type: 'spring' as const, stiffness: 140 } },
};

// ─── Formatters ────────────────────────────────────────
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: 'EUR',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(value);
}

function formatPercent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

// ─── Circular Gauge ────────────────────────────────────
function CircularGauge({ percent, status, size = 72 }: { percent: number; status: PacingStatus; size?: number }) {
    const strokeWidth = 5;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.min(percent, 100);
    const offset = circumference - (clampedPercent / 100) * circumference;

    const colorMap: Record<PacingStatus, string> = {
        on_track: '#10b981',
        under: '#f59e0b',
        over: '#ef4444',
        no_budget: '#9ca3af',
    };
    const color = colorMap[status];

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" strokeWidth={strokeWidth}
                    className="stroke-neutral-200 dark:stroke-neutral-700"
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" strokeWidth={strokeWidth}
                    stroke={color}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {Math.round(clampedPercent)}%
                </span>
            </div>
        </div>
    );
}

// ─── Status Badge ──────────────────────────────────────
function StatusBadge({ status, t }: { status: PacingStatus; t: (key: string) => string }) {
    const config: Record<PacingStatus, { bg: string; text: string; icon: typeof TrendingUp }> = {
        on_track: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: Check },
        under: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: TrendingDown },
        over: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400', icon: TrendingUp },
        no_budget: { bg: 'bg-neutral-500/10 border-neutral-500/20', text: 'text-neutral-500', icon: Minus },
    };
    const c = config[status];
    const Icon = c.icon;
    const labelMap: Record<PacingStatus, string> = {
        on_track: t('status.onTrack'),
        under: t('status.underPacing'),
        over: t('status.overPacing'),
        no_budget: t('status.noBudget'),
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
            <Icon size={12} />
            {labelMap[status]}
        </span>
    );
}

// ─── Platform Badge ────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
    if (platform === 'google_ads') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Google Ads
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Meta Ads
        </span>
    );
}

// ─── Client Card ───────────────────────────────────────
function ClientPacingCard({
    client,
    spendResult,
    manualSpend,
    onManualSpendChange,
    onBudgetSave,
    t,
}: {
    client: Client;
    spendResult: SpendResult;
    manualSpend: number;
    onManualSpendChange: (value: number) => void;
    onBudgetSave: (clientId: string, budget: number) => void;
    t: (key: string, opts?: Record<string, unknown>) => string;
}) {
    const [budgetInput, setBudgetInput] = useState(String(client.monthlyBudget || ''));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setBudgetInput(String(client.monthlyBudget || ''));
    }, [client.monthlyBudget]);

    const today = new Date();
    const budget = client.monthlyBudget || 0;
    const effectiveSpend = spendResult.isAuto ? spendResult.spend : manualSpend;
    const pacing = calculatePacing(budget, effectiveSpend, today);

    const handleSaveBudget = async () => {
        const val = parseFloat(budgetInput);
        if (isNaN(val) || val < 0) return;
        setIsSaving(true);
        await onBudgetSave(client.id, val);
        setIsSaving(false);
    };



    return (
        <motion.div
            className="listing-card group"
            variants={itemVariants}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {/* Header */}
            <div className="listing-card-header">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {client.logoUrl ? (
                        <img
                            src={client.logoUrl}
                            alt={client.name}
                            className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-white/10 flex-shrink-0 bg-white"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-sm">
                                {client.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="listing-card-title-group">
                        <h3 className="listing-card-title truncate pr-2" title={client.name}>
                            {client.name}
                        </h3>
                        <div className="listing-card-subtitle mt-0.5 max-w-full">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {client.dataSources && client.dataSources.map((ds, i) => (
                                    <PlatformBadge key={i} platform={ds.platform} />
                                ))}
                                {spendResult.isAuto ? (
                                    <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <Zap size={10} />
                                        {t('card.autoFetched')}
                                    </span>
                                ) : !spendResult.isLoading && (
                                    <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-medium bg-neutral-500/10 text-neutral-500">
                                        {t('card.manualEntry')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                    <StatusBadge status={pacing.status} t={t} />
                </div>
            </div>

            <div className="listing-card-body flex-1 !pb-4">
                {/* Gauge + Metrics block */}
                {budget > 0 ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <CircularGauge percent={pacing.progressPercent} status={pacing.status} size={52} />
                                <div>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium mb-0.5">{t('card.currentSpend')}</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                                            {formatCurrency(effectiveSpend)}
                                        </span>
                                        <span className="text-xs text-neutral-400 font-medium">/ {formatCurrency(budget)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-lg bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-0.5 flex items-center gap-1">
                                    <TrendingUp size={10} />
                                    {t('card.projected')}
                                </p>
                                <p className={`text-sm font-bold truncate leading-tight ${pacing.status === 'over' ? 'text-red-600 dark:text-red-400' :
                                    pacing.status === 'under' ? 'text-amber-600 dark:text-amber-400' :
                                        'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    {formatCurrency(pacing.forecastedSpend)}
                                </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-0.5 flex items-center gap-1">
                                    <TrendingDown size={10} />
                                    {t('card.dailyRecommended')}
                                </p>
                                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate leading-tight">
                                    {formatCurrency(pacing.dailyRecommended)}
                                </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-0.5 flex items-center gap-1">
                                    <Zap size={10} className="text-amber-500" />
                                    {t('card.burnRate')}
                                </p>
                                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate leading-tight">
                                    {formatCurrency(pacing.burnRate)}
                                </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-0.5 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {t('card.daysRemaining')}
                                </p>
                                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate leading-tight">
                                    {pacing.daysRemaining} <span className="text-[10px] font-normal text-neutral-400">/ {pacing.daysInMonth}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center mb-3">
                            <Wallet size={16} className="text-neutral-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Aucun budget défini</p>
                        <p className="text-xs text-neutral-500 px-4">
                            Saisissez un budget mensuel ci-dessous pour suivre le rythme de dépense.
                        </p>
                    </div>
                )}
            </div>

            <div className="listing-card-footer mt-auto flex-col gap-3 py-3 px-4 bg-neutral-50/30 dark:bg-white/[0.01]">
                <div className="w-full space-y-2.5">
                    {/* Budget Input */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex-shrink-0 w-16">
                            Budget
                        </label>
                        <div className="flex gap-1.5 flex-1">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    value={budgetInput}
                                    onChange={e => setBudgetInput(e.target.value)}
                                    placeholder={t('card.budgetPlaceholder')}
                                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-neutral-400"
                                    min="0"
                                    step="100"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">€</span>
                            </div>
                            <button
                                onClick={handleSaveBudget}
                                disabled={isSaving || budgetInput === String(client.monthlyBudget || '')}
                                className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:hover:bg-primary flex items-center justify-center"
                                title={t('card.saveBudget')}
                            >
                                <Save size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Manual spend input (only when no auto-data) */}
                    {!spendResult.isAuto && !spendResult.isLoading && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex-shrink-0 w-16">
                                Dépense
                            </label>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    value={manualSpend || ''}
                                    onChange={e => onManualSpendChange(parseFloat(e.target.value) || 0)}
                                    placeholder={t('card.spendPlaceholder')}
                                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-neutral-400"
                                    min="0"
                                    step="50"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">€</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div >
    );
}

// ─── Alerts Section ────────────────────────────────────
function AlertsSection({
    clients,
    pacingMap,
    t,
}: {
    clients: Client[];
    pacingMap: Record<string, PacingData>;
    t: (key: string, opts?: Record<string, unknown>) => string;
}) {
    const alerts: { type: 'over' | 'under' | 'info'; message: string }[] = [];

    const noBudgetCount = clients.filter(c => !c.monthlyBudget || c.monthlyBudget <= 0).length;
    if (noBudgetCount > 0) {
        alerts.push({ type: 'info', message: t('alerts.noBudgetClients', { count: noBudgetCount }) });
    }

    clients.forEach(c => {
        const pacing = pacingMap[c.id];
        if (!pacing || pacing.status === 'no_budget') return;
        if (pacing.status === 'over' && pacing.daysRemaining > 0) {
            const excess = pacing.burnRate - (pacing.budget / pacing.daysInMonth);
            alerts.push({
                type: 'over',
                message: t('alerts.overPacing', { name: c.name, amount: Math.round(excess) }),
            });
        } else if (pacing.status === 'under' && pacing.daysRemaining > 0) {
            const deficit = (pacing.budget / pacing.daysInMonth) - pacing.burnRate;
            alerts.push({
                type: 'under',
                message: t('alerts.underPacing', { name: c.name, amount: Math.round(deficit) }),
            });
        }
    });

    if (alerts.length === 0) {
        return (
            <motion.div
                className="glass rounded-xl p-4 flex items-center gap-3 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('alerts.allGood')}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="space-y-2 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {alerts.map((alert, i) => {
                const Icon = alert.type === 'over' ? ArrowUpRight : alert.type === 'under' ? ArrowDownRight : AlertTriangle;
                const colors = alert.type === 'over'
                    ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400'
                    : alert.type === 'under'
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400'
                        : 'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-400';
                return (
                    <div key={i} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border ${colors}`}>
                        <Icon size={16} className="mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{alert.message}</p>
                    </div>
                );
            })}
        </motion.div>
    );
}

// ─── Table View ────────────────────────────────────────
function TableView({
    clients,
    pacingMap,
    t,
}: {
    clients: Client[];
    pacingMap: Record<string, PacingData>;
    t: (key: string) => string;
}) {
    return (
        <motion.div
            className="bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-white/10">
                            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('table.client')}</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('table.platform')}</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('table.budget')}</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('table.spend')}</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('table.pacing')}</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('table.dailyRemaining')}</th>
                            <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('table.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => {
                            const pacing = pacingMap[client.id];
                            if (!pacing) return null;
                            return (
                                <tr key={client.id} className="border-b border-neutral-100 dark:border-white/5 hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            {client.logoUrl ? (
                                                <img src={client.logoUrl} alt={client.name} className="w-7 h-7 rounded-lg object-cover border border-neutral-200 dark:border-white/10" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary font-bold text-xs">{client.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                            )}
                                            <span className="font-medium text-neutral-900 dark:text-neutral-100">{client.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex gap-1">
                                            {client.dataSources?.map((ds, i) => (
                                                <PlatformBadge key={i} platform={ds.platform} />
                                            ))}
                                            {(!client.dataSources || client.dataSources.length === 0) && (
                                                <span className="text-neutral-400 text-xs">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                                        {pacing.budget > 0 ? formatCurrency(pacing.budget) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                                        {formatCurrency(pacing.spent)}
                                    </td>
                                    <td className={`px-5 py-3.5 text-right font-bold tabular-nums ${pacing.status === 'over' ? 'text-red-600 dark:text-red-400' :
                                        pacing.status === 'under' ? 'text-amber-600 dark:text-amber-400' :
                                            pacing.status === 'on_track' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'
                                        }`}>
                                        {pacing.budget > 0 ? formatPercent(pacing.pacingRatio) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
                                        {pacing.budget > 0 ? formatCurrency(pacing.dailyRecommended) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <StatusBadge status={pacing.status} t={t} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

// ─── Main Page ─────────────────────────────────────────
export default function BudgetPacingPage() {
    const { t } = useTranslation('budget-pacing');
    const navigate = useNavigate();
    const { clients, isLoading, updateClient } = useClients();

    const [activeTab, setActiveTab] = useState<'global' | 'accounts'>('global');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [manualSpendMap, setManualSpendMap] = useState<Record<string, number>>({});
    const [spendResults, setSpendResults] = useState<Record<string, SpendResult>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    // Fetch spend for all clients
    const fetchAllSpend = useCallback(async () => {
        if (clients.length === 0) return;

        setIsRefreshing(true);

        // Mark all as loading
        const loadingState: Record<string, SpendResult> = {};
        clients.forEach(c => {
            loadingState[c.id] = { spend: 0, isAuto: false, isLoading: true, error: null };
        });
        setSpendResults(loadingState);

        // Fetch each client's spend in parallel
        const results = await Promise.allSettled(
            clients.map(async (client) => {
                try {
                    const result = await fetchClientSpend(client);
                    return { clientId: client.id, spend: result.spend, isAuto: result.isAuto, error: null };
                } catch (err: any) {
                    return { clientId: client.id, spend: 0, isAuto: false, error: err.message || 'Error' };
                }
            })
        );

        const newResults: Record<string, SpendResult> = {};
        results.forEach((r) => {
            if (r.status === 'fulfilled') {
                newResults[r.value.clientId] = {
                    spend: r.value.spend,
                    isAuto: r.value.isAuto,
                    isLoading: false,
                    error: r.value.error,
                };
            }
        });

        setSpendResults(newResults);
        setIsRefreshing(false);
        setLastRefresh(new Date());
    }, [clients]);

    // Auto-fetch on mount when clients are loaded
    useEffect(() => {
        if (!isLoading && clients.length > 0) {
            fetchAllSpend();
        }
    }, [isLoading, clients.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleManualSpendChange = (clientId: string, value: number) => {
        setManualSpendMap(prev => ({ ...prev, [clientId]: value }));
    };

    const handleBudgetSave = async (clientId: string, budget: number) => {
        try {
            await updateClient(clientId, { monthlyBudget: budget });
            toast.success(t('card.budgetSaved'));
        } catch {
            // Error toast handled by useClients
        }
    };

    // Compute pacing for all clients
    const pacingMap = useMemo(() => {
        const today = new Date();
        const map: Record<string, PacingData> = {};
        clients.forEach(c => {
            const budget = c.monthlyBudget || 0;
            const sr = spendResults[c.id];
            const effectiveSpend = sr?.isAuto ? sr.spend : (manualSpendMap[c.id] || 0);
            map[c.id] = calculatePacing(budget, effectiveSpend, today);
        });
        return map;
    }, [clients, spendResults, manualSpendMap]);

    // Summary stats
    const summary = useMemo(() => {
        let totalBudget = 0;
        let totalSpend = 0;
        let trackedCount = 0;
        let pacingSum = 0;
        let onTrack = 0;
        let over = 0;
        let under = 0;
        let totalDailyRecommended = 0;

        clients.forEach(c => {
            const pacing = pacingMap[c.id];
            if (!pacing || pacing.budget <= 0) return;
            trackedCount++;
            totalBudget += pacing.budget;
            totalSpend += pacing.spent;
            pacingSum += pacing.pacingRatio;
            totalDailyRecommended += pacing.dailyRecommended;
            if (pacing.status === 'on_track') onTrack++;
            else if (pacing.status === 'over') over++;
            else if (pacing.status === 'under') under++;
        });

        return {
            totalClients: trackedCount,
            totalBudget,
            totalSpend,
            avgPacing: trackedCount > 0 ? pacingSum / trackedCount : 0,
            onTrack,
            over,
            under,
            totalDailyRecommended,
        };
    }, [clients, pacingMap]);

    const today = new Date();
    const daysInMonth = getDaysInMonth(today);
    const dayOfMonth = getDayOfMonth(today);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="max-w-lg mx-auto text-center py-24 px-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Wallet size={28} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    {t('empty.title')}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    {t('empty.description')}
                </p>
                <button
                    onClick={() => navigate('/app/clients')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                    {t('empty.cta')}
                    <ArrowRight size={16} />
                </button>
            </div>
        );
    }

    const overallPacing = calculatePacing(summary.totalBudget, summary.totalSpend, today);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-160px)] flex flex-col gap-6">
            {/* Page Header */}
            <motion.div
                className="page-header !mb-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="header-content">
                    <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Wallet size={32} className="header-icon" />
                        <h1>{t('title')}</h1>
                    </div>
                    <p className="header-subtitle">{t('subtitle')}</p>
                </div>

                {/* Header Actions */}
                <div className="flex bg-transparent shrink-0 self-start mt-2 sm:mt-0 items-center justify-end">
                    <button
                        onClick={fetchAllSpend}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-white dark:bg-black text-neutral-500 border border-neutral-200 dark:border-white/10 hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">{isRefreshing ? t('refreshing') : t('refresh')}</span>
                    </button>
                </div>
            </motion.div>

            {/* Month Progress */}
            <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Calendar size={16} className="text-neutral-400 flex-shrink-0" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('month.label')} — {t('month.progress', { current: dayOfMonth, total: daysInMonth })}
                </span>
                <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden max-w-xs">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(dayOfMonth / daysInMonth) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    />
                </div>
                {lastRefresh && (
                    <span className="text-xs text-neutral-400 hidden sm:inline">
                        {t('lastRefresh', { time: lastRefresh.toLocaleTimeString() })}
                    </span>
                )}
            </motion.div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-neutral-200 dark:border-white/10 -mt-2">
                <button
                    className={`pb-3 px-1 border-b-2 font-medium text-sm mr-8 transition-colors ${
                        activeTab === 'global'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                    onClick={() => setActiveTab('global')}
                >
                    {t('tabs.global', 'Suivi global')}
                </button>
                <button
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'accounts'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                    onClick={() => setActiveTab('accounts')}
                >
                    {t('tabs.accounts', 'Compte par compte')}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'global' && (
                    <motion.div
                        key="global"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Summary Cards */}
                        <motion.div
                            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Total Budget with gauge */}
                            <motion.div className="bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-2xl shadow-sm p-4 sm:p-5" variants={itemVariants}>
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Wallet size={20} className="text-primary" />
                                    </div>
                                    <CircularGauge percent={overallPacing.progressPercent} status={overallPacing.status} size={48} />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(summary.totalBudget)}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 mt-1">{t('summary.totalBudget')}</p>
                                </div>
                            </motion.div>

                            {/* Total Spend */}
                            <motion.div className="bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-2xl shadow-sm p-4 sm:p-5" variants={itemVariants}>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 sm:mb-4">
                                    <DollarSign size={20} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(summary.totalSpend)}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 mt-1">{t('summary.totalSpend')}</p>
                                </div>
                            </motion.div>

                            {/* Status breakdown */}
                            <motion.div className="bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-2xl shadow-sm p-4 sm:p-5" variants={itemVariants}>
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Users size={20} className="text-primary" />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        {summary.onTrack > 0 && <span className="text-emerald-500 font-medium">✓ {summary.onTrack}</span>}
                                        {summary.over > 0 && <span className="text-red-500 font-medium">↑ {summary.over}</span>}
                                        {summary.under > 0 && <span className="text-amber-500 font-medium">↓ {summary.under}</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{summary.totalClients}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 mt-1">{t('summary.totalClients')}</p>
                                </div>
                            </motion.div>

                            {/* Avg Pacing */}
                            <motion.div className="bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-2xl shadow-sm p-4 sm:p-5" variants={itemVariants}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${summary.avgPacing > 1.15 ? 'bg-red-500/10' : summary.avgPacing < 0.85 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                                    <TrendingUp size={20} className={summary.avgPacing > 1.15 ? 'text-red-500' : summary.avgPacing < 0.85 ? 'text-amber-500' : 'text-emerald-500'} />
                                </div>
                                <div>
                                    <p className={`text-xl sm:text-2xl font-bold ${summary.avgPacing > 1.15 ? 'text-red-600 dark:text-red-400' : summary.avgPacing < 0.85 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {formatPercent(summary.avgPacing)}
                                    </p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 mt-1">{t('summary.avgPacing')}</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Alerts Summary Table (Replacing Cards for "Global") */}
                        <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-white/10 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Alertes & Recommandations</h3>
                                    <p className="text-sm text-neutral-500">Vue synthétique des comptes nécessitant votre attention</p>
                                </div>
                            </div>
                            <div className="p-2 sm:p-4">
                                <AlertsSection clients={clients} pacingMap={pacingMap} t={t} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'accounts' && (
                    <motion.div
                        key="accounts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        {/* Header accounts */}
                        <div className="flex justify-between items-center min-h-[48px]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Users size={16} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">Liste des comptes</h2>
                                </div>
                            </div>
                            
                            <div className="view-controls flex gap-2">
                                <button
                                    className={`p-2 rounded-lg border-2 transition-all ${viewMode === 'cards'
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-white dark:bg-black text-neutral-500 border-neutral-200 dark:border-white/10 hover:border-primary/50 hover:text-primary'
                                        }`}
                                    onClick={() => setViewMode('cards')}
                                    title={t('viewCards')}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    className={`p-2 rounded-lg border-2 transition-all ${viewMode === 'table'
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-white dark:bg-black text-neutral-500 border-neutral-200 dark:border-white/10 hover:border-primary/50 hover:text-primary'
                                        }`}
                                    onClick={() => setViewMode('table')}
                                    title={t('viewTable')}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {viewMode === 'cards' ? (
                                <motion.div
                                    key="cards"
                                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                >
                                    {clients.map(client => (
                                        <ClientPacingCard
                                            key={client.id}
                                            client={client}
                                            spendResult={spendResults[client.id] || { spend: 0, isAuto: false, isLoading: false, error: null }}
                                            manualSpend={manualSpendMap[client.id] || 0}
                                            onManualSpendChange={(val) => handleManualSpendChange(client.id, val)}
                                            onBudgetSave={handleBudgetSave}
                                            t={t}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <TableView
                                    key="table"
                                    clients={clients}
                                    pacingMap={pacingMap}
                                    t={t}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
