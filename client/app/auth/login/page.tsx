'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Terminal, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            {/* Background orbs — Gold */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#FBBF24]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#D97706]/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 justify-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center">
                        <Terminal className="w-6 h-6 text-black" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">InterviewIQ</span>
                </Link>

                <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-center mb-2 text-[#E5E7EB]">Welcome Back</h2>
                    <p className="text-[#9CA3AF] text-center mb-8">Sign in to continue your interview prep</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#141414] border border-[#1F1F1F] text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] outline-none transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#141414] border border-[#1F1F1F] text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-accent transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-btn !rounded-xl !py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[#9CA3AF] mt-6 text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-accent hover:text-[#F59E0B] font-medium">
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
