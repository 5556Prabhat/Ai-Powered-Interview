'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Code2, Terminal, Trophy, Flame, LogOut,
    Brain, BarChart3, Settings, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/interview', label: 'Practice', icon: Code2 },
    { href: '/mock-interview', label: 'Mock Interview', icon: Shield },
    { href: '/chat', label: 'AI Chat', icon: Brain },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 left-0 h-screen w-64 bg-[#0A0A0A] backdrop-blur-xl border-r border-[#1F1F1F] flex flex-col z-40"
        >
            {/* Logo */}
            <div className="p-6 border-b border-[#1F1F1F]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center shadow-neon">
                        <Terminal className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <span className="text-lg font-bold gradient-text">InterviewIQ</span>
                        <p className="text-[10px] text-[#6B7280] -mt-0.5">AI Interview Simulator</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative
                ${isActive
                                    ? 'bg-accent/10 text-accent'
                                    : 'text-[#9CA3AF] hover:bg-[#141414] hover:text-[#E5E7EB]'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full"
                                />
                            )}
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'group-hover:text-[#E5E7EB]'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Stats */}
            <div className="px-4 mb-4">
                <div className="bg-[#111111] rounded-xl p-4 space-y-3 border border-[#1F1F1F]">
                    <div className="flex items-center gap-2 text-sm">
                        <Flame className="w-4 h-4 text-accent" />
                        <span className="text-[#9CA3AF]">Streak</span>
                        <span className="ml-auto font-bold text-accent">0 days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-accent-deep" />
                        <span className="text-[#9CA3AF]">Solved</span>
                        <span className="ml-auto font-bold text-accent-deep">0</span>
                    </div>
                </div>
            </div>

            {/* User section */}
            <div className="p-4 border-t border-[#1F1F1F]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center text-black font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-[#E5E7EB]">{user?.name || 'User'}</p>
                        <p className="text-xs text-[#6B7280] truncate">{user?.email || 'user@email.com'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-[#6B7280] hover:text-red-400 transition-colors p-1"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}
