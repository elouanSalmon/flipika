import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    CheckCircle,
    Zap,
    LayoutGrid,
    Palette,
    Clock,
    Send,
    Calendar,
    Feather,
} from 'lucide-react';
import { SiGoogleads } from 'react-icons/si';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

/* ─────────────────────────────────────────────
   Shared wrapper
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Shared wrapper
   ───────────────────────────────────────────── */

const IllustrationShell: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
    // Basic mobile check to reduce rotation intensity preventing overflow
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="w-full relative group" style={{ perspective: "1200px" }}>
            <motion.div
                className={`w-full rounded-2xl overflow-hidden border border-neutral-200/60 dark:border-white/10 shadow-2xl select-none bg-white dark:bg-neutral-950 relative ${className}`}
                initial={isMobile ? { rotateY: 0, rotateX: 0, scale: 1 } : { rotateY: -12, rotateX: 5, scale: 0.95 }}
                whileHover={isMobile ? {} : { rotateY: 0, rotateX: 0, scale: 1, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
                aria-hidden="true"
            >
                {children}

                {/* Glass reflection overlay for enhanced 3D feel */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            </motion.div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   1. HERO — Animated Dashboard with Growth
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   1. HERO — 3D Floating Dashboard (High Impact)
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   1. HERO — Simplified "Fast Report" Illustration
   ───────────────────────────────────────────── */
export const HeroDashboardIllustration: React.FC = () => {
    // Animation cycle to demonstrate speed
    const [state, setState] = useState<'loading' | 'done'>('done');

    useEffect(() => {
        const interval = setInterval(() => {
            setState('loading');
            setTimeout(() => setState('done'), 800); // 0.8s loading to cycle the "speed" message
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <IllustrationShell className="flex flex-col h-[340px] md:h-[520px]">
            {/* Header: Source & Speed */}
            <div className="h-10 md:h-14 border-b border-neutral-100 dark:border-white/5 flex items-center px-3 md:px-6 justify-between bg-neutral-50/50 dark:bg-white/5 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <SiGoogleads className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
                    <div className="flex flex-col">
                        <span className="text-[7px] md:text-[9px] uppercase tracking-wider font-bold text-red-500">Source</span>
                        <span className="text-[8px] md:text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-none">Google Ads</span>
                    </div>
                </div>

                <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full transition-colors duration-300 ${state === 'loading' ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    <Zap className={`w-2.5 h-2.5 md:w-3 md:h-3 ${state === 'loading' ? 'text-neutral-400' : 'text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400'} ${state !== 'loading' ? 'animate-pulse' : ''}`} />
                    <span className={`text-[8px] md:text-[10px] font-bold ${state === 'loading' ? 'text-neutral-500' : 'text-green-700 dark:text-green-400'}`}>
                        {state === 'loading' ? 'Génération...' : '0.4s'}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Mini Sidebar for realism */}
                <div className="w-10 md:w-14 border-r border-neutral-100 dark:border-white/5 flex flex-col items-center py-3 md:py-6 gap-2 md:gap-4 bg-neutral-50/30 dark:bg-white/5 shrink-0">
                    {[LayoutGrid, BarChart3, Clock, Palette].map((Icon, i) => (
                        <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-primary/10 text-primary' : 'text-neutral-400'}`}>
                            <Icon className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                        </div>
                    ))}
                </div>

                {/* Main Content Pane */}
                <div className="flex-1 p-3 md:p-6 flex flex-col gap-3 md:gap-6 overflow-hidden bg-white dark:bg-neutral-900">
                    <div className="flex flex-col gap-1 shrink-0">
                        {state === 'loading' ? (
                            <div className="h-4 w-32 md:h-5 md:w-48 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                                <div className="text-xs md:text-lg font-bold text-neutral-900 dark:text-white">Rapport Performance Mensuel</div>
                                <div className="text-[8px] md:text-xs text-neutral-500">Période du 1 Jan - 31 Jan 2026</div>
                            </motion.div>
                        )}
                    </div>

                    {state === 'loading' ? (
                        <div className="flex-1 flex flex-col gap-2 md:gap-4">
                            <div className="grid grid-cols-3 gap-2 md:gap-4 shrink-0">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 md:h-24 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-white/5 animate-pulse" />
                                ))}
                            </div>
                            <div className="flex-1 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-white/5 animate-pulse" />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-3 md:gap-6 min-h-0">
                            {/* Metric Grid - Now 3 Columns */}
                            <div className="grid grid-cols-3 gap-2 md:gap-4 shrink-0">
                                {[
                                    {
                                        label: 'Clics',
                                        value: '2,450',
                                        icon: TrendingUp,
                                        classes: {
                                            card: 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100',
                                            iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                        }
                                    },
                                    {
                                        label: 'Conv.',
                                        value: '142',
                                        icon: CheckCircle,
                                        classes: {
                                            card: 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100',
                                            iconBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                                        }
                                    },
                                    {
                                        label: 'ROAS',
                                        value: '4.8x',
                                        icon: Zap,
                                        classes: {
                                            card: 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100',
                                            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-500'
                                        }
                                    }
                                ].map((metric, i) => (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                        className={`p-2 md:p-4 rounded-xl border dark:border-transparent ${metric.classes.card}`}
                                    >
                                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                                            <div className={`p-1 md:p-1.5 rounded-md ${metric.classes.iconBg}`}>
                                                <metric.icon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                            </div>
                                            <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{metric.label}</span>
                                        </div>
                                        <div className="text-sm md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{metric.value}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Large Detailed Chart */}
                            <motion.div
                                className="flex-1 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-xl border border-neutral-100 dark:border-white/5 p-3 md:p-6 flex flex-col relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <div className="flex justify-between items-center mb-4 md:mb-8 shrink-0">
                                    <div className="flex gap-2 md:gap-4">
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
                                            <span className="text-[7px] md:text-[10px] font-medium text-neutral-500">Données réelles</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                            <span className="text-[7px] md:text-[10px] font-medium text-neutral-500">Moyenne secteur</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex items-end gap-1 md:gap-3 relative z-10 min-h-0">
                                    {[40, 65, 50, 85, 60, 95, 75, 90, 65, 80, 55, 70].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 md:gap-1 group h-full">
                                            <motion.div
                                                className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-[1.5px] md:rounded-t-[3px] shadow-sm"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ duration: 0.6, delay: 0.4 + (i * 0.04), type: "spring", stiffness: 100 }}
                                            />
                                            <div className="h-0.5 md:h-1 w-full bg-neutral-100 dark:bg-white/5 rounded-full" />
                                        </div>
                                    ))}
                                </div>

                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-10 pointer-events-none">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-full h-px bg-neutral-400 dark:bg-white" />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </IllustrationShell>
    );
};


/* ─────────────────────────────────────────────
   2. TEMPLATES — Animated Theme Switcher
   ───────────────────────────────────────────── */
export const TemplateIllustration: React.FC = () => {
    // Cycle through themes every 3 seconds
    const [themeIndex, setThemeIndex] = useState(0);
    const themes = [
        { name: 'Blue Corp', color: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', iconColor: 'text-blue-600' },
        { name: 'Purple Tech', color: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', iconColor: 'text-purple-600' },
        { name: 'Orange Brand', color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100', iconColor: 'text-orange-500' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setThemeIndex((prev) => (prev + 1) % themes.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const currentTheme = themes[themeIndex];

    return (
        <IllustrationShell className="bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-4 md:p-6 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <motion.div
                className="w-full max-w-[220px] md:max-w-[280px] bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-white/5"
                layout
                transition={{ duration: 0.5 }}
            >
                {/* Dynamic Header */}
                <motion.div
                    className={`h-12 md:h-16 w-full ${currentTheme.color} p-2 md:p-4 flex items-center justify-between transition-colors duration-500`}
                >
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/20">
                            <LayoutGrid className="text-white w-3 h-3 md:w-4 md:h-4" />
                        </div>
                        <div className="flex flex-col">
                            <div className="h-1.5 md:h-2 w-16 md:w-20 bg-white/30 rounded-full mb-1 md:mb-1.5" />
                            <div className="h-1 md:h-1.5 w-8 md:w-12 bg-white/20 rounded-full" />
                        </div>
                    </div>
                    <Palette className="text-white/60 w-3 h-3 md:w-4 md:h-4" />
                </motion.div>

                {/* Content Body */}
                <div className="p-2 md:p-4 flex flex-col gap-1.5 md:gap-3">
                    <div className="flex items-center justify-between">
                        <div className={`text-[8px] md:text-[10px] font-bold ${currentTheme.text} transition-colors duration-500`}>Performance Overview</div>
                        <div className={`px-2 py-0.5 rounded-full text-[6px] md:text-[8px] font-medium ${currentTheme.light} ${currentTheme.text} transition-colors duration-500`}>Jan 2026</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((i) => (
                            <div key={i} className={`h-8 md:h-16 rounded-lg border ${currentTheme.border} ${currentTheme.light} transition-colors duration-500 relative`} />
                        ))}
                    </div>

                    {/* Chart Mock */}
                    <div className="h-12 md:h-20 w-full rounded-lg bg-neutral-50 dark:bg-neutral-900/50 flex items-end gap-1 p-2">
                        {[30, 50, 40, 70, 60, 80].map((h, i) => (
                            <motion.div
                                key={i}
                                className={`flex-1 rounded-sm ${currentTheme.color} transition-colors duration-500 opacity-80`}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Tag label */}
            <div
                key={themeIndex}
                className="mt-2 md:mt-4 px-3 py-1 rounded-full bg-white dark:bg-neutral-800 shadow-sm text-[10px] font-medium text-neutral-500 flex items-center gap-2 transition-all duration-300"
            >
                <div className={`w-2 h-2 rounded-full ${currentTheme.color} transition-colors duration-500`} />
                <span className="transition-opacity duration-300">{currentTheme.name}</span>
            </div>
        </IllustrationShell>
    );
};

/* ─────────────────────────────────────────────
   3. AI INSIGHT — Typing & Pulsing
   ───────────────────────────────────────────── */
export const AIInsightIllustration: React.FC = () => {
    const [text, setText] = useState("");
    const fullText = "Revenue spiked by 24% this weekend due to the new campaign.";

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                // Pause then restart
                setTimeout(() => { currentIndex = 0; }, 3000);
            }
        }, 40); // Typing speed
        return () => clearInterval(interval);
    }, []);

    // Mock Data for the chart
    const data = [
        { day: 'Mon', value: 100 },
        { day: 'Tue', value: 120 },
        { day: 'Wed', value: 115 },
        { day: 'Thu', value: 130 },
        { day: 'Fri', value: 140 },
        { day: 'Sat', value: 180 },
        { day: 'Sun', value: 190 },
    ];

    return (
        <IllustrationShell className="flex flex-col p-3 md:p-5 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-black">
            {/* Header */}
            <div className="flex items-center gap-2 md:gap-2.5 mb-2 md:mb-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-md shadow-accent/20">
                    <Zap className="text-white fill-white w-3 h-3 md:w-4 md:h-4" />
                </div>
                <div>
                    <div className="text-[9px] md:text-[11px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        Flipika AI
                        <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                        </span>
                    </div>
                    <div className="text-[6px] md:text-[8px] text-neutral-500">Analyzing Chart Data...</div>
                </div>
            </div>

            {/* Analysis Area */}
            <div className="flex flex-col gap-3 relative w-full">
                {/* 1. The Line Chart to Analyze (Recharts) */}
                <div className="h-48 md:h-56 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-white/5 p-2 relative overflow-hidden group w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 8, fill: '#888' }}
                                interval={0}
                            />
                            <YAxis
                                hide
                                domain={['dataMin - 10', 'dataMax + 10']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ r: 2, fill: '#8b5cf6', strokeWidth: 0 }}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                isAnimationActive={true}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Scanning Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                        <motion.div
                            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-accent/10 to-transparent z-10"
                            initial={{ left: '-10%' }}
                            animate={{ left: '120%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>

                {/* 2. The Generated Narrative Layer */}
                <motion.div
                    className="flex items-start gap-1.5 md:gap-2 p-1.5 md:p-2 bg-neutral-100 dark:bg-white/5 rounded-lg border border-transparent dark:border-white/5 shrink-0"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="min-w-[12px] md:min-w-[16px] mt-0.5">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-accent/20 flex items-center justify-center">
                            <Feather className="text-accent w-2 h-2 md:w-2.5 md:h-2.5" />
                        </div>
                    </div>
                    <div className="text-[8px] md:text-[10px] font-medium text-neutral-700 dark:text-neutral-200 leading-tight font-mono min-w-0 flex-1">
                        {text}
                        <span className="inline-block w-1 md:w-1.5 h-2 md:h-3 bg-accent ml-0.5 animate-pulse align-middle" />
                    </div>
                </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 md:mt-3 flex gap-2">
                <motion.button
                    className="flex-1 py-1 md:py-1.5 rounded-md bg-white dark:bg-neutral-800 text-neutral-600 dark:text-white border border-neutral-200 dark:border-white/10 text-[8px] md:text-[10px] font-semibold shadow-sm flex items-center justify-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Modifier
                </motion.button>
                <motion.button
                    className="flex-1 py-1 md:py-1.5 rounded-md bg-black dark:bg-white text-white dark:text-black text-[8px] md:text-[10px] font-semibold shadow-sm flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Valider
                </motion.button>
            </div>
        </IllustrationShell>
    );
};

/* ─────────────────────────────────────────────
   4. SCHEDULING — Animation Flow
   ───────────────────────────────────────────── */
export const SchedulingIllustration: React.FC = () => {
    return (
        <IllustrationShell className="bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-3 md:p-6 relative overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] min-h-[300px] md:min-h-[380px]">
            {/* Background Calendar fading out */}
            <div className="absolute inset-0 opacity-10 pointer-events-none scale-110">
                <div className="grid grid-cols-7 gap-1 p-4">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-md bg-neutral-400/20" />
                    ))}
                </div>
            </div>

            {/* Central Card */}
            <motion.div
                className="w-full max-w-[200px] md:max-w-[240px] bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-white/10 p-3 md:p-4 z-10"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                {/* Status Header */}
                <div className="flex items-center justify-between mb-2 md:mb-4 pb-2 md:pb-3 border-b border-neutral-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center">
                            <Clock className="text-neutral-500 w-3 h-3 md:w-3.5 md:h-3.5" />
                        </div>
                        <div>
                            <div className="text-[8px] md:text-[10px] font-bold text-neutral-900 dark:text-neutral-100">Monthly Report</div>
                            <div className="text-[6px] md:text-[8px] text-neutral-500">Auto-send enabled</div>
                        </div>
                    </div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                {/* Progress Animation using sequenced delays */}
                <div className="flex items-start justify-between px-1 md:px-2 mb-2 relative">
                    {/* Line Backgrounds (Gray) - Positioned relative to the top circles */}
                    <div className="absolute top-[9px] md:top-[11px] left-[12%] right-[12%] h-[2px] bg-neutral-100 dark:bg-white/5 -z-10" />

                    {/* Step 1: Draft */}
                    <motion.div
                        className="flex flex-col items-center gap-1 md:gap-2 z-10 w-10 md:w-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-white flex items-center justify-center text-[8px] md:text-[10px] ring-2 md:ring-4 ring-white dark:ring-neutral-800">
                            <LayoutGrid className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </div>
                        <span className="text-[6px] md:text-[7px] font-medium text-neutral-500 text-center">Draft</span>
                    </motion.div>

                    {/* Connecting Line 1 */}
                    <div className="flex-1 h-[2px] mx-0.5 md:mx-1 relative mt-[9px] md:mt-[11px]">
                        <motion.div
                            className="absolute inset-0 bg-primary origin-left"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    {/* Step 2: Check */}
                    <div className="flex flex-col items-center gap-1 md:gap-2 z-10 w-10 md:w-12 relative">
                        {/* Gray Circle Initial */}
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-400 flex items-center justify-center text-[8px] md:text-[10px] ring-2 md:ring-4 ring-white dark:ring-neutral-800 absolute top-0 left-1/2 -translate-x-1/2">
                            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </div>
                        {/* Colored Circle Reveal */}
                        <motion.div
                            className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-white flex items-center justify-center text-[8px] md:text-[10px] ring-2 md:ring-4 ring-white dark:ring-neutral-800 relative"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 1.3, type: "spring" as const }}
                        >
                            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </motion.div>
                        <span className="text-[6px] md:text-[7px] font-medium text-neutral-500 text-center">Check</span>
                    </div>

                    {/* Connecting Line 2 */}
                    <div className="flex-1 h-[2px] mx-0.5 md:mx-1 relative mt-[9px] md:mt-[11px]">
                        <motion.div
                            className="absolute inset-0 bg-primary origin-left"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 1.8, ease: "easeInOut" }}
                        />
                    </div>

                    {/* Step 3: Send */}
                    <div className="flex flex-col items-center gap-1 md:gap-2 z-10 w-10 md:w-12 relative">
                        {/* Gray Circle Initial */}
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-400 flex items-center justify-center text-[8px] md:text-[10px] ring-2 md:ring-4 ring-white dark:ring-neutral-800 absolute top-0 left-1/2 -translate-x-1/2">
                            <Send className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </div>
                        {/* Colored Circle Reveal */}
                        <motion.div
                            className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary text-primary flex items-center justify-center text-[8px] md:text-[10px] shadow-sm ring-2 md:ring-4 ring-white dark:ring-neutral-800 relative"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 2.6, type: "spring" as const }}
                        >
                            <Send className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </motion.div>
                        <span className="text-[6px] md:text-[7px] font-bold text-primary text-center">Send</span>
                    </div>
                </div>

                {/* Date highlight */}
                <motion.div
                    className="mt-2 md:mt-3 bg-neutral-50 dark:bg-white/5 rounded-lg p-1.5 md:p-2 flex items-center justify-center gap-1.5 md:gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                >
                    <Calendar className="text-neutral-400 w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span className="text-[7px] md:text-[9px] font-medium text-neutral-600 dark:text-neutral-300">Next: <strong>Feb 1, 09:00 AM</strong></span>
                </motion.div>
            </motion.div>
        </IllustrationShell>
    );
};
