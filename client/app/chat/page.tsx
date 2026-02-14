'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Bot, User, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Sidebar from '@/components/Sidebar';
import { getSocket, connectSocket } from '@/lib/socket';
import api from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export default function AIChatPage() {
    const { user, loadUser, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [topic, setTopic] = useState('General Interview Prep');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => { loadUser().then(() => setLoading(false)); }, []);
    useEffect(() => { if (!loading && !isAuthenticated) router.push('/auth/login'); }, [loading, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) startSession();
    }, [isAuthenticated]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const startSession = async () => {
        try {
            const { data } = await api.post('/interviews/sessions', { topic, mode: 'standard' });
            setSessionId(data.id);
            connectSocket();
            const socket = getSocket();
            socket.emit('join_session', { sessionId: data.id, topic });
            socket.on('ai_message', (msg: { content: string; timestamp: string }) => {
                setMessages(prev => [...prev, { role: 'assistant', content: msg.content, timestamp: msg.timestamp }]);
                setIsTyping(false);
            });
            socket.on('ai_typing', (d: { isTyping: boolean }) => setIsTyping(d.isTyping));
        } catch {
            setMessages([{
                role: 'assistant',
                content: "👋 Hello! I'm your AI interview coach. I can help you with:\n\n• **Data Structures & Algorithms** — explain concepts, walk through problems\n• **System Design** — discuss architecture, scalability, trade-offs\n• **Behavioral Questions** — practice STAR method responses\n• **Code Review** — paste your code and I'll provide feedback\n\nWhat would you like to work on today?",
                timestamp: new Date().toISOString(),
            }]);
        }
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        if (sessionId) {
            const socket = getSocket();
            socket.emit('send_message', { sessionId, content: input.trim() });
        } else {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I'd love to help! Please make sure the backend server is running on port 3001 for AI responses. Once connected, I can assist with algorithm explanations, code reviews, and mock interview practice.",
                    timestamp: new Date().toISOString(),
                }]);
                setIsTyping(false);
            }, 1500);
        }
    };

    const quickPrompts = [
        '🧠 Explain two pointers technique',
        '🔥 Give me a medium difficulty problem',
        '📐 System design: URL shortener',
        '💡 Tips for FAANG behavioral interviews',
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-8 h-8 border-2 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0A0A0A]">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col h-screen">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[#E5E7EB]">AI Interview Coach</h1>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
                                <span className="text-xs text-accent">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-[#141414] border border-[#1F1F1F] text-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:border-[#FBBF24] outline-none"
                        >
                            <option value="General Interview Prep">General Prep</option>
                            <option value="Data Structures">Data Structures</option>
                            <option value="Algorithms">Algorithms</option>
                            <option value="System Design">System Design</option>
                            <option value="Behavioral">Behavioral</option>
                        </select>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <AnimatePresence>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-accent" />
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap
                                        ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-br-md font-medium'
                                            : 'bg-[#141414] text-[#E5E7EB] rounded-bl-md border border-[#1F1F1F]'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center flex-shrink-0 mt-1 text-black text-xs font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-accent" />
                                </div>
                                <div className="bg-[#141414] rounded-2xl rounded-bl-md px-5 py-3.5 border border-[#1F1F1F]">
                                    <div className="typing-indicator">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quick prompts (show when no messages yet or just the welcome) */}
                        {messages.length <= 1 && !isTyping && (
                            <div className="mt-8">
                                <p className="text-xs text-[#6B7280] mb-3 text-center">Quick prompts to get started</p>
                                <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                                    {quickPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => { setInput(prompt.replace(/^[^\s]+\s/, '')); }}
                                            className="text-left text-sm px-4 py-3 rounded-xl bg-[#111111] border border-[#1F1F1F] text-[#9CA3AF] hover:text-accent hover:border-[#FBBF24]/20 transition-all"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input bar */}
                <div className="border-t border-[#1F1F1F] p-4 bg-[#0A0A0A]/80 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1 px-5 py-3 rounded-xl bg-[#141414] border border-[#1F1F1F] text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#FBBF24] outline-none text-sm"
                            placeholder="Ask anything about coding interviews..."
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            className="p-3 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:shadow-gold-glow text-black transition-all disabled:opacity-30"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
