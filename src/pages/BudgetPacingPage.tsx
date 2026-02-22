import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, Minus,
    Users, DollarSign, Calendar,
    ArrowRight, Save, Check, RefreshCw,
    Grid, List, AlertTriangle, CheckCircle2,
    Zap, ArrowUpRight, ArrowDownRight, ExternalLink,
    ArrowDown, ArrowUp, AlertCircle
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaMeta } from 'react-icons/fa6';
import { useClients } from '../hooks/useClients';
import { executeQuery } from '../services/googleAds';
import { fetchMetaInsights } from '../services/metaAds';
import toast from 'react-hot-toast';
import type { Client } from '../types/client';
import { ResponsiveContainer, AreaChart, Area, Tooltip, ReferenceLine } from 'recharts';

// ─── Helpers ───────────────────────────────────────────
function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDayOfMonth(date: Date): number {
    return date.getDate();
}

function getDaysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
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
    actualCpa?: number;
    targetCpa?: number;
    isPerformanceGood: boolean;
}

function calculatePacing(budget: number, spent: number, conversions: number, targetCpa: number | undefined, today: Date, startDate?: string, endDate?: string): PacingData {
    let daysInPeriod = getDaysInMonth(today);
    let dayOfPeriod = getDayOfMonth(today);

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        daysInPeriod = getDaysBetween(start, end);

        if (today < start) {
            dayOfPeriod = 0;
        } else if (today > end) {
            dayOfPeriod = daysInPeriod;
        } else {
            dayOfPeriod = getDaysBetween(start, today);
        }
    }

    const daysRemaining = Math.max(daysInPeriod - dayOfPeriod, 0);

    const idealSpend = (budget / daysInPeriod) * dayOfPeriod;
    const forecastedSpend = dayOfPeriod > 0 ? (spent / dayOfPeriod) * daysInPeriod : 0;
    const pacingRatio = idealSpend > 0 ? spent / idealSpend : 0;
    const progressPercent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const remaining = Math.max(budget - spent, 0);
    const dailyRecommended = daysRemaining > 0 ? remaining / daysRemaining : 0;
    const burnRate = dayOfPeriod > 0 ? spent / dayOfPeriod : 0;

    const actualCpa = conversions > 0 ? spent / conversions : undefined;
    const isPerformanceGood = !!(targetCpa && actualCpa && actualCpa <= targetCpa);

    let status: PacingStatus;
    if (budget <= 0) status = 'no_budget';
    else if (pacingRatio > 1.15) status = 'over';
    else if (pacingRatio < 0.85) status = 'under';
    else status = 'on_track';

    return {
        budget, spent, idealSpend, forecastedSpend,
        pacingRatio, status, daysInMonth: daysInPeriod, dayOfMonth: dayOfPeriod,
        daysRemaining, progressPercent, dailyRecommended,
        burnRate, remaining, actualCpa, targetCpa, isPerformanceGood
    };
}

// ─── Spend fetching ────────────────────────────────────
interface SpendResult {
    spend: number;
    conversions: number;
    platformSpends?: Record<string, number>;
    dailySpends?: Record<string, number>;
    isAuto: boolean;
    isLoading: boolean;
    error: string | null;
}

async function fetchClientSpend(client: Client): Promise<{ spend: number; conversions: number; platformSpends: Record<string, number>; isAuto: boolean; dailySpends: Record<string, number> }> {
    if (!client.dataSources || client.dataSources.length === 0) {
        return { spend: 0, conversions: 0, platformSpends: {}, isAuto: false, dailySpends: {} };
    }

    const today = new Date();
    let startStr = '';
    let endStr = formatDateGAQL(today);

    if (client.startDate && client.endDate) {
        startStr = client.startDate;
        // If today is past the end date, only fetch up to end date to lock the spend
        const endDateObj = new Date(client.endDate);
        if (today > endDateObj) {
            endStr = client.endDate;
        }
    } else {
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startStr = formatDateGAQL(firstOfMonth);
    }

    let totalSpend = 0;
    let totalConversions = 0;
    const platformSpends: Record<string, number> = {};
    const dailySpends: Record<string, number> = {};
    let hasAutoData = false;

    for (const ds of client.dataSources) {
        try {
            if (ds.platform === 'google_ads') {
                const query = `SELECT segments.date, metrics.cost_micros, metrics.conversions FROM customer WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`;
                const result = await executeQuery(ds.accountId, query);
                if (result.success && result.results) {
                    let dsSpend = 0;
                    for (const row of result.results) {
                        const costMicros = Number(row?.metrics?.costMicros || row?.metrics?.cost_micros || 0);
                        const convs = Number(row?.metrics?.conversions || 0);
                        const rowSpend = costMicros / 1_000_000;
                        dsSpend += rowSpend;
                        totalConversions += convs;

                        const date = row?.segments?.date;
                        if (date) {
                            dailySpends[date] = (dailySpends[date] || 0) + rowSpend;
                        }
                    }
                    totalSpend += dsSpend;
                    platformSpends['google_ads'] = (platformSpends['google_ads'] || 0) + dsSpend;
                    hasAutoData = true;
                }
            } else if (ds.platform === 'meta_ads') {
                const result = await fetchMetaInsights(ds.accountId, startStr, endStr, {
                    level: 'account',
                    fields: ['spend', 'actions'],
                    timeIncrement: 1,
                });
                if (result.success && result.data) {
                    let dsSpend = 0;
                    for (const row of result.data) {
                        const rowSpend = Number(row.spend || 0);
                        dsSpend += rowSpend;

                        const actions = row.actions || [];
                        for (const action of actions) {
                            if (action.action_type && (action.action_type.includes('purchase') || action.action_type.includes('lead') || action.action_type.includes('complete_registration'))) {
                                totalConversions += Number(action.value || 0);
                            }
                        }

                        const date = row.date_start;
                        if (date) {
                            dailySpends[date] = (dailySpends[date] || 0) + rowSpend;
                        }
                    }
                    totalSpend += dsSpend;
                    platformSpends['meta_ads'] = (platformSpends['meta_ads'] || 0) + dsSpend;
                    hasAutoData = true;
                }
            }
        } catch (err) {
            console.warn(`[BudgetPacing] Failed to fetch spend for ${ds.platform}/${ds.accountId}:`, err);
        }
    }

    return { spend: totalSpend, conversions: totalConversions, platformSpends, isAuto: hasAutoData, dailySpends };
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

// ─── Pacing Sparkline ──────────────────────────────────
function PacingSparkline({ dailySpends, targetDaily, pacing }: { dailySpends?: Record<string, number>; targetDaily: number; pacing: PacingData }) {
    if (!dailySpends || Object.keys(dailySpends).length === 0) {
        return (
            <div className="h-10 w-full mt-3 bg-neutral-50 dark:bg-white/[0.02] rounded-lg border border-neutral-100 dark:border-white/5 flex items-center justify-center">
                <span className="text-[10px] text-neutral-400">Aucune donnée sur 7j</span>
            </div>
        );
    }

    const data = [];
    const today = new Date();

    // Process last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = formatDateGAQL(d);

        data.push({
            date: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
            spend: dailySpends[dateStr] || 0,
            target: targetDaily
        });
    }

    const isGoodOver = pacing.status === 'over' && pacing.isPerformanceGood;
    const effectiveStatus = isGoodOver ? 'on_track' : pacing.status;

    const colorMap: Record<PacingStatus, string> = {
        on_track: '#10b981',
        under: '#f59e0b',
        over: '#ef4444',
        no_budget: '#9ca3af',
    };
    const color = colorMap[effectiveStatus];

    return (
        <div className="h-12 w-full mt-3 relative group">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`colorSpend-${effectiveStatus}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{ fontSize: '10px', padding: '4px 8px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--tw-colors-white, white)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#171717' }}
                        cursor={{ stroke: '#e5e5e5', strokeWidth: 1, strokeDasharray: '3 3' }}
                        formatter={(value: number) => [`${Math.round(value)} €`, 'Dépense']}
                        labelFormatter={(label) => label}
                    />
                    <ReferenceLine y={targetDaily} stroke="#9ca3af" strokeDasharray="3 3" strokeWidth={1} />
                    <Area type="monotone" dataKey="spend" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#colorSpend-${effectiveStatus})`} />
                </AreaChart>
            </ResponsiveContainer>
            <div className="absolute top-0 right-0 text-[9px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/80 px-1 rounded">
                Derniers 7 j.
            </div>
        </div>
    );
}

// ─── Status Badge ──────────────────────────────────────
function StatusBadge({ pacing, t }: { pacing: PacingData; t: (key: string) => string }) {
    const isGoodOver = pacing.status === 'over' && pacing.isPerformanceGood;
    const status = pacing.status;

    const config: Record<PacingStatus, { bg: string; text: string; icon: typeof TrendingUp }> = {
        on_track: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: Check },
        under: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: TrendingDown },
        over: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400', icon: TrendingUp },
        no_budget: { bg: 'bg-neutral-500/10 border-neutral-500/20', text: 'text-neutral-500', icon: Minus },
    };
    const c = isGoodOver ? config.on_track : config[status];
    const Icon = isGoodOver ? TrendingUp : c.icon;
    const labelMap: Record<PacingStatus, string> = {
        on_track: t('status.onTrack'),
        under: t('status.underPacing'),
        over: t('status.overPacing'),
        no_budget: t('status.noBudget'),
    };

    const label = isGoodOver ? 'Over (Bonne Perfo)' : labelMap[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
            <Icon size={12} />
            {label}
        </span>
    );
}

// ─── Platform Badge ────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
    if (platform === 'google_ads') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                <FcGoogle size={14} />
                Google Ads
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
            <FaMeta size={14} className="text-[#0668E1]" />
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
    onBudgetSave: (clientId: string, updates: Partial<Client>) => void;
    t: (key: string, opts?: Record<string, unknown>) => string;
}) {
    const [budgetInput, setBudgetInput] = useState(String(client.monthlyBudget || ''));
    const [startDateInput, setStartDateInput] = useState(client.startDate || '');
    const [endDateInput, setEndDateInput] = useState(client.endDate || '');
    const [targetCpaInput, setTargetCpaInput] = useState(String(client.targetCpa || ''));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setBudgetInput(String(client.monthlyBudget || ''));
        setStartDateInput(client.startDate || '');
        setEndDateInput(client.endDate || '');
        setTargetCpaInput(String(client.targetCpa || ''));
    }, [client.monthlyBudget, client.startDate, client.endDate, client.targetCpa]);

    const today = new Date();
    const budget = client.monthlyBudget || 0;
    const effectiveSpend = spendResult.isAuto ? spendResult.spend : manualSpend;
    const pacing = calculatePacing(budget, effectiveSpend, spendResult.conversions || 0, client.targetCpa, today, client.startDate, client.endDate);

    const hasChanges =
        budgetInput !== String(client.monthlyBudget || '') ||
        startDateInput !== (client.startDate || '') ||
        endDateInput !== (client.endDate || '') ||
        targetCpaInput !== String(client.targetCpa || '');

    const handleSaveBudget = async () => {
        const val = parseFloat(budgetInput);
        const cpaVal = parseFloat(targetCpaInput);

        const updates: Partial<Client> = {
            monthlyBudget: isNaN(val) ? 0 : val,
            startDate: startDateInput || undefined,
            endDate: endDateInput || undefined,
            targetCpa: isNaN(cpaVal) ? undefined : cpaVal,
        };

        setIsSaving(true);
        await onBudgetSave(client.id, updates);
        setIsSaving(false);
    };

    const googleSpend = spendResult.platformSpends?.['google_ads'] || 0;
    const metaSpend = spendResult.platformSpends?.['meta_ads'] || 0;
    const totalPlatformSpend = googleSpend + metaSpend;
    const hasMultiplePlatforms = client.dataSources && new Set(client.dataSources.map(ds => ds.platform)).size > 1;
    const showDistribution = totalPlatformSpend > 0 && hasMultiplePlatforms;
    const hasNoDataWarning = spendResult.isAuto && !spendResult.isLoading && totalPlatformSpend === 0 && budget > 0;

    return (
        <motion.div
            className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm overflow-hidden group flex flex-col lg:flex-row"
            variants={itemVariants}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="flex-1 flex flex-col p-4 lg:p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {client.logoUrl ? (
                            <img
                                src={client.logoUrl}
                                alt={client.name}
                                className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-white/10 flex-shrink-0 bg-white"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-neutral-500 font-bold text-sm">
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
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                                            <Zap size={10} className="text-emerald-500" />
                                            {t('card.autoFetched')}
                                        </span>
                                    ) : !spendResult.isLoading && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                                            {t('card.manualEntry')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <StatusBadge pacing={pacing} t={t} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    {/* Gauge + Metrics block */}
                    {budget > 0 ? (
                        <div className="flex flex-col gap-4">
                            {hasNoDataWarning ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-700/30">
                                    <AlertCircle size={32} className="text-amber-500 mb-3" />
                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                        Aucune dépense détectée
                                    </p>
                                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 max-w-sm">
                                        Nous n'avons pu récupérer aucune donnée de dépense depuis Google Ads ou Meta Ads sur cette période. Vérifiez vos dates de vol ou l'association des comptes.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <CircularGauge percent={pacing.progressPercent} status={pacing.status} size={52} />
                                            <div className="flex-1">
                                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium mb-0.5">{t('card.currentSpend')}</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                                                        {formatCurrency(effectiveSpend)}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 font-medium">/ {formatCurrency(budget)}</span>
                                                </div>
                                                {showDistribution && (
                                                    <div className="mt-2.5 space-y-1">
                                                        <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-neutral-200 dark:bg-white/10">
                                                            <div
                                                                className="h-full bg-neutral-800 dark:bg-white"
                                                                style={{ width: `${(googleSpend / totalPlatformSpend) * 100}%` }}
                                                                title={`Google Ads: ${formatCurrency(googleSpend)}`}
                                                            />
                                                            <div
                                                                className="h-full bg-[#0668E1]"
                                                                style={{ width: `${(metaSpend / totalPlatformSpend) * 100}%` }}
                                                                title={`Meta Ads: ${formatCurrency(metaSpend)}`}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between text-[9px] font-medium text-neutral-500">
                                                            <span className="flex items-center gap-1">
                                                                <FcGoogle size={10} className="flex-shrink-0" />
                                                                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{formatCurrency(googleSpend)}</span>
                                                                <span className="opacity-70">({Math.round((googleSpend / totalPlatformSpend) * 100)}%)</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="opacity-70">({Math.round((metaSpend / totalPlatformSpend) * 100)}%)</span>
                                                                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{formatCurrency(metaSpend)}</span>
                                                                <FaMeta size={10} className="text-[#0668E1] flex-shrink-0" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
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
                                                <Zap size={10} />
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

                                    {/* 7-Day Sparkline */}
                                    <PacingSparkline
                                        dailySpends={spendResult.dailySpends}
                                        targetDaily={pacing.budget > 0 ? (pacing.budget / pacing.daysInMonth) : 0}
                                        pacing={pacing}
                                    />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                            <Wallet size={32} className="text-neutral-400 mb-4" />
                            <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Aucun budget défini</p>
                            <p className="text-xs text-neutral-500 px-4">
                                Saisissez un budget mensuel ci-dessous pour suivre le rythme de dépense.
                            </p>
                        </div>
                    )}
                    {/* Platform Links */}
                    {client.dataSources && client.dataSources.length > 0 && (
                        <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-neutral-200 dark:border-white/10 w-full">
                            {Array.from(new Set(client.dataSources.map(ds => ds.platform)))
                                .map(platform => {
                                    const ds = client.dataSources!.find(d => d.platform === platform);
                                    if (!ds) return null;

                                    if (ds.platform === 'google_ads') {
                                        return (
                                            <a
                                                key={platform}
                                                href={`https://ads.google.com/aw/campaigns?ocid=${ds.accountId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-white dark:bg-black/50 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 hover:border-neutral-300 dark:hover:border-white/20 transition-all"
                                            >
                                                <FcGoogle size={12} />
                                                <span>Ouvrir dans Google Ads</span>
                                                <ExternalLink size={10} className="opacity-50 ml-1" />
                                            </a>
                                        );
                                    } else if (ds.platform === 'meta_ads') {
                                        return (
                                            <a
                                                key={platform}
                                                href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${ds.accountId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-white dark:bg-black/50 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 hover:border-neutral-300 dark:hover:border-white/20 transition-all"
                                            >
                                                <FaMeta size={12} className="text-[#0668E1]" />
                                                <span>Ouvrir dans Meta Ads</span>
                                                <ExternalLink size={10} className="opacity-50 ml-1" />
                                            </a>
                                        );
                                    }
                                    return null;
                                })}
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.01] p-4 lg:p-5 flex flex-col justify-between">
                <div className="w-full space-y-4">
                    {/* Budget & Target CPA Input Row */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[10px] font-medium text-neutral-500 mb-1">
                                {t('card.budget')}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={budgetInput}
                                    onChange={e => setBudgetInput(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2.5 py-1 text-sm rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-neutral-400"
                                    min="0"
                                    step="100"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">€</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-medium text-neutral-500 mb-1">
                                Target CPA
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={targetCpaInput}
                                    onChange={e => setTargetCpaInput(e.target.value)}
                                    placeholder="Optionnel"
                                    className="w-full px-2.5 py-1 text-sm rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-neutral-400"
                                    min="0"
                                    step="1"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">€</span>
                            </div>
                        </div>
                    </div>

                    {/* Flight Dates Row */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[10px] font-medium text-neutral-500 mb-1">
                                Date début
                            </label>
                            <input
                                type="date"
                                value={startDateInput}
                                onChange={e => setStartDateInput(e.target.value)}
                                className="w-full px-2 py-1 text-[11px] rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-medium text-neutral-500 mb-1">
                                Date fin
                            </label>
                            <input
                                type="date"
                                value={endDateInput}
                                onChange={e => setEndDateInput(e.target.value)}
                                min={startDateInput}
                                className="w-full px-2 py-1 text-[11px] rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Action buttons (Save + Manual) */}
                    <div className="flex flex-col gap-3 pt-2">
                        {!spendResult.isAuto && !spendResult.isLoading && (
                            <div className="flex items-center gap-2 w-full">
                                <label className="text-[10px] font-medium text-neutral-500 flex-shrink-0 w-16">
                                    Dépense
                                </label>
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        value={manualSpend || ''}
                                        onChange={e => onManualSpendChange(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">€</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSaveBudget}
                            disabled={isSaving || !hasChanges}
                            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${hasChanges
                                ? 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                                : 'bg-neutral-100 dark:bg-white/10 text-neutral-400 cursor-not-allowed'
                                }`}
                            title={t('card.saveConfig')}
                        >
                            {isSaving ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : hasChanges ? (
                                <Save size={14} />
                            ) : (
                                <Check size={14} />
                            )}
                            {hasChanges ? t('card.save', { defaultValue: 'Enregistrer la configuration' }) : t('card.saved', { defaultValue: 'Configuration à jour' })}
                        </button>
                    </div>
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
    sortConfig,
    onSort,
    t,
}: {
    clients: Client[];
    pacingMap: Record<string, PacingData>;
    sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
    onSort: (key: string) => void;
    t: (key: string) => string;
}) {
    const renderSortIcon = (columnKey: string) => {
        if (sortConfig?.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 inline" /> : <ArrowDown size={12} className="ml-1 inline" />;
    };

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
                            <th
                                className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                                onClick={() => onSort('budget')}
                            >
                                {t('table.budget')}
                                {renderSortIcon('budget')}
                            </th>
                            <th
                                className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                                onClick={() => onSort('spend')}
                            >
                                {t('table.spend')}
                                {renderSortIcon('spend')}
                            </th>
                            <th
                                className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                                onClick={() => onSort('pacing')}
                            >
                                {t('table.pacing')}
                                {renderSortIcon('pacing')}
                            </th>
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
                                        <StatusBadge pacing={pacing} t={t} />
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
    const [filterStatus, setFilterStatus] = useState<'all' | 'over' | 'under' | 'no_budget'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
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
            loadingState[c.id] = { spend: 0, conversions: 0, isAuto: false, isLoading: true, error: null };
        });
        setSpendResults(loadingState);

        // Fetch each client's spend in parallel
        const results = await Promise.allSettled(
            clients.map(async (client) => {
                try {
                    const result = await fetchClientSpend(client);
                    return { clientId: client.id, spend: result.spend, conversions: result.conversions, platformSpends: result.platformSpends, isAuto: result.isAuto, dailySpends: result.dailySpends, error: null };
                } catch (err: any) {
                    return { clientId: client.id, spend: 0, conversions: 0, platformSpends: {}, isAuto: false, dailySpends: {}, error: err.message || 'Error' };
                }
            })
        );

        const newResults: Record<string, SpendResult> = {};
        results.forEach((r) => {
            if (r.status === 'fulfilled') {
                newResults[r.value.clientId] = {
                    spend: r.value.spend,
                    conversions: r.value.conversions,
                    platformSpends: r.value.platformSpends,
                    dailySpends: r.value.dailySpends,
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

    const handleBudgetSave = async (clientId: string, updates: Partial<Client>) => {
        try {
            await updateClient(clientId, updates);
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
            map[c.id] = calculatePacing(budget, effectiveSpend, sr?.conversions || 0, c.targetCpa, today, c.startDate, c.endDate);
        });
        return map;
    }, [clients, spendResults, manualSpendMap]);

    const filteredAndSortedClients = useMemo(() => {
        let result = [...clients];

        // Apply filtering
        if (filterStatus !== 'all') {
            result = result.filter(c => {
                const pacing = pacingMap[c.id];
                if (!pacing) return false;
                return pacing.status === filterStatus;
            });
        }

        // Apply sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const pacingA = pacingMap[a.id];
                const pacingB = pacingMap[b.id];

                // If one has no pacing data, push it to the end
                if (!pacingA && !pacingB) return 0;
                if (!pacingA) return 1;
                if (!pacingB) return -1;

                let valA = 0;
                let valB = 0;

                switch (sortConfig.key) {
                    case 'budget':
                        valA = pacingA.budget;
                        valB = pacingB.budget;
                        break;
                    case 'spend':
                        valA = pacingA.spent;
                        valB = pacingB.spent;
                        break;
                    case 'pacing':
                        valA = pacingA.pacingRatio;
                        valB = pacingB.pacingRatio;
                        break;
                    default:
                        valA = 0;
                        valB = 0;
                }

                if (valA < valB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [clients, pacingMap, filterStatus, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

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
                <Wallet size={48} className="mx-auto mb-6 text-neutral-400" />
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

    const overallPacing = calculatePacing(summary.totalBudget, summary.totalSpend, 0, undefined, today);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[calc(100vh-160px)] flex flex-col gap-6">
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

            {/* Période Progress */}
            <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Calendar size={16} className="text-neutral-400 flex-shrink-0" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Avancement Global — Jour {overallPacing.dayOfMonth} sur {overallPacing.daysInMonth}
                </span>
                <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden max-w-xs">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(overallPacing.dayOfMonth / Math.max(overallPacing.daysInMonth, 1)) * 100}%` }}
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
                    className={`pb-3 px-1 border-b-2 font-medium text-sm mr-8 transition-colors ${activeTab === 'global'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                    onClick={() => setActiveTab('global')}
                >
                    {t('tabs.global', 'Suivi global')}
                </button>
                <button
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'accounts'
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
                                <div className="flex items-start justify-between mb-4">
                                    <Wallet size={28} className="text-primary mt-1" />
                                    <CircularGauge percent={overallPacing.progressPercent} status={overallPacing.status} size={48} />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(summary.totalBudget)}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 mt-1">{t('summary.totalBudget')}</p>
                                </div>
                            </motion.div>

                            {/* Total Spend */}
                            <motion.div className="bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-2xl shadow-sm p-4 sm:p-5" variants={itemVariants}>
                                <DollarSign size={24} className="text-emerald-500 mb-4" />
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(summary.totalSpend)}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 mt-1">{t('summary.totalSpend')}</p>
                                </div>
                            </motion.div>

                            {/* Status breakdown */}
                            <motion.div className="bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-2xl shadow-sm p-4 sm:p-5" variants={itemVariants}>
                                <div className="flex items-start justify-between mb-4">
                                    <Users size={24} className="text-primary" />
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
                                <TrendingUp size={24} className={`mb-4 ${summary.avgPacing > 1.15 ? 'text-red-500' : summary.avgPacing < 0.85 ? 'text-amber-500' : 'text-emerald-500'}`} />
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
                        <div className="flex justify-between items-center min-h-[48px] flex-wrap gap-4">
                            <div className="flex items-center gap-2.5">
                                <Users size={20} className="text-primary" />
                                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">Liste des comptes</h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filterStatus === 'all' ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10'}`}>
                                        Tous
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('over')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${filterStatus === 'over' ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'}`}>
                                        <TrendingUp size={12} />
                                        Over
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('under')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${filterStatus === 'under' ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'}`}>
                                        <TrendingDown size={12} />
                                        Under
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('no_budget')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${filterStatus === 'no_budget' ? 'bg-neutral-500 text-white' : 'bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/20'}`}>
                                        <Minus size={12} />
                                        Sans budget
                                    </button>
                                </div>
                                <div className="h-6 w-px bg-neutral-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
                                <div className="view-controls flex gap-2 shrink-0">
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
                        </div>

                        <AnimatePresence mode="wait">
                            {viewMode === 'cards' ? (
                                <motion.div
                                    key="cards"
                                    className="grid grid-cols-1 gap-4 sm:gap-6 w-full"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                >
                                    {filteredAndSortedClients.map(client => (
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
                                    clients={filteredAndSortedClients}
                                    pacingMap={pacingMap}
                                    sortConfig={sortConfig}
                                    onSort={handleSort}
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
