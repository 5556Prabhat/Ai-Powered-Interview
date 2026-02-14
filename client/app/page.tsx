'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Code2,
    Brain,
    BarChart3,
    Zap,
    Shield,
    MessageSquare,
    ArrowRight,
    Star,
    Terminal,
    Trophy,
    ChevronRight,
} from 'lucide-react';

const features = [
    {
        icon: Code2,
        title: 'Smart Code Editor',
        description: 'Monaco-powered editor with syntax highlighting, auto-completion, and multi-language support.',
    },
    {
        icon: Brain,
        title: 'AI Evaluation',
        description: 'Get instant FAANG-level code reviews with detailed scoring on logic, optimization, and readability.',
    },
    {
        icon: MessageSquare,
        title: 'Live AI Interview',
        description: 'Practice with an AI interviewer that asks follow-up questions and adapts to your skill level.',
    },
    {
        icon: BarChart3,
        title: 'Performance Analytics',
        description: 'Track your progress with detailed analytics, identify weak areas, and watch your scores improve.',
    },
    {
        icon: Shield,
        title: 'Secure Execution',
        description: 'Docker-sandboxed code execution with timeout and memory limits for safe code testing.',
    },
    {
        icon: Zap,
        title: 'Real-time Feedback',
        description: 'Instant code execution results with runtime metrics, memory usage, and AI-powered suggestions.',
    },
];

const stats = [
    { label: 'Questions', value: '500+' },
    { label: 'Languages', value: '3+' },
    { label: 'AI Evaluations', value: '∞' },
    { label: 'Success Rate', value: '94%' },
];

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function LandingPage() {
    const { isAuthenticated, loadUser } = useAuthStore();

    useEffect(() => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('interviewiq-token')) {
            loadUser();
        }
    }, []);

    return (
        <div className="min-h-screen overflow-hidden">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1F1F1F]"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-xl font-bold gradient-text">InterviewIQ</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-[#9CA3AF] hover:text-accent transition-colors">Features</a>
                        <a href="#how-it-works" className="text-[#9CA3AF] hover:text-accent transition-colors">How It Works</a>
                        <a href="#pricing" className="text-[#9CA3AF] hover:text-accent transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="gradient-btn !py-2.5 !px-6 !text-sm !rounded-lg inline-flex items-center gap-2"
                            >
                                Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-[#9CA3AF] hover:text-accent transition-colors font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="gradient-btn !py-2.5 !px-6 !text-sm !rounded-lg inline-flex items-center gap-2"
                                >
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                {/* Animated background orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent-muted/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-accent-deep/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

                <div className="max-w-7xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-8"
                        >
                            <Star className="w-4 h-4" />
                            AI-Powered Interview Preparation
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                            Ace Your Next
                            <br />
                            <span className="gradient-text">Coding Interview</span>
                        </h1>

                        <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10 leading-relaxed">
                            Practice with an AI interviewer that evaluates your code like a FAANG engineer.
                            Get instant feedback, track your progress, and land your dream job.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link
                                href={isAuthenticated ? '/dashboard' : '/auth/register'}
                                className="gradient-btn !py-4 !px-8 !text-lg !rounded-xl inline-flex items-center gap-3 shadow-neon-lg"
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Practicing Free'}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="#features"
                                className="secondary-btn !py-4 !px-8 !text-lg !rounded-xl inline-flex items-center gap-3"
                            >
                                See How It Works
                            </Link>
                        </div>

                        {/* Stats */}
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
                        >
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    className="glass-card p-6 text-center"
                                >
                                    <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                                    <div className="text-sm text-[#6B7280] mt-1">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Hero Image / Code Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-20 max-w-5xl mx-auto"
                    >
                        <div className="glass-card p-1 shadow-neon-lg">
                            <div className="bg-[#0A0A0A] rounded-2xl overflow-hidden">
                                {/* Browser bar */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#111111] border-b border-[#1F1F1F]">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="flex-1 text-center text-xs text-[#6B7280]">InterviewIQ — Two Sum Challenge</div>
                                </div>

                                {/* Code preview */}
                                <div className="grid md:grid-cols-2 gap-0">
                                    <div className="p-6 border-r border-[#1F1F1F]">
                                        <div className="text-sm text-[#6B7280] mb-3"># Solution</div>
                                        <pre className="text-sm font-mono leading-relaxed">
                                            <code>
                                                <span className="text-accent">def</span> <span className="text-[#E5E7EB]">two_sum</span>(nums, target):{'\n'}
                                                {'  '}<span className="text-[#6B7280]">seen</span> = {'{}'}{'\n'}
                                                {'  '}<span className="text-accent">for</span> i, num <span className="text-accent">in</span> <span className="text-accent-deep">enumerate</span>(nums):{'\n'}
                                                {'    '}<span className="text-[#6B7280]">complement</span> = target - num{'\n'}
                                                {'    '}<span className="text-accent">if</span> complement <span className="text-accent">in</span> seen:{'\n'}
                                                {'      '}<span className="text-accent">return</span> [seen[complement], i]{'\n'}
                                                {'    '}seen[num] = i{'\n'}
                                                {'  '}<span className="text-accent">return</span> []{'\n'}
                                            </code>
                                        </pre>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-sm text-[#6B7280] mb-3">🤖 AI Evaluation</div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#9CA3AF]">Logic</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-accent to-accent-deep rounded-full" style={{ width: '90%' }} />
                                                    </div>
                                                    <span className="text-sm font-bold text-accent">9/10</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#9CA3AF]">Optimization</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-accent-deep to-accent-muted rounded-full" style={{ width: '95%' }} />
                                                    </div>
                                                    <span className="text-sm font-bold text-accent-deep">9.5/10</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#9CA3AF]">Readability</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-accent-muted to-accent-muted rounded-full" style={{ width: '85%' }} />
                                                    </div>
                                                    <span className="text-sm font-bold text-accent-muted">8.5/10</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 p-3 bg-[#111111] rounded-lg text-xs text-[#9CA3AF]">
                                                <span className="text-accent font-medium">⏱ Time:</span> O(n) &nbsp;|&nbsp;
                                                <span className="text-accent font-medium">💾 Space:</span> O(n)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything You Need to <span className="gradient-text">Succeed</span>
                        </h2>
                        <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto">
                            Comprehensive tools designed to prepare you for the toughest technical interviews.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="glass-card p-8 group cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-7 h-7 text-black" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#E5E7EB]">{feature.title}</h3>
                                <p className="text-[#9CA3AF] leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />

                <div className="max-w-7xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            How <span className="gradient-text">InterviewIQ</span> Works
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Choose a Problem', desc: 'Select from hundreds of curated problems across all difficulty levels and topics.', icon: Terminal },
                            { step: '02', title: 'Write & Execute', desc: 'Code your solution in our smart editor and run it against test cases instantly.', icon: Code2 },
                            { step: '03', title: 'Get AI Feedback', desc: 'Receive comprehensive AI evaluation with scores, complexity analysis, and improvement tips.', icon: Trophy },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="text-center"
                            >
                                <div className="relative inline-block mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-[#141414] flex items-center justify-center border border-[#1F1F1F]">
                                        <item.icon className="w-8 h-8 text-accent" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center text-xs font-bold text-black">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#E5E7EB]">{item.title}</h3>
                                <p className="text-[#9CA3AF]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.05] to-accent-muted/[0.05]" />
                        <div className="relative">
                            <h2 className="text-4xl font-bold mb-4">
                                Ready to Ace Your Interview?
                            </h2>
                            <p className="text-xl text-[#9CA3AF] mb-8 max-w-xl mx-auto">
                                Join thousands of developers who have improved their interview skills with InterviewIQ.
                            </p>
                            <Link
                                href={isAuthenticated ? '/dashboard' : '/auth/register'}
                                className="gradient-btn !py-4 !px-10 !text-lg !rounded-xl inline-flex items-center gap-3"
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Practice'}
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#1F1F1F] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-bold gradient-text">InterviewIQ</span>
                    </div>
                    <p className="text-[#6B7280] text-sm">
                        © 2026 InterviewIQ. Built for ambitious developers.
                    </p>
                </div>
            </footer>
        </div>
    );
}
