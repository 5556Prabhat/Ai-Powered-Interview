'use client';

import { motion } from 'framer-motion';
import { Brain, Lightbulb, Clock, HardDrive, TrendingUp } from 'lucide-react';

interface Evaluation {
    logicScore: number;
    readabilityScore: number;
    optimizationScore: number;
    edgeCaseAnalysis: string;
    suggestions: string[];
    timeComplexity: string;
    spaceComplexity: string;
    overallScore: number;
}

interface ScoreDisplayProps {
    evaluation: Evaluation;
}

function ScoreRing({ score, label, color, delay = 0 }: {
    score: number; label: string; color: string; delay?: number;
}) {
    const percentage = (score / 10) * 100;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col items-center"
        >
            <div className="relative w-24 h-24">
                <svg className="w-24 h-24 score-ring" viewBox="0 0 80 80">
                    <circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke="#1F1F1F"
                        strokeWidth="6"
                    />
                    <motion.circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ delay: delay + 0.2, duration: 1.2, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#E5E7EB]">{score}</span>
                </div>
            </div>
            <span className="text-xs text-[#9CA3AF] mt-2 text-center">{label}</span>
        </motion.div>
    );
}

export default function ScoreDisplay({ evaluation }: ScoreDisplayProps) {
    const getScoreColor = (score: number): string => {
        if (score >= 8) return '#FBBF24';
        if (score >= 6) return '#F59E0B';
        if (score >= 4) return '#D97706';
        return '#f87171';
    };

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-sm font-medium mb-4">
                    <Brain className="w-4 h-4" />
                    AI Code Evaluation
                </div>

                <div className="flex justify-center mb-6">
                    <ScoreRing
                        score={evaluation.overallScore}
                        label="Overall"
                        color={getScoreColor(evaluation.overallScore)}
                    />
                </div>
            </motion.div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4">
                <ScoreRing
                    score={evaluation.logicScore}
                    label="Logic"
                    color={getScoreColor(evaluation.logicScore)}
                    delay={0.1}
                />
                <ScoreRing
                    score={evaluation.optimizationScore}
                    label="Optimization"
                    color={getScoreColor(evaluation.optimizationScore)}
                    delay={0.2}
                />
                <ScoreRing
                    score={evaluation.readabilityScore}
                    label="Readability"
                    color={getScoreColor(evaluation.readabilityScore)}
                    delay={0.3}
                />
            </div>

            {/* Complexity */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
            >
                <div className="flex-1 bg-[#111111] rounded-xl p-4 border border-[#1F1F1F]">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-[#FBBF24]" />
                        <span className="text-xs text-[#9CA3AF]">Time</span>
                    </div>
                    <p className="font-mono font-bold text-sm text-[#E5E7EB]">{evaluation.timeComplexity}</p>
                </div>
                <div className="flex-1 bg-[#111111] rounded-xl p-4 border border-[#1F1F1F]">
                    <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-xs text-[#9CA3AF]">Space</span>
                    </div>
                    <p className="font-mono font-bold text-sm text-[#E5E7EB]">{evaluation.spaceComplexity}</p>
                </div>
            </motion.div>

            {/* Edge Case Analysis */}
            {evaluation.edgeCaseAnalysis && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F]"
                >
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#E5E7EB]">
                        <TrendingUp className="w-4 h-4 text-[#FBBF24]" />
                        Edge Case Analysis
                    </h4>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">{evaluation.edgeCaseAnalysis}</p>
                </motion.div>
            )}

            {/* Suggestions */}
            {evaluation.suggestions?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F]"
                >
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#E5E7EB]">
                        <Lightbulb className="w-4 h-4 text-[#FBBF24]" />
                        Suggestions
                    </h4>
                    <ul className="space-y-2">
                        {evaluation.suggestions.map((suggestion, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                                className="flex items-start gap-2 text-sm text-[#9CA3AF]"
                            >
                                <span className="text-[#FBBF24] mt-0.5">→</span>
                                {suggestion}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </div>
    );
}
