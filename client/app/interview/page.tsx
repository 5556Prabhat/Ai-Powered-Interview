'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Code2, Search, ChevronRight, BookOpen, Brain, Globe, Cpu, Database,
    Shield, Lock, Layers, Network, Server, HardDrive, Zap, ExternalLink,
    Star, CheckCircle2, Filter, ArrowUpRight, Loader2, Sparkles, X,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

/* ================================================================== */
/*  DSA QUESTION BANK                                                   */
/* ================================================================== */
interface Question {
    id: string; title: string; description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'; tags: string[];
    source?: string; link?: string; solved?: boolean;
}

const DSA_TOPICS = [
    { id: 'all', label: 'All Problems', icon: Code2, count: 0 },
    { id: 'arrays', label: 'Arrays & Hashing', icon: Layers, count: 0 },
    { id: 'strings', label: 'Strings', icon: Code2, count: 0 },
    { id: 'two-pointers', label: 'Two Pointers', icon: ArrowUpRight, count: 0 },
    { id: 'sliding-window', label: 'Sliding Window', icon: Layers, count: 0 },
    { id: 'stack', label: 'Stack & Queue', icon: Database, count: 0 },
    { id: 'linked-list', label: 'Linked List', icon: Layers, count: 0 },
    { id: 'binary-search', label: 'Binary Search', icon: Search, count: 0 },
    { id: 'trees', label: 'Trees', icon: Network, count: 0 },
    { id: 'graphs', label: 'Graphs', icon: Globe, count: 0 },
    { id: 'dp', label: 'Dynamic Programming', icon: Brain, count: 0 },
    { id: 'greedy', label: 'Greedy', icon: Zap, count: 0 },
    { id: 'backtracking', label: 'Backtracking', icon: ArrowUpRight, count: 0 },
    { id: 'heap', label: 'Heap / Priority Queue', icon: Layers, count: 0 },
    { id: 'bit', label: 'Bit Manipulation', icon: Cpu, count: 0 },
    { id: 'math', label: 'Math & Geometry', icon: Star, count: 0 },
];

const QUESTION_BANK: Question[] = [
    // Arrays & Hashing
    { id: 'a1', title: 'Two Sum', description: 'Find two numbers that add up to target.', difficulty: 'EASY', tags: ['arrays'], source: 'LeetCode #1' },
    { id: 'a2', title: 'Contains Duplicate', description: 'Check if array has duplicates.', difficulty: 'EASY', tags: ['arrays'], source: 'LeetCode #217' },
    { id: 'a3', title: 'Valid Anagram', description: 'Check if two strings are anagrams.', difficulty: 'EASY', tags: ['arrays'], source: 'LeetCode #242' },
    { id: 'a4', title: 'Group Anagrams', description: 'Group strings that are anagrams.', difficulty: 'MEDIUM', tags: ['arrays'], source: 'LeetCode #49' },
    { id: 'a5', title: 'Top K Frequent Elements', description: 'Return k most frequent elements.', difficulty: 'MEDIUM', tags: ['arrays'], source: 'LeetCode #347' },
    { id: 'a6', title: 'Product of Array Except Self', description: 'Product of all elements except self.', difficulty: 'MEDIUM', tags: ['arrays'], source: 'LeetCode #238' },
    { id: 'a7', title: 'Longest Consecutive Sequence', description: 'Find longest consecutive sequence.', difficulty: 'MEDIUM', tags: ['arrays'], source: 'LeetCode #128' },
    { id: 'a8', title: 'Encode and Decode Strings', description: 'Design encode/decode algorithm.', difficulty: 'MEDIUM', tags: ['arrays'], source: 'LeetCode #271' },
    // Strings
    { id: 's1', title: 'Valid Palindrome', description: 'Check if string is a palindrome.', difficulty: 'EASY', tags: ['strings'], source: 'LeetCode #125' },
    { id: 's2', title: 'Longest Palindromic Substring', description: 'Find longest palindrome substring.', difficulty: 'MEDIUM', tags: ['strings'], source: 'LeetCode #5' },
    { id: 's3', title: 'Longest Repeating Character Replacement', description: 'Max length substring with k replacements.', difficulty: 'MEDIUM', tags: ['strings'], source: 'LeetCode #424' },
    { id: 's4', title: 'Minimum Window Substring', description: 'Smallest window containing all chars.', difficulty: 'HARD', tags: ['strings'], source: 'LeetCode #76' },
    { id: 's5', title: 'Palindromic Substrings', description: 'Count palindromic substrings.', difficulty: 'MEDIUM', tags: ['strings'], source: 'LeetCode #647' },
    // Two Pointers
    { id: 'tp1', title: '3Sum', description: 'Find all triplets that sum to zero.', difficulty: 'MEDIUM', tags: ['two-pointers'], source: 'LeetCode #15' },
    { id: 'tp2', title: 'Container With Most Water', description: 'Find container with maximum area.', difficulty: 'MEDIUM', tags: ['two-pointers'], source: 'LeetCode #11' },
    { id: 'tp3', title: 'Trapping Rain Water', description: 'Calculate trapped rain water.', difficulty: 'HARD', tags: ['two-pointers'], source: 'LeetCode #42' },
    // Sliding Window
    { id: 'sw1', title: 'Best Time to Buy and Sell Stock', description: 'Maximize profit from stock prices.', difficulty: 'EASY', tags: ['sliding-window'], source: 'LeetCode #121' },
    { id: 'sw2', title: 'Longest Substring Without Repeating', description: 'Find longest non-repeating substring.', difficulty: 'MEDIUM', tags: ['sliding-window'], source: 'LeetCode #3' },
    { id: 'sw3', title: 'Sliding Window Maximum', description: 'Max element in each sliding window.', difficulty: 'HARD', tags: ['sliding-window'], source: 'LeetCode #239' },
    // Stack
    { id: 'st1', title: 'Valid Parentheses', description: 'Check if parentheses are valid.', difficulty: 'EASY', tags: ['stack'], source: 'LeetCode #20' },
    { id: 'st2', title: 'Min Stack', description: 'Stack with getMin in O(1).', difficulty: 'MEDIUM', tags: ['stack'], source: 'LeetCode #155' },
    { id: 'st3', title: 'Daily Temperatures', description: 'Days until warmer temperature.', difficulty: 'MEDIUM', tags: ['stack'], source: 'LeetCode #739' },
    { id: 'st4', title: 'Largest Rectangle in Histogram', description: 'Find largest rectangle in histogram.', difficulty: 'HARD', tags: ['stack'], source: 'LeetCode #84' },
    // Linked List
    { id: 'll1', title: 'Reverse Linked List', description: 'Reverse a singly linked list.', difficulty: 'EASY', tags: ['linked-list'], source: 'LeetCode #206' },
    { id: 'll2', title: 'Merge Two Sorted Lists', description: 'Merge two sorted linked lists.', difficulty: 'EASY', tags: ['linked-list'], source: 'LeetCode #21' },
    { id: 'll3', title: 'Linked List Cycle', description: 'Detect cycle in linked list.', difficulty: 'EASY', tags: ['linked-list'], source: 'LeetCode #141' },
    { id: 'll4', title: 'Reorder List', description: 'Reorder list L0→Ln→L1→Ln-1...', difficulty: 'MEDIUM', tags: ['linked-list'], source: 'LeetCode #143' },
    { id: 'll5', title: 'Merge K Sorted Lists', description: 'Merge k sorted linked lists.', difficulty: 'HARD', tags: ['linked-list'], source: 'LeetCode #23' },
    // Binary Search
    { id: 'bs1', title: 'Binary Search', description: 'Basic binary search implementation.', difficulty: 'EASY', tags: ['binary-search'], source: 'LeetCode #704' },
    { id: 'bs2', title: 'Search in Rotated Sorted Array', description: 'Search in rotated array.', difficulty: 'MEDIUM', tags: ['binary-search'], source: 'LeetCode #33' },
    { id: 'bs3', title: 'Find Minimum in Rotated Array', description: 'Find min in rotated sorted array.', difficulty: 'MEDIUM', tags: ['binary-search'], source: 'LeetCode #153' },
    { id: 'bs4', title: 'Koko Eating Bananas', description: 'Minimum eating speed for bananas.', difficulty: 'MEDIUM', tags: ['binary-search'], source: 'LeetCode #875' },
    { id: 'bs5', title: 'Median of Two Sorted Arrays', description: 'Find median of two sorted arrays.', difficulty: 'HARD', tags: ['binary-search'], source: 'LeetCode #4' },
    // Trees
    { id: 't1', title: 'Invert Binary Tree', description: 'Invert/mirror a binary tree.', difficulty: 'EASY', tags: ['trees'], source: 'LeetCode #226' },
    { id: 't2', title: 'Maximum Depth of Binary Tree', description: 'Find max depth of binary tree.', difficulty: 'EASY', tags: ['trees'], source: 'LeetCode #104' },
    { id: 't3', title: 'Same Tree', description: 'Check if two trees are identical.', difficulty: 'EASY', tags: ['trees'], source: 'LeetCode #100' },
    { id: 't4', title: 'Validate BST', description: 'Check if tree is valid BST.', difficulty: 'MEDIUM', tags: ['trees'], source: 'LeetCode #98' },
    { id: 't5', title: 'Kth Smallest in BST', description: 'Find kth smallest element in BST.', difficulty: 'MEDIUM', tags: ['trees'], source: 'LeetCode #230' },
    { id: 't6', title: 'Binary Tree Level Order Traversal', description: 'Level order traversal of tree.', difficulty: 'MEDIUM', tags: ['trees'], source: 'LeetCode #102' },
    { id: 't7', title: 'Serialize and Deserialize Binary Tree', description: 'Serialize/deserialize a binary tree.', difficulty: 'HARD', tags: ['trees'], source: 'LeetCode #297' },
    // Graphs
    { id: 'g1', title: 'Number of Islands', description: 'Count islands in 2D grid.', difficulty: 'MEDIUM', tags: ['graphs'], source: 'LeetCode #200' },
    { id: 'g2', title: 'Clone Graph', description: 'Deep copy of an undirected graph.', difficulty: 'MEDIUM', tags: ['graphs'], source: 'LeetCode #133' },
    { id: 'g3', title: 'Course Schedule', description: 'Can all courses be finished?', difficulty: 'MEDIUM', tags: ['graphs'], source: 'LeetCode #207' },
    { id: 'g4', title: 'Pacific Atlantic Water Flow', description: 'Cells that can reach both oceans.', difficulty: 'MEDIUM', tags: ['graphs'], source: 'LeetCode #417' },
    { id: 'g5', title: 'Word Ladder', description: 'Shortest transformation sequence.', difficulty: 'HARD', tags: ['graphs'], source: 'LeetCode #127' },
    // Dynamic Programming
    { id: 'd1', title: 'Climbing Stairs', description: 'Count ways to climb n stairs.', difficulty: 'EASY', tags: ['dp'], source: 'LeetCode #70' },
    { id: 'd2', title: 'House Robber', description: 'Max money without robbing adjacents.', difficulty: 'MEDIUM', tags: ['dp'], source: 'LeetCode #198' },
    { id: 'd3', title: 'Coin Change', description: 'Fewest coins to make amount.', difficulty: 'MEDIUM', tags: ['dp'], source: 'LeetCode #322' },
    { id: 'd4', title: 'Longest Increasing Subsequence', description: 'Find LIS length.', difficulty: 'MEDIUM', tags: ['dp'], source: 'LeetCode #300' },
    { id: 'd5', title: 'Word Break', description: 'Can string be segmented?', difficulty: 'MEDIUM', tags: ['dp'], source: 'LeetCode #139' },
    { id: 'd6', title: 'Edit Distance', description: 'Min operations to convert strings.', difficulty: 'HARD', tags: ['dp'], source: 'LeetCode #72' },
    { id: 'd7', title: 'Regular Expression Matching', description: 'Pattern matching with . and *.', difficulty: 'HARD', tags: ['dp'], source: 'LeetCode #10' },
    // Greedy
    { id: 'gr1', title: 'Maximum Subarray', description: 'Find contiguous subarray with max sum.', difficulty: 'MEDIUM', tags: ['greedy'], source: 'LeetCode #53' },
    { id: 'gr2', title: 'Jump Game', description: 'Can you reach the last index?', difficulty: 'MEDIUM', tags: ['greedy'], source: 'LeetCode #55' },
    { id: 'gr3', title: 'Jump Game II', description: 'Minimum jumps to last index.', difficulty: 'MEDIUM', tags: ['greedy'], source: 'LeetCode #45' },
    // Backtracking
    { id: 'bt1', title: 'Subsets', description: 'Return all possible subsets.', difficulty: 'MEDIUM', tags: ['backtracking'], source: 'LeetCode #78' },
    { id: 'bt2', title: 'Combination Sum', description: 'Combinations that sum to target.', difficulty: 'MEDIUM', tags: ['backtracking'], source: 'LeetCode #39' },
    { id: 'bt3', title: 'Permutations', description: 'Return all permutations.', difficulty: 'MEDIUM', tags: ['backtracking'], source: 'LeetCode #46' },
    { id: 'bt4', title: 'N-Queens', description: 'Place N queens on board.', difficulty: 'HARD', tags: ['backtracking'], source: 'LeetCode #51' },
    // Heap
    { id: 'h1', title: 'Kth Largest Element', description: 'Find kth largest in array.', difficulty: 'MEDIUM', tags: ['heap'], source: 'LeetCode #215' },
    { id: 'h2', title: 'Find Median from Data Stream', description: 'Running median of numbers.', difficulty: 'HARD', tags: ['heap'], source: 'LeetCode #295' },
    // Bit Manipulation
    { id: 'b1', title: 'Number of 1 Bits', description: 'Count set bits in integer.', difficulty: 'EASY', tags: ['bit'], source: 'LeetCode #191' },
    { id: 'b2', title: 'Counting Bits', description: 'Count bits for 0 to n.', difficulty: 'EASY', tags: ['bit'], source: 'LeetCode #338' },
    { id: 'b3', title: 'Reverse Bits', description: 'Reverse bits of integer.', difficulty: 'EASY', tags: ['bit'], source: 'LeetCode #190' },
    // Math
    { id: 'm1', title: 'Rotate Image', description: 'Rotate matrix 90 degrees.', difficulty: 'MEDIUM', tags: ['math'], source: 'LeetCode #48' },
    { id: 'm2', title: 'Spiral Matrix', description: 'Return elements in spiral order.', difficulty: 'MEDIUM', tags: ['math'], source: 'LeetCode #54' },
    { id: 'm3', title: 'Set Matrix Zeroes', description: 'Set entire row/col to zero.', difficulty: 'MEDIUM', tags: ['math'], source: 'LeetCode #73' },
];

// Set counts per topic
DSA_TOPICS.forEach(t => {
    t.count = t.id === 'all' ? QUESTION_BANK.length : QUESTION_BANK.filter(q => q.tags.includes(t.id)).length;
});

/* ================================================================== */
/*  CS SUBJECTS                                                         */
/* ================================================================== */
const CS_SUBJECTS = [
    { id: 'os', label: 'Operating Systems', icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-500/10', topics: ['Process Management', 'Memory Management', 'File Systems', 'CPU Scheduling', 'Deadlocks', 'Virtual Memory', 'Paging & Segmentation', 'Threads & Concurrency'] },
    { id: 'cn', label: 'Computer Networks', icon: Network, color: 'text-purple-400', bg: 'bg-purple-500/10', topics: ['OSI Model', 'TCP/IP', 'HTTP/HTTPS', 'DNS', 'Routing Algorithms', 'Subnetting', 'Socket Programming', 'Network Security'] },
    { id: 'dbms', label: 'Database Management', icon: Database, color: 'text-green-400', bg: 'bg-green-500/10', topics: ['SQL Queries', 'Normalization', 'Transactions', 'Indexing', 'ACID Properties', 'Joins', 'ER Diagrams', 'NoSQL Databases'] },
    { id: 'oops', label: 'OOP Concepts', icon: Layers, color: 'text-accent', bg: 'bg-[#FBBF24]/10', topics: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'Design Patterns', 'SOLID Principles', 'Interfaces', 'Composition vs Inheritance'] },
    { id: 'sd', label: 'System Design', icon: Server, color: 'text-orange-400', bg: 'bg-orange-500/10', topics: ['Load Balancing', 'Caching', 'Database Sharding', 'Microservices', 'Message Queues', 'API Design', 'CAP Theorem', 'Scalability Patterns'] },
    { id: 'security', label: 'Cybersecurity', icon: Lock, color: 'text-red-400', bg: 'bg-red-500/10', topics: ['Encryption', 'Authentication', 'OWASP Top 10', 'SQL Injection', 'XSS', 'CSRF', 'Network Security', 'Cryptography'] },
];

/* ================================================================== */
/*  DIFFICULTY COLORS                                                   */
/* ================================================================== */
const DIFF = {
    EASY: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    MEDIUM: { bg: 'bg-[#FBBF24]/10', text: 'text-accent', border: 'border-[#FBBF24]/20' },
    HARD: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                                 */
/* ================================================================== */
export default function InterviewPage() {
    const { loadUser, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);

    // Tab: 'dsa' or 'cs'
    const [mainTab, setMainTab] = useState<'dsa' | 'cs'>('dsa');

    // DSA state
    const [activeTopic, setActiveTopic] = useState('all');
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

    // CS state
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [activeCSTopic, setActiveCSTopic] = useState<string | null>(null);
    const [csContent, setCsContent] = useState<string | null>(null);
    const [csLoading, setCsLoading] = useState(false);

    // AI Search
    const [aiSearchQuery, setAiSearchQuery] = useState('');
    const [aiResults, setAiResults] = useState<Question[]>([]);
    const [aiSearching, setAiSearching] = useState(false);

    useEffect(() => {
        loadUser().then(() => setLoading(false));
        // Load solved state from localStorage
        try {
            const saved = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
            setSolvedIds(new Set(saved));
        } catch { }
    }, []);

    const toggleSolved = (id: string) => {
        setSolvedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            localStorage.setItem('solvedQuestions', JSON.stringify([...next]));
            return next;
        });
    };

    // Filter questions
    const questions = QUESTION_BANK.filter(q => {
        if (activeTopic !== 'all' && !q.tags.includes(activeTopic)) return false;
        if (difficulty && q.difficulty !== difficulty) return false;
        if (search) {
            const s = search.toLowerCase();
            return q.title.toLowerCase().includes(s) || q.description.toLowerCase().includes(s) || q.source?.toLowerCase().includes(s);
        }
        return true;
    });

    const stats = {
        total: QUESTION_BANK.length,
        solved: solvedIds.size,
        easy: QUESTION_BANK.filter(q => q.difficulty === 'EASY').length,
        medium: QUESTION_BANK.filter(q => q.difficulty === 'MEDIUM').length,
        hard: QUESTION_BANK.filter(q => q.difficulty === 'HARD').length,
    };

    // Simulated AI search for more coding questions
    const handleAISearch = () => {
        if (!aiSearchQuery.trim()) return;
        setAiSearching(true);
        setAiResults([]);
        setTimeout(() => {
            const query = aiSearchQuery.toLowerCase();
            const generated: Question[] = [
                { id: `ai-${Date.now()}-1`, title: `${aiSearchQuery} - Basic Implementation`, description: `Implement a basic ${aiSearchQuery} solution. Commonly asked on LeetCode and GeeksForGeeks.`, difficulty: 'EASY', tags: ['arrays'], source: 'GeeksForGeeks' },
                { id: `ai-${Date.now()}-2`, title: `${aiSearchQuery} - Optimized Approach`, description: `Solve ${aiSearchQuery} using an optimized technique with better time complexity.`, difficulty: 'MEDIUM', tags: ['arrays'], source: 'LeetCode' },
                { id: `ai-${Date.now()}-3`, title: `${aiSearchQuery} - Advanced Variant`, description: `Advanced variation of ${aiSearchQuery} with additional constraints and edge cases.`, difficulty: 'MEDIUM', tags: ['arrays'], source: 'CodeChef' },
                { id: `ai-${Date.now()}-4`, title: `${aiSearchQuery} - Interview Variant`, description: `Common interview variant of ${aiSearchQuery}. Frequently asked at FAANG companies.`, difficulty: 'HARD', tags: ['arrays'], source: 'LeetCode' },
                { id: `ai-${Date.now()}-5`, title: `${aiSearchQuery} - Competitive Programming`, description: `Competitive programming version with tight constraints. Practice ${aiSearchQuery} at scale.`, difficulty: 'HARD', tags: ['arrays'], source: 'CodeChef' },
            ];
            setAiResults(generated);
            setAiSearching(false);
        }, 2000);
    };

    // Simulated AI content fetch for CS subjects
    const fetchCSContent = (subject: string, topic: string) => {
        setActiveCSTopic(topic);
        setCsLoading(true);
        setCsContent(null);
        setTimeout(() => {
            setCsContent(`# ${topic}\n\n## Overview\n${topic} is a fundamental concept in ${subject}. It covers the core principles and mechanisms used in modern computing systems.\n\n## Key Concepts\n• Definition and core principles of ${topic}\n• Real-world applications and use cases\n• Common interview questions on this topic\n• Implementation details and algorithms\n\n## Important Points to Remember\n1. ${topic} is crucial for system-level understanding\n2. Frequently asked in technical interviews at top companies\n3. Connect ${topic} with related concepts for deeper understanding\n4. Practice explaining ${topic} in your own words\n\n## Interview Questions\n• What is ${topic}? Explain with examples.\n• How does ${topic} work internally?\n• Compare ${topic} with related approaches.\n• What are the advantages and limitations?\n• Describe a real-world scenario where ${topic} is used.\n\n## Resources\n• GeeksForGeeks - ${topic} Tutorial\n• MIT OpenCourseWare - ${subject}\n• Operating Systems: Three Easy Pieces\n• Computer Networking: A Top-Down Approach`);
            setCsLoading(false);
        }, 1500);
    };

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

            <main className="flex-1 ml-64 overflow-y-auto h-screen">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1F1F1F] px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-[#E5E7EB] flex items-center gap-2">
                                <Code2 className="w-6 h-6 text-accent" /> Practice Hub
                            </h1>
                            <p className="text-sm text-[#6B7280] mt-0.5">Master DSA & CS fundamentals</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <div className="bg-[#111111] border border-[#1F1F1F] rounded-lg px-3 py-2 text-center">
                                <p className="text-[#6B7280]">Solved</p>
                                <p className="text-lg font-black text-accent">{stats.solved}<span className="text-[#6B7280] text-xs font-normal">/{stats.total}</span></p>
                            </div>
                            <div className="bg-[#111111] border border-[#1F1F1F] rounded-lg px-3 py-2 flex gap-3">
                                <div className="text-center"><p className="text-green-400 font-bold">{stats.easy}</p><p className="text-[#6B7280]">Easy</p></div>
                                <div className="text-center"><p className="text-accent font-bold">{stats.medium}</p><p className="text-[#6B7280]">Medium</p></div>
                                <div className="text-center"><p className="text-red-400 font-bold">{stats.hard}</p><p className="text-[#6B7280]">Hard</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Main tabs */}
                    <div className="flex items-center gap-1 bg-[#111111] rounded-lg p-1 border border-[#1F1F1F] w-fit">
                        <button onClick={() => setMainTab('dsa')} className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mainTab === 'dsa' ? 'bg-[#FBBF24]/15 text-accent' : 'text-[#6B7280] hover:text-[#9CA3AF]'}`}>
                            <Code2 className="w-4 h-4" /> DSA Problems
                        </button>
                        <button onClick={() => setMainTab('cs')} className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mainTab === 'cs' ? 'bg-[#FBBF24]/15 text-accent' : 'text-[#6B7280] hover:text-[#9CA3AF]'}`}>
                            <BookOpen className="w-4 h-4" /> CS Subjects
                        </button>
                    </div>
                </div>

                {/* DSA TAB */}
                {mainTab === 'dsa' && (
                    <div className="flex">
                        {/* Topic sidebar */}
                        <div className="w-56 border-r border-[#1F1F1F] p-3 space-y-1 sticky top-[130px] h-[calc(100vh-130px)] overflow-y-auto flex-shrink-0">
                            {DSA_TOPICS.map(t => (
                                <button key={t.id} onClick={() => setActiveTopic(t.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left
                                        ${activeTopic === t.id ? 'bg-[#FBBF24]/10 text-accent' : 'text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#111111]'}`}>
                                    <t.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="flex-1 truncate">{t.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTopic === t.id ? 'bg-[#FBBF24]/20' : 'bg-[#1F1F1F]'}`}>{t.count}</span>
                                </button>
                            ))}

                            {/* AI Search box */}
                            <div className="pt-3 mt-3 border-t border-[#1F1F1F]">
                                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-accent" /> AI Search</p>
                                <div className="relative">
                                    <input value={aiSearchQuery} onChange={e => setAiSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAISearch()}
                                        placeholder="Search more questions..."
                                        className="w-full px-3 py-2 pr-8 rounded-lg bg-[#111111] border border-[#1F1F1F] text-xs text-[#E5E7EB] placeholder-[#4B5563] focus:border-[#FBBF24] outline-none" />
                                    <button onClick={handleAISearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-accent">
                                        {aiSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <p className="text-[9px] text-[#4B5563] mt-1">Search LeetCode, GFG, CodeChef</p>
                            </div>
                        </div>

                        {/* Questions list */}
                        <div className="flex-1 p-6">
                            {/* Filters */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                                    <input value={search} onChange={e => setSearch(e.target.value)}
                                        placeholder="Search problems..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#1F1F1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#FBBF24] outline-none" />
                                </div>
                                <div className="flex gap-1">
                                    {['', 'EASY', 'MEDIUM', 'HARD'].map(d => (
                                        <button key={d} onClick={() => setDifficulty(d)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${difficulty === d ? 'bg-[#FBBF24]/15 text-accent' : 'bg-[#111111] text-[#6B7280] border border-[#1F1F1F] hover:text-[#9CA3AF]'}`}>
                                            {d || 'All'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI Search Results */}
                            <AnimatePresence>
                                {aiResults.length > 0 && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 bg-gradient-to-r from-[#FBBF24]/5 to-transparent rounded-xl border border-[#FBBF24]/20 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-bold text-accent flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Found {aiResults.length} questions for &ldquo;{aiSearchQuery}&rdquo;</p>
                                            <button onClick={() => setAiResults([])} className="text-[#6B7280] hover:text-[#E5E7EB]"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <div className="space-y-2">
                                            {aiResults.map((q, i) => (
                                                <div key={q.id} className="flex items-center justify-between bg-[#0A0A0A] rounded-lg p-3 border border-[#1F1F1F]">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-[#6B7280] w-5">{i + 1}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-[#E5E7EB]">{q.title}</p>
                                                            <p className="text-[10px] text-[#6B7280] mt-0.5">{q.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFF[q.difficulty].bg} ${DIFF[q.difficulty].text}`}>{q.difficulty}</span>
                                                        <span className="text-[10px] text-[#6B7280]">{q.source}</span>
                                                        <Link href={`/interview/${q.id}`} className="p-1.5 rounded-lg bg-[#FBBF24]/10 text-accent hover:bg-[#FBBF24]/20 transition-all">
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Question table */}
                            <div className="bg-[#111111] rounded-xl border border-[#1F1F1F] overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-[40px_40px_1fr_100px_120px_100px] gap-2 px-4 py-2.5 border-b border-[#1F1F1F] text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
                                    <span></span><span>#</span><span>Title</span><span>Difficulty</span><span>Source</span><span>Status</span>
                                </div>
                                {/* Table body */}
                                {questions.length > 0 ? questions.map((q, i) => {
                                    const isSolved = solvedIds.has(q.id);
                                    return (
                                        <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                            className={`grid grid-cols-[40px_40px_1fr_100px_120px_100px] gap-2 px-4 py-3 border-b border-[#1F1F1F]/50 items-center hover:bg-[#0A0A0A] transition-all group ${isSolved ? 'bg-green-500/[0.02]' : ''}`}>
                                            <button onClick={() => toggleSolved(q.id)} className="flex items-center justify-center">
                                                {isSolved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 rounded-full border border-[#333] group-hover:border-[#FBBF24]/50 transition-all" />}
                                            </button>
                                            <span className="text-xs text-[#6B7280]">{i + 1}</span>
                                            <Link href={`/interview/${q.id}`} className="flex flex-col">
                                                <span className="text-sm font-medium text-[#E5E7EB] group-hover:text-accent transition-colors">{q.title}</span>
                                                <span className="text-[10px] text-[#4B5563] mt-0.5 line-clamp-1">{q.description}</span>
                                            </Link>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${DIFF[q.difficulty].bg} ${DIFF[q.difficulty].text}`}>{q.difficulty}</span>
                                            <span className="text-[10px] text-[#6B7280] flex items-center gap-1">{q.source} <ExternalLink className="w-2.5 h-2.5" /></span>
                                            <div>
                                                <Link href={`/interview/${q.id}`}
                                                    className="text-[10px] px-3 py-1 rounded-lg bg-[#FBBF24]/10 text-accent font-semibold hover:bg-[#FBBF24]/20 transition-all opacity-0 group-hover:opacity-100 inline-flex items-center gap-1">
                                                    Solve <ChevronRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                }) : (
                                    <div className="text-center py-12 text-[#6B7280]">
                                        <Code2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No problems match your filters</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-[#4B5563] mt-3 text-center">Showing {questions.length} of {stats.total} problems</p>
                        </div>
                    </div>
                )}

                {/* CS SUBJECTS TAB */}
                {mainTab === 'cs' && (
                    <div className="p-6">
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {CS_SUBJECTS.map(sub => (
                                <motion.button key={sub.id} onClick={() => { setActiveSubject(activeSubject === sub.id ? null : sub.id); setActiveCSTopic(null); setCsContent(null); }}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`p-5 rounded-xl border text-left transition-all group
                                        ${activeSubject === sub.id ? `${sub.bg} border-current ${sub.color}` : 'bg-[#111111] border-[#1F1F1F] hover:border-[#FBBF24]/20'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl ${sub.bg} flex items-center justify-center`}>
                                            <sub.icon className={`w-5 h-5 ${sub.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#E5E7EB]">{sub.label}</p>
                                            <p className="text-[10px] text-[#6B7280]">{sub.topics.length} topics</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {sub.topics.slice(0, 4).map(t => (
                                            <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#6B7280]">{t}</span>
                                        ))}
                                        {sub.topics.length > 4 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#6B7280]">+{sub.topics.length - 4}</span>}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Expanded subject topics */}
                        <AnimatePresence>
                            {activeSubject && (() => {
                                const sub = CS_SUBJECTS.find(s => s.id === activeSubject)!;
                                return (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="bg-[#111111] rounded-xl border border-[#1F1F1F] overflow-hidden">
                                        <div className="p-5 border-b border-[#1F1F1F]">
                                            <h2 className="text-lg font-bold text-[#E5E7EB] flex items-center gap-2">
                                                <sub.icon className={`w-5 h-5 ${sub.color}`} /> {sub.label}
                                            </h2>
                                            <p className="text-xs text-[#6B7280] mt-1">Click any topic to load AI-powered study material</p>
                                        </div>
                                        <div className="flex">
                                            {/* Topic list */}
                                            <div className="w-64 border-r border-[#1F1F1F] p-3 space-y-1">
                                                {sub.topics.map((topic, i) => (
                                                    <button key={topic} onClick={() => fetchCSContent(sub.label, topic)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left
                                                            ${activeCSTopic === topic ? `${sub.bg} ${sub.color}` : 'text-[#9CA3AF] hover:bg-[#0A0A0A] hover:text-[#E5E7EB]'}`}>
                                                        <span className="w-5 h-5 rounded-md bg-[#1F1F1F] flex items-center justify-center text-[10px] text-[#6B7280] flex-shrink-0">{i + 1}</span>
                                                        {topic}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Content area */}
                                            <div className="flex-1 p-6 min-h-[300px]">
                                                {csLoading && (
                                                    <div className="flex items-center justify-center h-full gap-2 text-accent">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span className="text-sm">AI is fetching content...</span>
                                                    </div>
                                                )}
                                                {!csLoading && csContent && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none">
                                                        {csContent.split('\n').map((line, i) => {
                                                            if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-[#E5E7EB] mb-3">{line.slice(2)}</h2>;
                                                            if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-accent mt-5 mb-2">{line.slice(3)}</h3>;
                                                            if (line.startsWith('• ')) return <p key={i} className="text-sm text-[#9CA3AF] ml-3 mb-1 flex items-start gap-2"><span className="text-accent mt-0.5">•</span> {line.slice(2)}</p>;
                                                            if (line.match(/^\d+\./)) return <p key={i} className="text-sm text-[#9CA3AF] ml-3 mb-1">{line}</p>;
                                                            if (line.trim()) return <p key={i} className="text-sm text-[#9CA3AF] mb-2">{line}</p>;
                                                            return <br key={i} />;
                                                        })}
                                                    </motion.div>
                                                )}
                                                {!csLoading && !csContent && (
                                                    <div className="flex flex-col items-center justify-center h-full text-[#6B7280]">
                                                        <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                                                        <p className="text-sm">Select a topic to start learning</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
