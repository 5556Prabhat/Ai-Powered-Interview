'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface QuestionCardProps {
    question: {
        id: string;
        title: string;
        description: string;
        difficulty: 'EASY' | 'MEDIUM' | 'HARD';
        tags: string[];
    };
    index: number;
}

const diffColors = {
    EASY: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    MEDIUM: { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]', border: 'border-[#FBBF24]/20' },
    HARD: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export default function QuestionCard({ question, index }: QuestionCardProps) {
    const colors = diffColors[question.difficulty];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/interview/${question.id}`}>
                <div className="glass-card p-6 group cursor-pointer relative overflow-hidden">
                    {/* Gradient accent */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${question.difficulty === 'EASY' ? 'bg-green-500' :
                        question.difficulty === 'MEDIUM' ? 'bg-[#FBBF24]' : 'bg-red-500'
                        } rounded-l-xl`} />

                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg group-hover:text-[#FBBF24] transition-colors text-[#E5E7EB]">
                            {question.title}
                        </h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                            {question.difficulty}
                        </span>
                    </div>

                    <p className="text-sm text-[#9CA3AF] mb-4 line-clamp-2">
                        {question.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {question.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2.5 py-1 rounded-full bg-[#1F1F1F] text-[#9CA3AF]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FBBF24] group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
