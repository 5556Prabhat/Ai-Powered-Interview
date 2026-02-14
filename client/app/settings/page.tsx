'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Settings as SettingsIcon, User, Bell, Shield, Palette, Moon,
    Save, ChevronRight, LogOut, Mail, Lock, Eye, EyeOff, Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore, ThemeMode } from '@/store/useSettingsStore';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
    const { user, loadUser, isAuthenticated, logout } = useAuthStore();
    const { theme, editorFontSize, setTheme, setEditorFontSize } = useSettingsStore();
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('profile');
    const [saved, setSaved] = useState(false);
    const router = useRouter();

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [notifications, setNotifications] = useState({ email: true, push: true, weekly: false });

    useEffect(() => { loadUser().then(() => setLoading(false)); }, []);
    useEffect(() => { if (!loading && !isAuthenticated) router.push('/auth/login'); }, [loading, isAuthenticated]);
    useEffect(() => {
        if (user) { setName(user.name || ''); setEmail(user.email || ''); }
    }, [user]);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
            </div>
        );
    }

    const sections = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="min-h-screen flex bg-[#0A0A0A]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            <span className="gradient-text">Settings</span>
                        </h1>
                        <p className="text-[#9CA3AF] mt-1">Manage your account preferences</p>
                    </div>

                    <div className="flex gap-6">
                        {/* Left nav */}
                        <div className="w-56 flex-shrink-0">
                            <nav className="space-y-1">
                                {sections.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left
                                            ${activeSection === s.id
                                                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                                : 'text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#141414]'
                                            }`}
                                        style={activeSection === s.id ? { backgroundColor: `rgba(var(--accent-rgb), 0.1)`, color: `var(--accent)` } : {}}
                                    >
                                        <s.icon className="w-4 h-4" />
                                        {s.label}
                                    </button>
                                ))}

                                <div className="pt-4 mt-4 border-t border-[#1F1F1F]">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </nav>
                        </div>

                        {/* Right content */}
                        <div className="flex-1">
                            {/* Profile */}
                            {activeSection === 'profile' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] space-y-6">
                                    <h3 className="text-lg font-bold text-[#E5E7EB]">Profile Information</h3>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] flex items-center justify-center text-black font-bold text-xl">
                                            {name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#E5E7EB] font-medium">{name || 'User'}</p>
                                            <p className="text-xs text-[#6B7280]">{email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-[#9CA3AF] mb-1.5">Full Name</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-[#E5E7EB] focus:border-[var(--accent)] outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#9CA3AF] mb-1.5">Email</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-[#E5E7EB] focus:border-[var(--accent)] outline-none text-sm" />
                                        </div>
                                    </div>

                                    <button onClick={handleSave}
                                        className="gradient-btn !py-2.5 !px-6 !text-sm !rounded-xl flex items-center gap-2">
                                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                                    </button>
                                </motion.div>
                            )}

                            {/* Notifications */}
                            {activeSection === 'notifications' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] space-y-5">
                                    <h3 className="text-lg font-bold text-[#E5E7EB]">Notification Preferences</h3>
                                    {[
                                        { key: 'email', label: 'Email Notifications', desc: 'Receive score reports and tips via email' },
                                        { key: 'push', label: 'Push Notifications', desc: 'Get reminded about daily practice goals' },
                                        { key: 'weekly', label: 'Weekly Digest', desc: 'Weekly summary of your progress' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#1F1F1F] last:border-0">
                                            <div>
                                                <p className="text-sm text-[#E5E7EB] font-medium">{item.label}</p>
                                                <p className="text-xs text-[#6B7280]">{item.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                                className="w-11 h-6 rounded-full transition-all relative"
                                                style={{ backgroundColor: notifications[item.key as keyof typeof notifications] ? 'var(--accent)' : '#374151' }}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${notifications[item.key as keyof typeof notifications] ? 'left-[22px]' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={handleSave}
                                        className="gradient-btn !py-2.5 !px-6 !text-sm !rounded-xl flex items-center gap-2">
                                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                                    </button>
                                </motion.div>
                            )}

                            {/* Appearance */}
                            {activeSection === 'appearance' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] space-y-5">
                                    <h3 className="text-lg font-bold text-[#E5E7EB]">Appearance</h3>
                                    <div>
                                        <p className="text-sm text-[#9CA3AF] mb-3">Theme</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'dark' as ThemeMode, label: 'Dark', desc: 'Blue accent theme' },
                                                { id: 'gold' as ThemeMode, label: 'Gold', desc: 'Gold accent theme' },
                                                { id: 'system' as ThemeMode, label: 'System', desc: 'Follow system' },
                                            ].map((t) => (
                                                <button key={t.id} onClick={() => setTheme(t.id)}
                                                    className={`p-4 rounded-xl border text-left transition-all
                                                        ${theme === t.id
                                                            ? 'border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.05)]'
                                                            : 'border-[#1F1F1F] hover:border-[#374151]'
                                                        }`}
                                                    style={theme === t.id ? { borderColor: 'var(--accent)', backgroundColor: `rgba(var(--accent-rgb), 0.05)` } : {}}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg mb-2 ${t.id === 'dark'
                                                        ? 'bg-gradient-to-br from-[#60A5FA] to-[#2563EB]'
                                                        : t.id === 'gold'
                                                            ? 'bg-gradient-to-br from-[#FBBF24] to-[#D97706]'
                                                            : 'bg-gradient-to-br from-[#374151] to-[#111111]'
                                                        }`} />
                                                    <p className="text-sm text-[#E5E7EB] font-medium">{t.label}</p>
                                                    <p className="text-[10px] text-[#6B7280]">{t.desc}</p>
                                                    {theme === t.id && <Check className="w-4 h-4 mt-2" style={{ color: 'var(--accent)' }} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#9CA3AF] mb-3">Editor Font Size</p>
                                        <select
                                            value={editorFontSize}
                                            onChange={(e) => setEditorFontSize(Number(e.target.value))}
                                            className="bg-[#0A0A0A] border border-[#1F1F1F] text-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:border-[var(--accent)] outline-none cursor-pointer"
                                        >
                                            <option value={12}>12px</option>
                                            <option value={14}>14px</option>
                                            <option value={16}>16px</option>
                                            <option value={18}>18px</option>
                                            <option value={20}>20px</option>
                                        </select>
                                    </div>
                                    <button onClick={handleSave}
                                        className="gradient-btn !py-2.5 !px-6 !text-sm !rounded-xl flex items-center gap-2">
                                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                                    </button>
                                </motion.div>
                            )}

                            {/* Security */}
                            {activeSection === 'security' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] space-y-5">
                                    <h3 className="text-lg font-bold text-[#E5E7EB]">Security</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-[#9CA3AF] mb-1.5">Current Password</label>
                                            <input type="password" placeholder="••••••••"
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-[#E5E7EB] placeholder-[#6B7280] focus:border-[var(--accent)] outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#9CA3AF] mb-1.5">New Password</label>
                                            <input type="password" placeholder="••••••••"
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-[#E5E7EB] placeholder-[#6B7280] focus:border-[var(--accent)] outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#9CA3AF] mb-1.5">Confirm New Password</label>
                                            <input type="password" placeholder="••••••••"
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-[#E5E7EB] placeholder-[#6B7280] focus:border-[var(--accent)] outline-none text-sm" />
                                        </div>
                                    </div>
                                    <button onClick={handleSave}
                                        className="gradient-btn !py-2.5 !px-6 !text-sm !rounded-xl flex items-center gap-2">
                                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Lock className="w-4 h-4" /> Update Password</>}
                                    </button>

                                    <div className="pt-4 mt-4 border-t border-[#1F1F1F]">
                                        <h4 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h4>
                                        <button onClick={logout}
                                            className="text-sm px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                                            Sign Out of All Devices
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
