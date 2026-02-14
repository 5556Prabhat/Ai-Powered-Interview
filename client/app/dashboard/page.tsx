'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BarChart3, TrendingUp, Target, Flame, Code2, Users, DollarSign,
    MessageSquare, Trophy, ChevronRight, ChevronLeft, Plus, Search,
    Download, Calendar, Bell, Settings, LayoutDashboard, BookOpen,
    Clock, CheckCircle2, Circle, Zap, Star, ArrowUpRight, ArrowDownRight,
    Home, Brain, LogOut, User, Shield, Play,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import {
    DailyTask, generateDailyTasks, toggleTaskCompletion,
    toDateKey, getAggregateStats, getTaskHistory,
} from '@/lib/taskTracker';

/* ------------------------------------------------------------------ */
/*  Tiny SVG Sparkline                                                 */
/* ------------------------------------------------------------------ */
function Sparkline({ data, color = '#FBBF24', width = 80, height = 32 }: {
    data: number[]; color?: string; width?: number; height?: number;
}) {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Glow */}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.2"
            />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Score Gauge (speedometer style)                                    */
/* ------------------------------------------------------------------ */
function ScoreGauge({ score, maxScore = 10 }: { score: number; maxScore?: number }) {
    const percentage = (score / maxScore) * 100;
    const angle = (percentage / 100) * 180;
    const radius = 70;
    const cx = 90;
    const cy = 85;

    // Create arc path
    const startAngle = -180;
    const endAngle = startAngle + angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const arcX1 = cx + radius * Math.cos(startRad);
    const arcY1 = cy + radius * Math.sin(startRad);
    const arcX2 = cx + radius * Math.cos(endRad);
    const arcY2 = cy + radius * Math.sin(endRad);

    const bgArcX = cx + radius * Math.cos(0);
    const bgArcY = cy + radius * Math.sin(0);

    const largeArc = angle > 180 ? 1 : 0;

    return (
        <div className="relative flex flex-col items-center">
            <svg width="180" height="100" viewBox="0 0 180 100">
                {/* Background arc */}
                <path
                    d={`M ${arcX1} ${arcY1} A ${radius} ${radius} 0 1 1 ${bgArcX} ${bgArcY}`}
                    fill="none"
                    stroke="#1F1F1F"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {/* Score arc */}
                <motion.path
                    d={`M ${arcX1} ${arcY1} A ${radius} ${radius} 0 ${largeArc} 1 ${arcX2} ${arcY2}`}
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                {/* Gradient def */}
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D97706" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#FBBF24" />
                    </linearGradient>
                </defs>
                {/* Dot at end */}
                <circle cx={arcX2} cy={arcY2} r="6" fill="#FBBF24" />
                <circle cx={arcX2} cy={arcY2} r="3" fill="#0A0A0A" />
            </svg>
            <div className="absolute bottom-1 text-center">
                <span className="text-4xl font-black text-[#E5E7EB]">{score.toFixed(1)}</span>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Mini Line Chart                                                    */
/* ------------------------------------------------------------------ */
function LineChart({ data, labels }: { data: { week: number[]; past: number[] }; labels: string[] }) {
    const width = 500;
    const height = 180;
    const padding = { top: 10, right: 10, bottom: 20, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues = [...data.week, ...data.past];
    const max = Math.max(...allValues, 10);
    const min = 0;
    const range = max - min || 1;

    const toX = (i: number, len: number) => padding.left + (i / (len - 1)) * chartW;
    const toY = (v: number) => padding.top + chartH - ((v - min) / range) * chartH;

    const makePath = (values: number[]) =>
        values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i, values.length)} ${toY(v)}`).join(' ');

    const yTicks = [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Grid lines */}
            {yTicks.map((tick) => (
                <g key={tick}>
                    <line x1={padding.left} y1={toY(tick)} x2={width - padding.right} y2={toY(tick)} stroke="#1F1F1F" strokeDasharray="4 4" />
                    <text x={padding.left - 8} y={toY(tick) + 4} fill="#6B7280" fontSize="10" textAnchor="end">{tick}</text>
                </g>
            ))}
            {/* X labels */}
            {labels.map((label, i) => (
                <text key={label} x={toX(i, labels.length)} y={height - 2} fill="#6B7280" fontSize="10" textAnchor="middle">{label}</text>
            ))}
            {/* Past line */}
            <path d={makePath(data.past)} fill="none" stroke="#6B7280" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
            {/* Current line */}
            <path d={makePath(data.week)} fill="none" stroke="#FBBF24" strokeWidth="2.5" />
            {/* Area under current */}
            <path
                d={`${makePath(data.week)} L ${toX(data.week.length - 1, data.week.length)} ${toY(0)} L ${toX(0, data.week.length)} ${toY(0)} Z`}
                fill="url(#areaGradient)"
                opacity="0.15"
            />
            <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Dots on current */}
            {data.week.map((v, i) => (
                <circle key={i} cx={toX(i, data.week.length)} cy={toY(v)} r="3" fill="#FBBF24" />
            ))}
            {/* Tooltip on last point */}
            {data.week.length > 0 && (() => {
                const lastIdx = data.week.length - 1;
                const lastVal = data.week[lastIdx];
                const lx = toX(lastIdx, data.week.length);
                const ly = toY(lastVal);
                return (
                    <g>
                        <rect x={lx - 30} y={ly - 28} width="60" height="22" rx="6" fill="#141414" stroke="#FBBF24" strokeWidth="1" />
                        <text x={lx} y={ly - 13} fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">
                            Score {lastVal}
                        </text>
                    </g>
                );
            })()}
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Slim Sidebar (icon-only, matching the reference image)             */
/* ------------------------------------------------------------------ */
function SlimSidebar() {
    const { user, logout } = useAuthStore();

    const navIcons = [
        { icon: LayoutDashboard, href: '/dashboard', active: true, label: 'Dashboard' },
        { icon: Code2, href: '/interview', active: false, label: 'Practice' },
        { icon: Shield, href: '/mock-interview', active: false, label: 'Mock Interview' },
        { icon: Brain, href: '/chat', active: false, label: 'AI Chat' },
        { icon: BarChart3, href: '/analytics', active: false, label: 'Analytics' },
        { icon: Settings, href: '/settings', active: false, label: 'Settings' },
    ];

    return (
        <aside className="fixed top-0 left-0 h-screen w-[72px] bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col items-center py-6 z-50">
            {/* Logo */}
            <Link href="/" className="mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center shadow-neon">
                    <Zap className="w-5 h-5 text-black" />
                </div>
            </Link>

            {/* Nav icons */}
            <nav className="flex-1 flex flex-col items-center gap-2">
                {navIcons.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group
                            ${item.active
                                ? 'bg-[#FBBF24]/15 text-accent'
                                : 'text-[#6B7280] hover:text-accent hover:bg-[#141414]'
                            }`}
                        title={item.label}
                    >
                        {item.active && (
                            <motion.div
                                layoutId="slimActive"
                                className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#FBBF24] rounded-r-full"
                            />
                        )}
                        <item.icon className="w-5 h-5" />
                    </Link>
                ))}
            </nav>

            {/* Bottom - user avatar */}
            <div className="mt-auto flex flex-col items-center gap-3">
                <button onClick={logout} className="text-[#6B7280] hover:text-red-400 transition-colors" title="Logout">
                    <LogOut className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center text-black font-bold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
            </div>
        </aside>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Page                                                */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
    const { user, loadUser, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const router = useRouter();

    // Calendar state
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [scheduleTab, setScheduleTab] = useState<'Today' | 'Week' | 'All'>('Today');
    const [searchQuery, setSearchQuery] = useState('');

    // Daily tasks state
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
    const [taskStats, setTaskStats] = useState<ReturnType<typeof getAggregateStats> | null>(null);

    useEffect(() => {
        loadUser().then(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/auth/login');
    }, [loading, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            api.get('/submissions/analytics').then(({ data }) => setAnalytics(data)).catch(() => { });
            // Load daily tasks
            const todayKey = toDateKey(new Date());
            setDailyTasks(generateDailyTasks(todayKey));
            setTaskStats(getAggregateStats(30));
        }
    }, [isAuthenticated]);

    const handleToggleTask = (taskId: string) => {
        const todayKey = toDateKey(new Date());
        const newDone = toggleTaskCompletion(todayKey, taskId);
        setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: newDone } : t));
        // Refresh stats
        setTimeout(() => setTaskStats(getAggregateStats(30)), 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-8 h-8 border-2 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin" />
            </div>
        );
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    /* ----- Real data from task tracker ----- */
    const completedToday = dailyTasks.filter(t => t.done).length;
    const totalToday = dailyTasks.length;
    const tasksCompleted = taskStats?.totalCompleted || 0;
    const streak = taskStats?.streak || 0;
    const completionRate = taskStats?.completionRate || 0;

    // Build sparkline from past 8 days of task completions
    const recentHistory = getTaskHistory(8);
    const sparkTasks = recentHistory.map(d => d.completed);
    const sparkRate = recentHistory.map(d => d.total > 0 ? (d.completed / d.total) * 100 : 0);

    // Chart data: past 7 days completions vs previous 7 days
    const weekHistory = getTaskHistory(14);
    const chartData = {
        week: weekHistory.slice(7).map(d => d.completed),
        past: weekHistory.slice(0, 7).map(d => d.completed),
    };
    const chartLabels = weekHistory.slice(7).map(d => {
        const md = new Date(d.date + 'T12:00:00');
        return md.toLocaleDateString('en-US', { weekday: 'short' });
    });

    /* Category progress from completed tasks */
    const categoryColors: Record<string, string> = {
        'DSA': '#FBBF24', 'System Design': '#F59E0B', 'Behavioral': '#22c55e',
        'CS Fundamentals': '#D97706', 'Coding Practice': '#a855f7', 'Mock Interview': '#ef4444',
    };
    const statusTracker = Object.entries(taskStats?.categoryTotals || {}).map(([name, count]) => {
        const maxPossible = Math.max(tasksCompleted, 1);
        return { name, tag: name, pct: Math.min(Math.round((count / maxPossible) * 100), 100), color: categoryColors[name] || '#FBBF24' };
    }).sort((a, b) => b.pct - a.pct).slice(0, 4);

    /* Recent completed tasks for review section */
    const past7History = getTaskHistory(7);
    const statusReview = past7History.slice().reverse().flatMap(day => {
        const tasks = generateDailyTasks(day.date);
        return tasks.filter(t => t.done).map(t => {
            const daysAgo = Math.round((Date.now() - new Date(day.date + 'T12:00:00').getTime()) / 86400000);
            const dateLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
            return { name: t.text.slice(0, 30) + (t.text.length > 30 ? '...' : ''), status: 'Done', date: dateLabel, pct: 100, category: t.category };
        });
    }).slice(0, 4);

    /* Calendar helpers */
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const calDays: (number | null)[] = [
        ...Array.from({ length: firstDay }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    /* Schedule data keyed by date string (YYYY-MM-DD) */
    const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayKey = toKey(today);
    const selKey = toKey(selectedDate);

    /* Generate schedule from daily tasks — incomplete tasks only for today */
    const timeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '4:00 PM'];
    const categoryToType: Record<string, string> = {
        'DSA': 'Practice', 'System Design': 'Study', 'Behavioral': 'AI Session',
        'CS Fundamentals': 'Study', 'Coding Practice': 'Practice', 'Mock Interview': 'AI Session',
    };

    const buildScheduleForDate = (dateKey: string) => {
        const tasks = generateDailyTasks(dateKey);
        const isTodayDate = dateKey === todayKey;
        // For today, only show incomplete tasks; for past days, show completed tasks
        const filteredTasks = isTodayDate ? tasks.filter(t => !t.done) : tasks.filter(t => t.done);
        return filteredTasks.map((t, i) => ({
            date: dateKey,
            time: timeSlots[i % timeSlots.length],
            title: t.text,
            type: categoryToType[t.category] || 'Practice',
            href: t.href,
        }));
    };

    const allSchedule: { date: string; time: string; title: string; type: string; href: string }[] = [];
    // Build schedule for past 7 days
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        allSchedule.push(...buildScheduleForDate(toKey(d)));
    }

    /* Filter schedule based on active tab */
    const getFilteredSchedule = () => {
        if (scheduleTab === 'Today') {
            return allSchedule.filter(s => s.date === selKey);
        }
        if (scheduleTab === 'Week') {
            const weekStart = new Date(selectedDate);
            weekStart.setDate(weekStart.getDate() - 6);
            const weekStartKey = toKey(weekStart);
            return allSchedule.filter(s => s.date >= weekStartKey && s.date <= selKey);
        }
        return allSchedule; // 'All'
    };
    const filteredSchedule = getFilteredSchedule().filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
    });

    /* Get dates that have schedule entries (for calendar dot indicators) */
    const scheduleDates = new Set(allSchedule.map(s => s.date));

    return (
        <div className="min-h-screen flex bg-[#0A0A0A]">
            {/* Slim icon sidebar */}
            <SlimSidebar />

            {/* Main + Right sidebar */}
            <div className="flex-1 ml-[72px] flex">
                {/* Main content */}
                <main className="flex-1 min-w-0 overflow-y-auto h-screen relative">
                    {/* ✨ Golden Aurora effect (top) */}
                    <div className="absolute top-0 left-0 right-0 h-[320px] overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]" style={{
                            background: 'radial-gradient(ellipse at center top, rgba(251,191,36,0.25) 0%, rgba(217,119,6,0.12) 30%, rgba(180,83,9,0.05) 55%, transparent 75%)',
                        }} />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[250px]" style={{
                            background: 'linear-gradient(180deg, rgba(251,191,36,0.5) 0%, rgba(251,191,36,0.1) 40%, transparent 70%)',
                            filter: 'blur(2px)',
                        }} />
                        {/* Light rays */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[200px] bg-gradient-to-b from-[#FBBF24]/60 to-transparent" />
                        <div className="absolute top-0 left-[calc(50%-80px)] w-[1px] h-[160px] bg-gradient-to-b from-[#FBBF24]/30 to-transparent rotate-[15deg] origin-top" />
                        <div className="absolute top-0 left-[calc(50%+80px)] w-[1px] h-[160px] bg-gradient-to-b from-[#FBBF24]/30 to-transparent -rotate-[15deg] origin-top" />
                        <div className="absolute top-0 left-[calc(50%-160px)] w-[1px] h-[120px] bg-gradient-to-b from-[#FBBF24]/15 to-transparent rotate-[30deg] origin-top" />
                        <div className="absolute top-0 left-[calc(50%+160px)] w-[1px] h-[120px] bg-gradient-to-b from-[#FBBF24]/15 to-transparent -rotate-[30deg] origin-top" />
                    </div>

                    <div className="relative z-10 p-6 space-y-6">
                        {/* Header row */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-lg font-bold text-[#E5E7EB] flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-accent" />
                                Dashboard
                            </h1>
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-[#6B7280] hover:text-accent cursor-pointer transition-colors" />
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center text-black font-bold text-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm text-[#E5E7EB] font-medium">{user?.name || 'Developer'}</span>
                            </div>
                        </div>

                        {/* Welcome banner */}
                        <div className="text-center pt-2 pb-4">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold text-[#E5E7EB]"
                            >
                                Welcome buddy!
                            </motion.h2>
                            <p className="text-sm text-[#6B7280] mt-1">Today is {dateStr}</p>
                        </div>

                        {/* Search + actions */}
                        <div className="flex items-center gap-3 justify-end -mt-2">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#141414] border border-[#1F1F1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#FBBF24] outline-none transition-all"
                                />
                            </div>
                            <button className="p-2 rounded-lg bg-[#141414] border border-[#1F1F1F] text-[#6B7280] hover:text-accent hover:border-[#FBBF24]/30 transition-all">
                                <Download className="w-4 h-4" />
                            </button>
                            <Link href="/interview" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] border border-[#1F1F1F] text-sm text-[#9CA3AF] hover:text-accent hover:border-[#FBBF24]/30 transition-all">
                                <Calendar className="w-4 h-4" />
                                Schedule
                            </Link>
                            <Link href="/interview" className="p-2 rounded-lg bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black hover:shadow-gold-glow transition-all">
                                <Plus className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* === Stat Cards Row === */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Tasks Completed */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F] hover:border-[#FBBF24]/20 transition-all group"
                            >
                                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Tasks Completed</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h3 className="text-3xl font-black text-[#E5E7EB]">{tasksCompleted}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            {completedToday > 0 ? <ArrowUpRight className="w-3 h-3 text-green-400" /> : <span className="w-3 h-3" />}
                                            <span className="text-xs text-green-400 font-medium">+{completedToday} today</span>
                                        </div>
                                    </div>
                                    <Sparkline data={sparkTasks.length > 1 ? sparkTasks : [0, 0]} color="#FBBF24" />
                                </div>
                            </motion.div>

                            {/* Streak */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F] hover:border-[#FBBF24]/20 transition-all"
                            >
                                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Current Streak</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h3 className="text-3xl font-black text-[#E5E7EB]">{streak} <span className="text-lg text-[#6B7280]">days</span></h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Flame className="w-3 h-3 text-orange-400" />
                                            <span className="text-xs text-orange-400 font-medium">{streak > 0 ? 'Keep it up!' : 'Start today!'}</span>
                                        </div>
                                    </div>
                                    <Sparkline data={sparkTasks.length > 1 ? sparkTasks : [0, 0]} color="#F59E0B" />
                                </div>
                            </motion.div>

                            {/* Completion Rate */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F] hover:border-[#FBBF24]/20 transition-all"
                            >
                                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Completion Rate</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h3 className="text-3xl font-black text-[#E5E7EB]">{Math.round(completionRate)}%</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Target className="w-3 h-3 text-accent" />
                                            <span className="text-xs text-[#9CA3AF] font-medium">30-day avg</span>
                                        </div>
                                    </div>
                                    <Sparkline data={sparkRate.length > 1 ? sparkRate : [0, 0]} color="#D97706" />
                                </div>
                            </motion.div>
                        </div>

                        {/* === Chart + Gauge Row === */}
                        <div className="grid grid-cols-5 gap-4">
                            {/* Line Chart — 3 cols */}
                            <div className="col-span-3 bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-[#E5E7EB]">Performance Overview</h3>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                                            <span className="text-[#9CA3AF]">This period</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#6B7280]" />
                                            <span className="text-[#9CA3AF]">Past period</span>
                                        </span>
                                    </div>
                                </div>
                                <LineChart data={chartData} labels={chartLabels} />
                            </div>

                            {/* Score Gauge — 2 cols */}
                            <div className="col-span-2 bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F] flex flex-col items-center justify-center">
                                <h3 className="text-sm font-bold text-[#E5E7EB] uppercase tracking-wider mb-4">Performance</h3>
                                <ScoreGauge score={completionRate / 10} />
                                <div className="flex items-center gap-6 mt-4 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                                        <span className="text-[#9CA3AF]">Completion</span>
                                        <span className="text-[#E5E7EB] font-bold ml-1">{Math.round(completionRate)}%</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-[#6B7280]" />
                                        <span className="text-[#9CA3AF]">Consistency</span>
                                        <span className="text-[#E5E7EB] font-bold ml-1">{taskStats ? Math.round((taskStats.activeDays / 30) * 100) : 0}%</span>
                                    </div>
                                </div>
                                <button className="mt-3 text-xs text-accent hover:text-[#F59E0B] transition-colors flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Task Performance
                                </button>
                            </div>
                        </div>

                        {/* === Bottom Row: Status Tracker + Status Review + Today's Tasks === */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Topic Tracker */}
                            <div className="bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F]">
                                <h3 className="text-sm font-bold text-[#E5E7EB] mb-4">Topic Progress</h3>
                                <div className="space-y-4">
                                    {statusTracker.map((item) => (
                                        <div key={item.name} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FBBF24]/20 to-[#D97706]/10 flex items-center justify-center flex-shrink-0">
                                                <Code2 className="w-3.5 h-3.5 text-accent" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-[#E5E7EB] font-medium truncate">{item.name}</span>
                                                    <span className="text-xs text-accent font-bold ml-2">{item.pct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.pct}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-[#6B7280] mt-0.5">{item.tag}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Submissions */}
                            <div className="bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F]">
                                <h3 className="text-sm font-bold text-[#E5E7EB] mb-4">Recent Submissions</h3>
                                <div className="space-y-4">
                                    {statusReview.map((item) => (
                                        <div key={item.name} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#141414] flex items-center justify-center flex-shrink-0 border border-[#1F1F1F]">
                                                <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-[#E5E7EB] font-medium truncate">{item.name}</span>
                                                    <span className="text-xs text-[#6B7280]">{item.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.status === 'Solved' ? 'bg-green-500/10 text-green-400' : 'bg-[#FBBF24]/10 text-accent'}`}>
                                                        {item.status}
                                                    </span>
                                                    <div className="flex-1 h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-[#FBBF24] to-[#D97706] rounded-full" style={{ width: `${item.pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-[#9CA3AF]">{item.pct}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Today's Tasks */}
                            <div className="bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-[#E5E7EB] flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-accent" />
                                        Today&apos;s Tasks
                                    </h3>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBBF24]/10 text-accent font-semibold">
                                        {completedToday}/{totalToday}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {dailyTasks.map((task) => (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-start gap-3 group cursor-pointer rounded-lg p-2 hover:bg-[#0A0A0A] transition-colors"
                                                onClick={() => handleToggleTask(task.id)}
                                            >
                                                <motion.div
                                                    whileTap={{ scale: 0.85 }}
                                                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all
                                                        ${task.done
                                                            ? 'bg-[#FBBF24] border-[#FBBF24] text-black'
                                                            : 'border-[#374151] group-hover:border-[#FBBF24]'
                                                        }`}
                                                >
                                                    {task.done && <CheckCircle2 className="w-3 h-3" />}
                                                </motion.div>
                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-sm leading-tight block ${task.done ? 'text-[#6B7280] line-through' : 'text-[#E5E7EB]'}`}>
                                                        {task.text}
                                                    </span>
                                                    <span className={`text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded-full
                                                        ${task.done ? 'bg-[#1F1F1F] text-[#4B5563]' : 'bg-[#FBBF24]/5 text-[#9CA3AF]'}`}>
                                                        {task.category}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#6B7280]">{completedToday} of {totalToday} completed</span>
                                        <span className="text-accent font-bold">{totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden mt-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-[#FBBF24] to-[#D97706] rounded-full"
                                        />
                                    </div>
                                    {completedToday === totalToday && totalToday > 0 && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-[10px] text-green-400 mt-2 text-center font-medium"
                                        >
                                            🎉 All tasks completed! Great job!
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* ============ RIGHT SIDEBAR ============ */}
                <aside className="w-[300px] h-screen overflow-y-auto border-l border-[#1F1F1F] bg-[#0A0A0A] flex-shrink-0 p-5 space-y-6">
                    {/* Meeting / Practice Schedule */}
                    <div>
                        <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold mb-3">Practice Schedule</h3>

                        {/* Mini calendar */}
                        <div className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F]">
                            <div className="flex items-center justify-between mb-3">
                                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                                    className="text-[#6B7280] hover:text-accent transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-semibold text-[#E5E7EB]">{monthNames[calMonth]} {calYear}</span>
                                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                                    className="text-[#6B7280] hover:text-accent transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                                {dayNames.map(d => (
                                    <span key={d} className="text-[#6B7280] font-medium py-1">{d}</span>
                                ))}
                                {calDays.map((day, i) => {
                                    if (!day) return <span key={i} />;
                                    const thisDate = new Date(calYear, calMonth, day);
                                    const thisKey = toKey(thisDate);
                                    const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                                    const isSelected = day === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear();
                                    const hasEntries = scheduleDates.has(thisKey);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => { setSelectedDate(thisDate); setScheduleTab('Today'); }}
                                            className={`py-1 rounded-md text-xs transition-all cursor-pointer relative
                                                ${isSelected
                                                    ? 'bg-[#FBBF24] text-black font-bold'
                                                    : isToday
                                                        ? 'ring-1 ring-[#FBBF24] text-accent font-semibold'
                                                        : 'text-[#9CA3AF] hover:bg-[#141414]'
                                                }`}
                                        >
                                            {day}
                                            {hasEntries && !isSelected && (
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FBBF24]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected date label */}
                        <p className="text-[10px] text-[#6B7280] mt-2 text-center">
                            Viewing: <span className="text-accent font-medium">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {toKey(selectedDate) === todayKey && ' (Today)'}
                            </span>
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search sessions..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111111] border border-[#1F1F1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#FBBF24] outline-none transition-all"
                        />
                    </div>

                    {/* Tab: Today / Week / All */}
                    <div className="flex items-center gap-1 bg-[#111111] rounded-lg p-1 border border-[#1F1F1F]">
                        {(['Today', 'Week', 'All'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setScheduleTab(tab)}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all
                                    ${scheduleTab === tab
                                        ? 'bg-[#FBBF24]/15 text-accent'
                                        : 'text-[#6B7280] hover:text-[#9CA3AF]'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Schedule entries */}
                    <div className="space-y-3">
                        {filteredSchedule.length > 0 ? filteredSchedule.map((m, i) => {
                            const isEntryToday = m.date === todayKey;
                            const entryDate = new Date(m.date + 'T12:00:00');
                            const dateLabel = isEntryToday ? 'Today' : entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const actionLabel = m.type === 'Practice' ? 'Start Practice' : m.type === 'AI Session' ? 'Join Session' : 'Start Review';
                            const actionIcon = m.type === 'Practice' ? Code2 : m.type === 'AI Session' ? Brain : BookOpen;
                            const ActionIcon = actionIcon;
                            return (
                                <motion.div
                                    key={`${m.date}-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="bg-[#111111] rounded-xl p-3.5 border border-[#1F1F1F] hover:border-[#FBBF24]/20 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                                                ${m.type === 'Practice' ? 'bg-[#FBBF24]/10' : m.type === 'AI Session' ? 'bg-purple-500/10' : 'bg-blue-500/10'}`}>
                                                <ActionIcon className={`w-4 h-4
                                                    ${m.type === 'Practice' ? 'text-accent' : m.type === 'AI Session' ? 'text-purple-400' : 'text-blue-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-accent font-medium mb-0.5">{m.time}</p>
                                                <p className="text-sm font-semibold text-[#E5E7EB]">{m.title}</p>
                                                <p className="text-[10px] text-[#6B7280] mt-0.5">{m.type}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isEntryToday ? 'bg-[#FBBF24]/10 text-accent' : 'bg-[#141414] text-[#6B7280]'}`}>
                                            {dateLabel}
                                        </span>
                                    </div>
                                    <Link
                                        href={m.href}
                                        className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] text-[10px] font-semibold text-[#9CA3AF] hover:text-accent hover:border-[#FBBF24]/30 transition-all group-hover:border-[#FBBF24]/20"
                                    >
                                        <Play className="w-3 h-3" />
                                        {actionLabel}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </motion.div>
                            );
                        }) : (
                            <div className="text-center py-6">
                                <Calendar className="w-8 h-8 mx-auto text-[#374151] mb-2" />
                                <p className="text-xs text-[#6B7280]">No sessions on this {scheduleTab === 'Today' ? 'date' : 'period'}</p>
                                <p className="text-[10px] text-[#374151] mt-1">Select another date or switch tabs</p>
                            </div>
                        )}
                    </div>

                    {/* Right sidebar — remaining tasks as practice goals */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold">Practice Goals</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FBBF24]/10 text-accent font-bold">
                                {dailyTasks.filter(t => !t.done).length} left
                            </span>
                        </div>
                        <div className="space-y-2.5">
                            {dailyTasks.filter(t => !t.done).length > 0 ? (
                                dailyTasks.filter(t => !t.done).map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        className="bg-[#111111] rounded-lg p-3 border border-[#1F1F1F] text-sm cursor-pointer hover:border-[#FBBF24]/20 transition-all"
                                        onClick={() => handleToggleTask(task.id)}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="w-3.5 h-3.5 mt-0.5 rounded border border-[#374151] flex-shrink-0 hover:border-[#FBBF24] transition-colors" />
                                            <div>
                                                <p className="text-[#E5E7EB] text-xs">{task.text}</p>
                                                <p className="text-[10px] text-[#6B7280] mt-0.5">📅 Due Today • {task.category}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <Trophy className="w-6 h-6 text-accent mx-auto mb-1" />
                                    <p className="text-[10px] text-green-400 font-medium">All done for today! 🎉</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 flex items-center gap-1 text-[10px] text-[#6B7280]">
                            <span>⚡</span>
                            <span>{streak}-day streak</span>
                            <span className="ml-1">•</span>
                            <span className="ml-1">{dailyTasks.filter(t => !t.done).length} goal{dailyTasks.filter(t => !t.done).length !== 1 ? 's' : ''} left</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
