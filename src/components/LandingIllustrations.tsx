import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    MousePointerClick,
    TrendingUp,
    Target,
    Palette,
    Calendar,
    Clock,
    CheckCircle,
    Send,
    ArrowUpRight,
    LayoutGrid,
    Zap,
    Feather
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

/* ─────────────────────────────────────────────
   Shared — Animation Variants
   ───────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    }
};

/* ─────────────────────────────────────────────
   Shared wrapper
   ───────────────────────────────────────────── */
const IllustrationShell: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
    <div
        className={`w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 dark:border-white/10 shadow-xl select-none pointer-events-none bg-white dark:bg-neutral-950 relative ${className}`}
        aria-hidden="true"
    >
        {children}
    </div>
);

/* ─────────────────────────────────────────────
   1. HERO — Animated Dashboard with Growth
   ───────────────────────────────────────────── */
export const HeroDashboardIllustration: React.FC = () => {
    return (
        <IllustrationShell className="flex flex-col">
            {/* Top Bar with Avatar */}
            <div className="h-10 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between px-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm z-10">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                {/* User Avatar */}
                <div className="flex items-center gap-2">
                    <div className="text-[9px] font-medium text-neutral-400 hidden sm:block">Mathis • Admin</div>
                    <img
                        src="https://randomuser.me/api/portraits/men/46.jpg"
                        alt="User"
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-black"
                    />
                </div>
            </div>

            <motion.div
                className="flex-1 p-4 flex flex-col gap-4 bg-neutral-50/50 dark:bg-neutral-900/20"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20%" }}
            >
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 p-3 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MousePointerClick size={40} className="text-primary" />
                        </div>
                        <div className="text-[10px] text-neutral-500 font-medium mb-1">Clicks</div>
                        <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">12.4k</div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 w-fit px-1.5 py-0.5 rounded-full mt-2">
                            <TrendingUp size={10} />
                            <span>+18%</span>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 p-3 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target size={40} className="text-accent" />
                        </div>
                        <div className="text-[10px] text-neutral-500 font-medium mb-1">Conv. Rate</div>
                        <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">3.2%</div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 w-fit px-1.5 py-0.5 rounded-full mt-2">
                            <ArrowUpRight size={10} />
                            <span>+0.4%</span>
                        </div>
                    </motion.div>
                </div>

                {/* Animated Chart Area */}
                <motion.div variants={itemVariants} className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/5 p-4 flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BarChart3 size={16} className="text-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">Revenue Growth</div>
                                <div className="text-[8px] text-neutral-400">Last 30 days</div>
                            </div>
                        </div>
                    </div>

                    {/* Living Chart */}
                    <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-1">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <motion.div
                                key={i}
                                className="w-full bg-primary dark:bg-primary rounded-t-sm md:rounded-t-md relative group"
                                initial={{ height: "10%" }}
                                whileInView={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.1, type: "spring" as const }}
                                viewport={{ once: true }}
                            >
                                {/* Hover tooltip hint */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}k
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
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
        <IllustrationShell className="bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-6">
            <motion.div
                className="w-full max-w-[280px] bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-white/5"
                layout
                transition={{ duration: 0.5 }}
            >
                {/* Dynamic Header */}
                <motion.div
                    className={`h-16 w-full ${currentTheme.color} p-4 flex items-center justify-between transition-colors duration-500`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/20">
                            <LayoutGrid size={16} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <div className="h-2 w-20 bg-white/30 rounded-full mb-1.5" />
                            <div className="h-1.5 w-12 bg-white/20 rounded-full" />
                        </div>
                    </div>
                    <Palette size={16} className="text-white/60" />
                </motion.div>

                {/* Content Body */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className={`text-[10px] font-bold ${currentTheme.text} transition-colors duration-500`}>Performance Overview</div>
                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${currentTheme.light} ${currentTheme.text} transition-colors duration-500`}>Jan 2026</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((i) => (
                            <div key={i} className={`h-16 rounded-lg border ${currentTheme.border} ${currentTheme.light} transition-colors duration-500 relative`} />
                        ))}
                    </div>

                    {/* Chart Mock */}
                    <div className="h-20 w-full rounded-lg bg-neutral-50 dark:bg-neutral-900/50 flex items-end gap-1 p-2">
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
            <motion.div
                key={themeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 px-3 py-1 rounded-full bg-white dark:bg-neutral-800 shadow-sm text-[10px] font-medium text-neutral-500 flex items-center gap-2"
            >
                <div className={`w-2 h-2 rounded-full ${currentTheme.color}`} />
                <span>{currentTheme.name}</span>
            </motion.div>
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
        <IllustrationShell className="flex flex-col p-5 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-black">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-md shadow-accent/20">
                    <Zap size={16} className="text-white fill-white" />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        Flipika AI
                        <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                        </span>
                    </div>
                    <div className="text-[8px] text-neutral-500">Analyzing Chart Data...</div>
                </div>
            </div>

            {/* Analysis Area */}
            <div className="flex-1 flex flex-col gap-3 relative min-h-0">
                {/* 1. The Line Chart to Analyze (Recharts) */}
                <div className="flex-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-white/5 p-2 relative overflow-hidden group min-h-[100px]">
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
                    className="flex items-start gap-2 p-2 bg-neutral-100 dark:bg-white/5 rounded-lg border border-transparent dark:border-white/5 shrink-0"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="min-w-[16px] mt-0.5">
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                            <Feather size={10} className="text-accent" />
                        </div>
                    </div>
                    <div className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200 leading-tight font-mono">
                        {text}
                        <span className="inline-block w-1.5 h-3 bg-accent ml-0.5 animate-pulse align-middle" />
                    </div>
                </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
                <motion.button
                    className="flex-1 py-1.5 rounded-md bg-white dark:bg-neutral-800 text-neutral-600 dark:text-white border border-neutral-200 dark:border-white/10 text-[10px] font-semibold shadow-sm flex items-center justify-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Modifier
                </motion.button>
                <motion.button
                    className="flex-1 py-1.5 rounded-md bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold shadow-sm flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
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
        <IllustrationShell className="bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-6 relative overflow-hidden">
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
                className="w-full max-w-[240px] bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-white/10 p-4 z-10"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                {/* Status Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center">
                            <Clock size={14} className="text-neutral-500" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100">Monthly Report</div>
                            <div className="text-[8px] text-neutral-500">Auto-send enabled</div>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                {/* Progress Animation using sequenced delays */}
                <div className="flex items-start justify-between px-2 mb-2 relative">
                    {/* Line Backgrounds (Gray) - Positioned relative to the top circles */}
                    <div className="absolute top-[11px] left-[12%] right-[12%] h-[2px] bg-neutral-100 dark:bg-white/5 -z-10" />

                    {/* Step 1: Draft */}
                    <motion.div
                        className="flex flex-col items-center gap-2 z-10 w-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-neutral-800">
                            <LayoutGrid size={12} />
                        </div>
                        <span className="text-[7px] font-medium text-neutral-500 text-center">Draft</span>
                    </motion.div>

                    {/* Connecting Line 1 */}
                    <div className="flex-1 h-[2px] mx-1 relative mt-[11px]">
                        <motion.div
                            className="absolute inset-0 bg-primary origin-left"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    {/* Step 2: Check */}
                    <div className="flex flex-col items-center gap-2 z-10 w-12 relative">
                        {/* Gray Circle Initial */}
                        <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-400 flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-neutral-800 absolute top-0 left-1/2 -translate-x-1/2">
                            <CheckCircle size={12} />
                        </div>
                        {/* Colored Circle Reveal */}
                        <motion.div
                            className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-neutral-800 relative"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 1.3, type: "spring" as const }}
                        >
                            <CheckCircle size={12} />
                        </motion.div>
                        <span className="text-[7px] font-medium text-neutral-500 text-center">Check</span>
                    </div>

                    {/* Connecting Line 2 */}
                    <div className="flex-1 h-[2px] mx-1 relative mt-[11px]">
                        <motion.div
                            className="absolute inset-0 bg-primary origin-left"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 1.8, ease: "easeInOut" }}
                        />
                    </div>

                    {/* Step 3: Send */}
                    <div className="flex flex-col items-center gap-2 z-10 w-12 relative">
                        {/* Gray Circle Initial */}
                        <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-400 flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-neutral-800 absolute top-0 left-1/2 -translate-x-1/2">
                            <Send size={12} />
                        </div>
                        {/* Colored Circle Reveal */}
                        <motion.div
                            className="w-6 h-6 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center text-[10px] shadow-sm ring-4 ring-white dark:ring-neutral-800 relative"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 2.6, type: "spring" as const }}
                        >
                            <Send size={12} />
                        </motion.div>
                        <span className="text-[7px] font-bold text-primary text-center">Send</span>
                    </div>
                </div>

                {/* Date highlight */}
                <motion.div
                    className="mt-3 bg-neutral-50 dark:bg-white/5 rounded-lg p-2 flex items-center justify-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                >
                    <Calendar size={12} className="text-neutral-400" />
                    <span className="text-[9px] font-medium text-neutral-600 dark:text-neutral-300">Next: <strong>Feb 1, 09:00 AM</strong></span>
                </motion.div>
            </motion.div>
        </IllustrationShell>
    );
};
