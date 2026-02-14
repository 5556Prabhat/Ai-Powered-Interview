'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Play, Send, Brain, Clock, MemoryStick, ChevronDown } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import AIChatPanel from '@/components/AIChatPanel';
import ScoreDisplay from '@/components/ScoreDisplay';
import api from '@/lib/api';
import { useInterviewStore } from '@/store/useInterviewStore';

export default function InterviewDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const {
        currentQuestion, code, language, isRunning, executionResult, aiEvaluation, isEvaluating,
        setQuestion, setCode, setLanguage, setIsRunning, setExecutionResult, setAIEvaluation, setIsEvaluating,
    } = useInterviewStore();

    const [activeTab, setActiveTab] = useState<'problem' | 'result' | 'ai'>('problem');
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const { data } = await api.get(`/questions/${id}`);
            setQuestion(data);
            if (data.starterCode?.[language]) {
                setCode(data.starterCode[language]);
            }
        } catch {
            // Demo fallback
            setQuestion({
                id,
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
                difficulty: 'EASY',
                tags: ['Array', 'Hash Table'],
                constraints: '2 <= nums.length <= 10⁴',
                examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
                hints: ['Try using a hash map'],
                starterCode: {
                    PYTHON: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
                    JAVA: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}',
                    CPP: '#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    return {};\n}',
                },
            });
            setCode('def two_sum(nums, target):\n    # Write your solution here\n    pass');
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab('result');
        try {
            const { data } = await api.post('/submissions', {
                questionId: id,
                code,
                language,
            });
            setExecutionResult(data.execution);
            if (data.submission?.evaluation) {
                setAIEvaluation(data.submission.evaluation);
            }
        } catch (err: any) {
            setExecutionResult({
                stdout: '',
                stderr: err.error || 'Execution failed. Make sure the backend is running.',
                runtime: 0,
                memory: 0,
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitForEval = async () => {
        setIsEvaluating(true);
        setActiveTab('ai');
        try {
            const { data } = await api.post('/submissions', {
                questionId: id,
                code,
                language,
            });

            // Poll for evaluation
            const pollEval = async (submissionId: string, attempts = 0): Promise<void> => {
                if (attempts > 15) {
                    setIsEvaluating(false);
                    return;
                }
                const { data: sub } = await api.get(`/submissions/${submissionId}`);
                if (sub.evaluation) {
                    setAIEvaluation(sub.evaluation);
                    setIsEvaluating(false);
                } else {
                    setTimeout(() => pollEval(submissionId, attempts + 1), 2000);
                }
            };

            setExecutionResult(data.execution);
            await pollEval(data.submission.id);
        } catch {
            setIsEvaluating(false);
        }
    };

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        if (currentQuestion?.starterCode?.[lang]) {
            setCode(currentQuestion.starterCode[lang]);
        }
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col h-screen">
                {/* Top bar */}
                <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-lg text-[#E5E7EB]">{currentQuestion?.title || 'Loading...'}</h2>
                        {currentQuestion?.difficulty && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full
                ${currentQuestion.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                                    currentQuestion.difficulty === 'MEDIUM' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                                        'bg-red-500/20 text-red-400'}`}
                            >
                                {currentQuestion.difficulty}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language selector */}
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="appearance-none bg-[#141414] border border-[#1F1F1F] text-[#E5E7EB] rounded-lg px-4 py-2 pr-8 text-sm focus:border-[#FBBF24] outline-none cursor-pointer"
                            >
                                <option value="PYTHON">Python</option>
                                <option value="JAVA">Java</option>
                                <option value="CPP">C++</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                        </div>

                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] border border-[#1F1F1F] text-[#E5E7EB] transition-all text-sm font-medium disabled:opacity-50 hover:border-[#FBBF24]/30"
                        >
                            {isRunning ? (
                                <div className="w-4 h-4 border-2 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 text-[#FBBF24]" />
                            )}
                            Run
                        </button>

                        <button
                            onClick={handleSubmitForEval}
                            disabled={isEvaluating}
                            className="gradient-btn !py-2 !px-5 !text-sm !rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {isEvaluating ? (
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Submit
                        </button>

                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FBBF24]/10 hover:bg-[#FBBF24]/20 text-[#FBBF24] transition-all text-sm font-medium border border-[#FBBF24]/20"
                        >
                            <Brain className="w-4 h-4" />
                            AI Chat
                        </button>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Problem / Results */}
                    <div className="w-[45%] border-r border-[#1F1F1F] flex flex-col">
                        {/* Tabs */}
                        <div className="flex border-b border-[#1F1F1F]">
                            {[
                                { key: 'problem', label: 'Problem' },
                                { key: 'result', label: 'Results' },
                                { key: 'ai', label: 'AI Review' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`flex-1 py-3 text-sm font-medium transition-all
                    ${activeTab === tab.key
                                            ? 'text-[#FBBF24] border-b-2 border-[#FBBF24] bg-[#FBBF24]/5'
                                            : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'problem' && currentQuestion && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 text-[#E5E7EB]">{currentQuestion.title}</h3>
                                        <div className="flex gap-2 mb-4">
                                            {currentQuestion.tags?.map((tag: string) => (
                                                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#1F1F1F] text-[#9CA3AF]">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-[#9CA3AF] leading-relaxed whitespace-pre-wrap">
                                            {currentQuestion.description}
                                        </div>
                                    </div>

                                    {currentQuestion.examples && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-[#9CA3AF] mb-2">Examples</h4>
                                            <pre className="bg-[#111111] rounded-lg p-4 text-sm font-mono text-[#E5E7EB] whitespace-pre-wrap border border-[#1F1F1F]">
                                                {currentQuestion.examples}
                                            </pre>
                                        </div>
                                    )}

                                    {currentQuestion.constraints && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-[#9CA3AF] mb-2">Constraints</h4>
                                            <pre className="bg-[#111111] rounded-lg p-4 text-sm font-mono text-[#E5E7EB] whitespace-pre-wrap border border-[#1F1F1F]">
                                                {currentQuestion.constraints}
                                            </pre>
                                        </div>
                                    )}

                                    {currentQuestion.hints?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-[#9CA3AF] mb-2">💡 Hints</h4>
                                            <ul className="space-y-2">
                                                {currentQuestion.hints.map((hint: string, i: number) => (
                                                    <li key={i} className="text-sm text-[#9CA3AF] bg-[#111111] rounded-lg p-3 border border-[#1F1F1F]">
                                                        {hint}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'result' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {isRunning ? (
                                        <div className="flex flex-col items-center py-12">
                                            <div className="w-12 h-12 border-3 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin mb-4" />
                                            <p className="text-[#9CA3AF]">Running your code...</p>
                                        </div>
                                    ) : executionResult ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-4 h-4 text-[#FBBF24]" />
                                                    <span className="text-[#9CA3AF]">Runtime: <span className="text-[#E5E7EB] font-mono">{executionResult.runtime}ms</span></span>
                                                </div>
                                            </div>

                                            {executionResult.stdout && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-green-400 mb-2">Output</h4>
                                                    <pre className="bg-[#111111] rounded-lg p-4 text-sm font-mono text-green-300 whitespace-pre-wrap border border-[#1F1F1F]">
                                                        {executionResult.stdout}
                                                    </pre>
                                                </div>
                                            )}

                                            {executionResult.stderr && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-red-400 mb-2">Error</h4>
                                                    <pre className="bg-[#111111] rounded-lg p-4 text-sm font-mono text-red-300 whitespace-pre-wrap border border-[#1F1F1F]">
                                                        {executionResult.stderr}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-[#6B7280]">
                                            <Play className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p>Run your code to see results</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'ai' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {isEvaluating ? (
                                        <div className="flex flex-col items-center py-12">
                                            <div className="w-12 h-12 border-3 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin mb-4" />
                                            <p className="text-[#9CA3AF]">AI is evaluating your code...</p>
                                            <p className="text-xs text-[#6B7280] mt-2">This may take a few seconds</p>
                                        </div>
                                    ) : aiEvaluation ? (
                                        <ScoreDisplay evaluation={aiEvaluation} />
                                    ) : (
                                        <div className="text-center py-12 text-[#6B7280]">
                                            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p>Submit your code to get AI evaluation</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right: Editor */}
                    <div className={`${showChat ? 'w-[30%]' : 'w-[55%]'} transition-all duration-300`}>
                        <Editor
                            code={code}
                            onChange={setCode}
                            language={language === 'CPP' ? 'cpp' : language.toLowerCase()}
                        />
                    </div>

                    {/* AI Chat Panel */}
                    {showChat && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '25%', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="border-l border-[#1F1F1F]"
                        >
                            <AIChatPanel questionId={id} />
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
