'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BarChart3, TrendingUp, Target, Code2, Trophy, Flame,
    ArrowUpRight, ArrowDownRight, ChevronRight, Zap, Shield,
    CheckCircle2, Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import {
    getAggregateStats, getTaskHistory, getStreakCount,
    generateDailyTasks, toDateKey, DailyTask,
} from '@/lib/taskTracker';

/* Sparkline */
function Sparkline({ data, color = '#FBBF24', width = 100, height = 40 }: {
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
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
        </svg>
    );
}

/* Bar chart */
function BarChartSimple({ data, labels, color = '#FBBF24' }: {
    data: number[]; labels: string[]; color?: string;
}) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-2 h-32">
            {data.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-[#9CA3AF] font-bold">{v}</span>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(v / max) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="w-full rounded-t-md"
                        style={{ background: `linear-gradient(180deg, ${color}, ${color}44)` }}
                    />
                    <span className="text-[10px] text-[#6B7280]">{labels[i]}</span>
                </div>
            ))}
        </div>
    );
}

/* Donut Chart for Category Breakdown */
function DonutChart({ data, colors, size = 120 }: {
    data: { label: string; value: number }[];
    colors: string[];
    size?: number;
}) {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {total === 0 ? (
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1F1F1F" strokeWidth="12" />
                ) : (
                    data.map((d, i) => {
                        const pct = d.value / total;
                        const dash = pct * circumference;
                        const gap = circumference - dash;
                        const el = (
                            <motion.circle
                                key={d.label}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={colors[i % colors.length]}
                                strokeWidth="12"
                                strokeDasharray={`${dash} ${gap}`}
                                strokeDashoffset={-offset}
                                strokeLinecap="round"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                            />
                        );
                        offset += dash;
                        return el;
                    })
                )}
            </svg>
            <div className="absolute text-center">
                <p className="text-xl font-black text-[#E5E7EB]">{total}</p>
                <p className="text-[10px] text-[#6B7280]">Total</p>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { user, loadUser, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [mockResults, setMockResults] = useState<any[]>([]);
    const router = useRouter();

    // Task analytics
    const [taskStats, setTaskStats] = useState<ReturnType<typeof getAggregateStats> | null>(null);
    const [history14, setHistory14] = useState<ReturnType<typeof getTaskHistory>>([]);
    const [history30, setHistory30] = useState<ReturnType<typeof getTaskHistory>>([]);

    useEffect(() => { loadUser().then(() => setLoading(false)); }, []);
    useEffect(() => { if (!loading && !isAuthenticated) router.push('/auth/login'); }, [loading, isAuthenticated]);
    useEffect(() => {
        if (isAuthenticated) {
            // Load task analytics
            setTaskStats(getAggregateStats(30));
            setHistory14(getTaskHistory(14));
            setHistory30(getTaskHistory(30));
            // Load mock interview results from localStorage
            try {
                const saved = JSON.parse(localStorage.getItem('mockInterviewResults') || '[]');
                setMockResults(saved);
            } catch { }
        }
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-8 h-8 border-2 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin" />
            </div>
        );
    }

    const stats = taskStats;
    const totalCompleted = stats?.totalCompleted || 0;
    const completionRate = stats?.completionRate || 0;
    const streak = stats?.streak || 0;
    const activeDays = stats?.activeDays || 0;
    const avgDaily = stats?.avgDailyCompletion || 0;
    const categoryTotals = stats?.categoryTotals || {};
    const difficultyTotals = stats?.difficultyTotals || { easy: 0, medium: 0, hard: 0 };

    // Sparklines from history
    const spark14 = history14.map(d => d.completed);

    // Category colors
    const catColors: Record<string, string> = {
        'DSA': '#FBBF24', 'System Design': '#F59E0B', 'Behavioral': '#22c55e',
        'CS Fundamentals': '#D97706', 'Coding Practice': '#a855f7', 'Mock Interview': '#ef4444',
    };

    const catEntries = Object.entries(categoryTotals)
        .map(([cat, count]) => ({ cat, count: count as number }))
        .sort((a, b) => b.count - a.count);

    // Total difficulty
    const totalDiff = difficultyTotals.easy + difficultyTotals.medium + difficultyTotals.hard;

    return (
        <div className="min-h-screen flex bg-[#0A0A0A]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="gradient-text">Analytics</span>
                        </h1>
                        <p className="text-[#9CA3AF] mt-1">Your real interview preparation performance</p>
                    </div>
                    <Link href="/interview" className="gradient-btn !rounded-xl !py-3 !px-6 flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4" /> Practice Now
                    </Link>
                </div>

                {/* Top stat cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        {
                            label: 'Tasks Completed',
                            value: totalCompleted,
                            spark: spark14.length > 1 ? spark14 : [0, 0],
                            color: '#FBBF24',
                            change: `+${history14.slice(-1)[0]?.completed || 0} today`,
                            up: (history14.slice(-1)[0]?.completed || 0) > 0,
                        },
                        {
                            label: 'Completion Rate',
                            value: `${Math.round(completionRate)}%`,
                            spark: spark14.length > 1 ? spark14.map((c, i) => history14[i]?.total > 0 ? (c / history14[i].total) * 100 : 0) : [0, 0],
                            color: '#F59E0B',
                            change: completionRate > 0 ? 'Active' : 'No data yet',
                            up: completionRate > 0,
                        },
                        {
                            label: 'Current Streak',
                            value: `${streak} days`,
                            spark: spark14.length > 1 ? spark14 : [0, 0],
                            color: '#D97706',
                            change: streak > 0 ? '🔥 On fire!' : 'Start today!',
                            up: streak > 0,
                        },
                        {
                            label: 'Active Days',
                            value: `${activeDays}/30`,
                            spark: spark14.length > 1 ? spark14.map(c => c > 0 ? 1 : 0) : [0, 0],
                            color: '#FBBF24',
                            change: `${Math.round((activeDays / 30) * 100)}% consistency`,
                            up: activeDays > 0,
                        },
                    ].map((card, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-[#111111] rounded-2xl p-5 border border-[#1F1F1F] hover:border-[#FBBF24]/20 transition-all">
                            <p className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold mb-1">{card.label}</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-[#E5E7EB]">{card.value}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        {card.up ? <ArrowUpRight className="w-3 h-3 text-green-400" /> : <span className="w-3 h-3" />}
                                        <span className={`text-xs font-medium ${card.up ? 'text-green-400' : 'text-[#6B7280]'}`}>{card.change}</span>
                                    </div>
                                </div>
                                <Sparkline data={card.spark} color={card.color} width={70} height={28} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                    {/* Daily Task Performance — 14 days */}
                    <div className="col-span-2 bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[#E5E7EB] flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-accent" /> Daily Task Completion
                            </h3>
                            <span className="text-[10px] text-[#6B7280]">Last 14 days</span>
                        </div>
                        {history14.length > 1 ? (
                            <BarChartSimple
                                data={history14.map(d => d.completed)}
                                labels={history14.map(d => {
                                    const md = new Date(d.date + 'T12:00:00');
                                    return md.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                })}
                            />
                        ) : (
                            <div className="text-center py-10 text-[#6B7280]">
                                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Complete tasks to see your performance</p>
                            </div>
                        )}
                    </div>

                    {/* Difficulty Distribution */}
                    <div className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F]">
                        <h3 className="text-sm font-bold text-[#E5E7EB] flex items-center gap-2 mb-5">
                            <Target className="w-4 h-4 text-accent" /> Difficulty Split
                        </h3>
                        {totalDiff > 0 ? (
                            <>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Easy', count: difficultyTotals.easy, color: '#22c55e', pct: (difficultyTotals.easy / totalDiff) * 100 },
                                        { label: 'Medium', count: difficultyTotals.medium, color: '#FBBF24', pct: (difficultyTotals.medium / totalDiff) * 100 },
                                        { label: 'Hard', count: difficultyTotals.hard, color: '#ef4444', pct: (difficultyTotals.hard / totalDiff) * 100 },
                                    ].map((d) => (
                                        <div key={d.label}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm text-[#E5E7EB] font-medium">{d.label}</span>
                                                <span className="text-xs text-[#9CA3AF]">{d.count} ({Math.round(d.pct)}%)</span>
                                            </div>
                                            <div className="h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 0.8 }}
                                                    className="h-full rounded-full" style={{ backgroundColor: d.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-[#1F1F1F] flex items-center justify-between text-center">
                                    <div>
                                        <p className="text-lg font-bold text-accent">{totalDiff}</p>
                                        <p className="text-[10px] text-[#6B7280]">Total</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-green-400">{difficultyTotals.easy}</p>
                                        <p className="text-[10px] text-[#6B7280]">Easy</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-accent">{difficultyTotals.medium}</p>
                                        <p className="text-[10px] text-[#6B7280]">Medium</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-red-400">{difficultyTotals.hard}</p>
                                        <p className="text-[10px] text-[#6B7280]">Hard</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 text-[#6B7280]">
                                <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Complete tasks to see difficulty breakdown</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Performance */}
                <div className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] mb-6">
                    <h3 className="text-sm font-bold text-[#E5E7EB] flex items-center gap-2 mb-5">
                        <Trophy className="w-4 h-4 text-accent" /> Category Performance
                    </h3>
                    {catEntries.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {catEntries.map((t, i) => {
                                const maxCat = Math.max(...catEntries.map(e => e.count), 1);
                                return (
                                    <motion.div key={t.cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-3 bg-[#0A0A0A] rounded-xl p-3 border border-[#1F1F1F]">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${catColors[t.cat] || '#FBBF24'}15` }}>
                                            <Code2 className="w-4 h-4" style={{ color: catColors[t.cat] || '#FBBF24' }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#E5E7EB] font-medium truncate">{t.cat}</span>
                                                <span className="text-xs font-bold ml-2" style={{ color: catColors[t.cat] || '#FBBF24' }}>{t.count}</span>
                                            </div>
                                            <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden mt-1.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(t.count / maxCat) * 100}%` }}
                                                    transition={{ duration: 0.6 }}
                                                    className="h-full rounded-full"
                                                    style={{ background: `linear-gradient(90deg, ${catColors[t.cat] || '#FBBF24'}, ${catColors[t.cat] || '#FBBF24'}88)` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-[#6B7280] mt-0.5">{t.count} task{t.count !== 1 ? 's' : ''} completed</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[#6B7280]">
                            <Code2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Complete tasks to see category performance</p>
                        </div>
                    )}
                </div>

                {/* 30-Day Overview + Category Donut */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="col-span-2 bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F]">
                        <h3 className="text-sm font-bold text-[#E5E7EB] flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-accent" /> 30-Day Overview
                        </h3>
                        <div className="grid grid-cols-7 gap-1.5">
                            {history30.map((day, i) => {
                                const intensity = day.total > 0 ? day.completed / day.total : 0;
                                const bg = intensity === 0 ? '#1F1F1F'
                                    : intensity < 0.5 ? '#FBBF2433'
                                        : intensity < 1 ? '#FBBF2477'
                                            : '#FBBF24';
                                const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric' });
                                return (
                                    <motion.div
                                        key={day.date}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.01 }}
                                        className="aspect-square rounded-md flex items-center justify-center text-[9px] font-medium transition-all hover:ring-1 hover:ring-[#FBBF24]/30 cursor-default"
                                        style={{ backgroundColor: bg }}
                                        title={`${day.date}: ${day.completed}/${day.total} tasks`}
                                    >
                                        <span className={intensity >= 1 ? 'text-black' : 'text-[#6B7280]'}>{dayLabel}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-[10px] text-[#6B7280]">
                            <span>Less</span>
                            <div className="w-3 h-3 rounded-sm bg-[#1F1F1F]" />
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FBBF2433' }} />
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FBBF2477' }} />
                            <div className="w-3 h-3 rounded-sm bg-[#FBBF24]" />
                            <span>More</span>
                        </div>
                    </div>

                    <div className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] flex flex-col items-center justify-center">
                        <h3 className="text-sm font-bold text-[#E5E7EB] mb-4">Category Split</h3>
                        <DonutChart
                            data={catEntries.map(e => ({ label: e.cat, value: e.count }))}
                            colors={catEntries.map(e => catColors[e.cat] || '#FBBF24')}
                        />
                        <div className="mt-4 w-full space-y-1.5">
                            {catEntries.slice(0, 4).map(e => (
                                <div key={e.cat} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColors[e.cat] || '#FBBF24' }} />
                                    <span className="text-[#9CA3AF] truncate flex-1">{e.cat}</span>
                                    <span className="text-[#E5E7EB] font-bold">{e.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mock Interview History */}
                <div className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] mt-6">
                    <h3 className="text-sm font-bold text-[#E5E7EB] flex items-center gap-2 mb-5">
                        <Shield className="w-4 h-4 text-accent" /> Mock Interview History
                    </h3>
                    {mockResults.length > 0 ? (
                        <div className="space-y-2">
                            {mockResults.slice().reverse().map((r: any, i: number) => {
                                const grade = r.totalScore >= 80 ? 'A+' : r.totalScore >= 65 ? 'A' : r.totalScore >= 50 ? 'B' : r.totalScore >= 35 ? 'C' : 'D';
                                const gradeColor = r.totalScore >= 65 ? 'text-green-400 bg-green-500/10' : r.totalScore >= 35 ? 'text-accent bg-[#FBBF24]/10' : 'text-red-400 bg-red-500/10';
                                return (
                                    <motion.div key={r.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4 border border-[#1F1F1F]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#E5E7EB]">{r.topic}</p>
                                                <p className="text-[10px] text-[#6B7280]">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-xs text-[#6B7280]">MCQ</p>
                                                <p className="text-sm font-bold text-accent">{r.mcqScore}/60</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-[#6B7280]">Coding</p>
                                                <p className="text-sm font-bold text-[#F59E0B]">{r.codingScore}/40</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-[#6B7280]">Total</p>
                                                <p className="text-sm font-bold text-[#E5E7EB]">{r.totalScore}/100</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${gradeColor}`}>{grade}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[#6B7280]">
                            <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Complete a mock interview to see your history</p>
                            <Link href="/mock-interview" className="inline-flex items-center gap-1 text-xs text-accent mt-2 hover:underline">
                                Start Mock Interview <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
