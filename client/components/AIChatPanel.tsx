'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, X } from 'lucide-react';
import { getSocket, connectSocket } from '@/lib/socket';
import api from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface AIChatPanelProps {
    questionId: string;
}

export default function AIChatPanel({ questionId }: AIChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startSession();
        return () => {
            // Cleanup
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const startSession = async () => {
        try {
            const { data } = await api.post('/interviews/sessions', {
                topic: 'Coding Problem Discussion',
                mode: 'standard',
            });
            setSessionId(data.id);

            // Connect socket
            connectSocket();
            const socket = getSocket();

            socket.emit('join_session', {
                sessionId: data.id,
                topic: 'Coding Problem Discussion',
            });

            socket.on('ai_message', (msg: { content: string; timestamp: string }) => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: msg.content,
                    timestamp: msg.timestamp,
                }]);
                setIsTyping(false);
            });

            socket.on('ai_typing', (data: { isTyping: boolean }) => {
                setIsTyping(data.isTyping);
            });

            socket.on('error', (err: { message: string }) => {
                console.error('Socket error:', err);
            });
        } catch (err) {
            // Fallback: add a welcome message
            setMessages([{
                role: 'assistant',
                content: "Hello! I'm your AI interviewer. I'll help you work through this problem. Feel free to ask questions about your approach, discuss time complexity, or request hints. What would you like to discuss?",
                timestamp: new Date().toISOString(),
            }]);
        }
    };

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        if (sessionId) {
            const socket = getSocket();
            socket.emit('send_message', {
                sessionId,
                content: input.trim(),
            });
        } else {
            // Offline fallback
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I'd be happy to help! Please make sure the backend server is running for AI responses. In the meantime, feel free to share your approach and I'll provide feedback once connected.",
                    timestamp: new Date().toISOString(),
                }]);
                setIsTyping(false);
            }, 1500);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A]">
            {/* Header */}
            <div className="p-4 border-b border-[#1F1F1F] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-[#FBBF24]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#E5E7EB]">AI Interviewer</h3>
                    <p className="text-xs text-[#6B7280]">Live session</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
                    <span className="text-xs text-[#FBBF24]">Active</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-br-md font-medium'
                                        : 'bg-[#141414] text-[#E5E7EB] rounded-bl-md border border-[#1F1F1F]'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-[#141414] rounded-2xl rounded-bl-md px-4 py-3 border border-[#1F1F1F]">
                            <div className="typing-indicator">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#1F1F1F]">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#141414] border border-[#1F1F1F] text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#FBBF24] outline-none text-sm"
                        placeholder="Ask the AI interviewer..."
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:shadow-gold-glow text-black transition-all disabled:opacity-30"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
