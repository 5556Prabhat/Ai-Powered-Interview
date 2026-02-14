'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Clock, Shield, AlertTriangle, Mic, MicOff, Volume2,
    ChevronRight, ChevronLeft, CheckCircle2, XCircle, Code2,
    Camera, Eye, Award, BarChart3, ArrowRight, Play, Send,
    Trophy, Target, Zap, BookOpen, RotateCcw, Home, Terminal, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

/* ================================================================== */
/*  QUESTION BANK (Fallback — used when backend is not available)     */
/* ================================================================== */
interface MCQ {
    id: number; question: string; options: string[]; correct: number;
    difficulty: 'easy' | 'medium' | 'hard'; topic: string;
}
interface TestCase { input: string; expected: string; }
interface CodingQ {
    id: number; title: string; description: string; examples: string;
    constraints: string; difficulty: 'easy' | 'medium' | 'hard'; topic: string;
    starterCodes: Record<string, string>;
    testCases: TestCase[];
}

const LANGUAGES = [
    { id: 'python', label: 'Python', monaco: 'python' },
    { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { id: 'java', label: 'Java', monaco: 'java' },
    { id: 'cpp', label: 'C++', monaco: 'cpp' },
];

const DSA_TOPICS = [
    { id: 'arrays', label: 'Arrays & Hashing', icon: '📊', category: 'dsa' as const },
    { id: 'strings', label: 'Strings', icon: '🔤', category: 'dsa' as const },
    { id: 'linked-lists', label: 'Linked Lists', icon: '🔗', category: 'dsa' as const },
    { id: 'trees', label: 'Trees & Graphs', icon: '🌳', category: 'dsa' as const },
    { id: 'dp', label: 'Dynamic Programming', icon: '🧩', category: 'dsa' as const },
    { id: 'sorting', label: 'Sorting & Searching', icon: '🔍', category: 'dsa' as const },
    { id: 'stacks', label: 'Stacks & Queues', icon: '📚', category: 'dsa' as const },
    { id: 'binary-search', label: 'Binary Search', icon: '🎯', category: 'dsa' as const },
    { id: 'heap', label: 'Heap / Priority Queue', icon: '⛰️', category: 'dsa' as const },
    { id: 'greedy', label: 'Greedy Algorithms', icon: '⚡', category: 'dsa' as const },
    { id: 'backtracking', label: 'Backtracking', icon: '🔄', category: 'dsa' as const },
    { id: 'bit-manipulation', label: 'Bit Manipulation', icon: '💻', category: 'dsa' as const },
];

const CS_TOPICS = [
    { id: 'os', label: 'Operating Systems', icon: '🖥️', category: 'cs' as const },
    { id: 'cn', label: 'Computer Networks', icon: '🌐', category: 'cs' as const },
    { id: 'dbms', label: 'Database Management', icon: '🗃️', category: 'cs' as const },
    { id: 'oops', label: 'OOP Concepts', icon: '🧠', category: 'cs' as const },
    { id: 'system-design', label: 'System Design', icon: '🏗️', category: 'cs' as const },
    { id: 'security', label: 'Cybersecurity', icon: '🔐', category: 'cs' as const },
    { id: 'compiler', label: 'Compiler Design', icon: '⚙️', category: 'cs' as const },
    { id: 'toc', label: 'Theory of Computation', icon: '🧮', category: 'cs' as const },
];

const TOPICS = [...DSA_TOPICS, ...CS_TOPICS];

/* All MCQ banks — 8 questions per topic (3 easy, 3 medium, 2 hard) */
const ALL_MCQ_BANKS: Record<string, MCQ[]> = {
    // ─── DSA ──────────────────────────────────────────────
    arrays: [
        { id: 0, question: 'What is the time complexity of accessing an element in an array by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 0, difficulty: 'easy', topic: 'arrays' },
        { id: 0, question: 'Which data structure uses a hash function to map keys to indices?', options: ['Stack', 'Queue', 'Hash Map', 'Linked List'], correct: 2, difficulty: 'easy', topic: 'arrays' },
        { id: 0, question: 'What is the space complexity of an array of size n?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 1, difficulty: 'easy', topic: 'arrays' },
        { id: 0, question: 'What is the worst-case time complexity of inserting at the beginning of a dynamic array?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 1, difficulty: 'medium', topic: 'arrays' },
        { id: 0, question: 'The "sliding window" technique is most useful for:', options: ['Sorting arrays', 'Subarray/substring problems', 'Graph traversal', 'Tree balancing'], correct: 1, difficulty: 'medium', topic: 'arrays' },
        { id: 0, question: 'In Kadane\'s algorithm, what problem is being solved?', options: ['Min element', 'Maximum subarray sum', 'Sorting', 'Binary search'], correct: 1, difficulty: 'medium', topic: 'arrays' },
        { id: 0, question: 'What technique is used in the "Trapping Rain Water" problem?', options: ['Recursion only', 'Two pointers or stack', 'Binary search', 'BFS'], correct: 1, difficulty: 'hard', topic: 'arrays' },
        { id: 0, question: 'The median of two sorted arrays can be found in:', options: ['O(n+m)', 'O(n*m)', 'O(log(min(n,m)))', 'O(n)'], correct: 2, difficulty: 'hard', topic: 'arrays' },
    ],
    strings: [
        { id: 0, question: 'What is the time complexity of checking if a string is a palindrome?', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 1, difficulty: 'easy', topic: 'strings' },
        { id: 0, question: 'Which method reverses a string in most languages?', options: ['sort()', 'reverse()', 'flip()', 'swap()'], correct: 1, difficulty: 'easy', topic: 'strings' },
        { id: 0, question: 'What data structure is most efficient for checking anagrams?', options: ['Array', 'Hash Map', 'Stack', 'Queue'], correct: 1, difficulty: 'easy', topic: 'strings' },
        { id: 0, question: 'KMP algorithm is used for:', options: ['Sorting strings', 'Pattern matching', 'String reversal', 'Encoding'], correct: 1, difficulty: 'medium', topic: 'strings' },
        { id: 0, question: 'Rabin-Karp algorithm uses what technique?', options: ['Two pointers', 'Hashing', 'Divide & conquer', 'DP'], correct: 1, difficulty: 'medium', topic: 'strings' },
        { id: 0, question: 'Longest common subsequence has what time complexity with DP?', options: ['O(n)', 'O(n²)', 'O(n*m)', 'O(2^n)'], correct: 2, difficulty: 'medium', topic: 'strings' },
        { id: 0, question: 'The Z-algorithm computes what in O(n)?', options: ['Suffix array', 'Z-array for pattern matching', 'LCP array', 'Palindromes'], correct: 1, difficulty: 'hard', topic: 'strings' },
        { id: 0, question: 'Minimum window substring optimal solution uses:', options: ['Brute force', 'Sliding window + hash map', 'Sorting', 'BFS'], correct: 1, difficulty: 'hard', topic: 'strings' },
    ],
    'linked-lists': [
        { id: 0, question: 'What is the time complexity of inserting at the head of a linked list?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 0, difficulty: 'easy', topic: 'linked-lists' },
        { id: 0, question: 'Which pointer technique detects a cycle in a linked list?', options: ['Single pointer', 'Floyd\'s two pointer', 'Three pointers', 'Stack'], correct: 1, difficulty: 'easy', topic: 'linked-lists' },
        { id: 0, question: 'A doubly linked list differs from singly by having:', options: ['No head', 'Previous pointer', 'Circular structure', 'Array backing'], correct: 1, difficulty: 'easy', topic: 'linked-lists' },
        { id: 0, question: 'Reversing a linked list in-place has what complexity?', options: ['O(n) time, O(1) space', 'O(n²) time', 'O(n) space', 'O(log n)'], correct: 0, difficulty: 'medium', topic: 'linked-lists' },
        { id: 0, question: 'To find the middle of a linked list efficiently, use:', options: ['Count then iterate', 'Slow and fast pointers', 'Recursion', 'Stack'], correct: 1, difficulty: 'medium', topic: 'linked-lists' },
        { id: 0, question: 'Merging two sorted linked lists takes:', options: ['O(n+m)', 'O(n*m)', 'O(n)', 'O(1)'], correct: 0, difficulty: 'medium', topic: 'linked-lists' },
        { id: 0, question: 'LRU Cache is typically implemented with:', options: ['Array + Stack', 'Hash Map + Doubly Linked List', 'BST', 'Heap'], correct: 1, difficulty: 'hard', topic: 'linked-lists' },
        { id: 0, question: 'Merge K sorted lists optimally uses:', options: ['Brute merge', 'Min-heap', 'Sorting all', 'Hash map'], correct: 1, difficulty: 'hard', topic: 'linked-lists' },
    ],
    trees: [
        { id: 0, question: 'What is the max nodes at level L of a binary tree?', options: ['L', '2^L', '2L', 'L²'], correct: 1, difficulty: 'easy', topic: 'trees' },
        { id: 0, question: 'In-order traversal of a BST gives:', options: ['Random order', 'Sorted order', 'Reverse sorted', 'Level order'], correct: 1, difficulty: 'easy', topic: 'trees' },
        { id: 0, question: 'Height of a balanced BST with n nodes is:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 1, difficulty: 'easy', topic: 'trees' },
        { id: 0, question: 'BFS traversal of a tree uses which data structure?', options: ['Stack', 'Queue', 'Heap', 'Hash Map'], correct: 1, difficulty: 'medium', topic: 'trees' },
        { id: 0, question: 'Lowest Common Ancestor in BST has complexity:', options: ['O(n)', 'O(h)', 'O(n²)', 'O(1)'], correct: 1, difficulty: 'medium', topic: 'trees' },
        { id: 0, question: 'AVL tree maintains balance by:', options: ['Recoloring', 'Rotations', 'Rehashing', 'Splitting'], correct: 1, difficulty: 'medium', topic: 'trees' },
        { id: 0, question: 'Serializing a binary tree can be done with:', options: ['In-order only', 'Pre-order + null markers', 'Post-order only', 'Level order only'], correct: 1, difficulty: 'hard', topic: 'trees' },
        { id: 0, question: 'Morris traversal achieves in-order in:', options: ['O(n) time, O(n) space', 'O(n) time, O(1) space', 'O(n²)', 'O(log n)'], correct: 1, difficulty: 'hard', topic: 'trees' },
    ],
    dp: [
        { id: 0, question: 'Dynamic Programming is based on:', options: ['Greedy choice', 'Optimal substructure + overlapping subproblems', 'Divide and conquer only', 'Backtracking'], correct: 1, difficulty: 'easy', topic: 'dp' },
        { id: 0, question: 'Fibonacci with DP has time complexity:', options: ['O(2^n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 1, difficulty: 'easy', topic: 'dp' },
        { id: 0, question: 'Memoization is a form of:', options: ['Bottom-up DP', 'Top-down DP', 'Greedy', 'Brute force'], correct: 1, difficulty: 'easy', topic: 'dp' },
        { id: 0, question: '0/1 Knapsack problem has complexity:', options: ['O(n)', 'O(nW)', 'O(2^n)', 'O(n log n)'], correct: 1, difficulty: 'medium', topic: 'dp' },
        { id: 0, question: 'Longest Common Subsequence uses:', options: ['1D table', '2D table', '3D table', 'No table'], correct: 1, difficulty: 'medium', topic: 'dp' },
        { id: 0, question: 'Coin Change minimum coins problem uses:', options: ['Greedy always', 'DP (BFS/tabulation)', 'Sorting', 'Binary search'], correct: 1, difficulty: 'medium', topic: 'dp' },
        { id: 0, question: 'Edit Distance between two strings uses:', options: ['1D array', '2D DP matrix', 'Trie', 'Stack'], correct: 1, difficulty: 'hard', topic: 'dp' },
        { id: 0, question: 'Matrix Chain Multiplication has complexity:', options: ['O(n²)', 'O(n³)', 'O(2^n)', 'O(n log n)'], correct: 1, difficulty: 'hard', topic: 'dp' },
    ],
    sorting: [
        { id: 0, question: 'What is the average time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correct: 1, difficulty: 'easy', topic: 'sorting' },
        { id: 0, question: 'Which sort is stable by default?', options: ['QuickSort', 'HeapSort', 'MergeSort', 'Selection Sort'], correct: 2, difficulty: 'easy', topic: 'sorting' },
        { id: 0, question: 'Binary Search requires the array to be:', options: ['Empty', 'Sorted', 'Reversed', 'Circular'], correct: 1, difficulty: 'easy', topic: 'sorting' },
        { id: 0, question: 'QuickSort worst case occurs when:', options: ['Array is random', 'Pivot is always min/max', 'Array is small', 'Array has duplicates'], correct: 1, difficulty: 'medium', topic: 'sorting' },
        { id: 0, question: 'Counting Sort works best when:', options: ['Data is floating point', 'Range of values is small', 'Data is random', 'Array is huge'], correct: 1, difficulty: 'medium', topic: 'sorting' },
        { id: 0, question: 'HeapSort has space complexity:', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correct: 1, difficulty: 'medium', topic: 'sorting' },
        { id: 0, question: 'Lower bound for comparison-based sorting is:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correct: 1, difficulty: 'hard', topic: 'sorting' },
        { id: 0, question: 'Radix Sort time complexity with d digits and base b is:', options: ['O(n log n)', 'O(d*(n+b))', 'O(n²)', 'O(n*d²)'], correct: 1, difficulty: 'hard', topic: 'sorting' },
    ],
    stacks: [
        { id: 0, question: 'Stack follows which principle?', options: ['FIFO', 'LIFO', 'Random', 'Priority'], correct: 1, difficulty: 'easy', topic: 'stacks' },
        { id: 0, question: 'Queue follows which principle?', options: ['LIFO', 'FIFO', 'Random', 'LIFO+FIFO'], correct: 1, difficulty: 'easy', topic: 'stacks' },
        { id: 0, question: 'Push and Pop on a stack are:', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correct: 1, difficulty: 'easy', topic: 'stacks' },
        { id: 0, question: 'Implementing a queue with two stacks — dequeue is:', options: ['Always O(1)', 'Amortized O(1)', 'O(n) always', 'O(log n)'], correct: 1, difficulty: 'medium', topic: 'stacks' },
        { id: 0, question: 'Next Greater Element problem uses:', options: ['Queue', 'Monotonic stack', 'Heap', 'BST'], correct: 1, difficulty: 'medium', topic: 'stacks' },
        { id: 0, question: 'A deque supports operations at:', options: ['Front only', 'Back only', 'Both ends', 'Middle'], correct: 2, difficulty: 'medium', topic: 'stacks' },
        { id: 0, question: 'Largest Rectangle in Histogram uses:', options: ['Brute force O(n²)', 'Stack-based O(n)', 'Sorting O(n log n)', 'DP O(n²)'], correct: 1, difficulty: 'hard', topic: 'stacks' },
        { id: 0, question: 'Min stack with O(1) getMin uses:', options: ['Sorted array', 'Two stacks', 'Heap', 'BST'], correct: 1, difficulty: 'hard', topic: 'stacks' },
    ],
    'binary-search': [
        { id: 0, question: 'Binary Search has time complexity:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, difficulty: 'easy', topic: 'binary-search' },
        { id: 0, question: 'Binary Search requires:', options: ['Unsorted array', 'Sorted array', 'Linked list', 'Graph'], correct: 1, difficulty: 'easy', topic: 'binary-search' },
        { id: 0, question: 'Lower bound in binary search finds:', options: ['Exact match', 'First position >= target', 'Last position', 'Count'], correct: 1, difficulty: 'easy', topic: 'binary-search' },
        { id: 0, question: 'Searching in a rotated sorted array takes:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct: 1, difficulty: 'medium', topic: 'binary-search' },
        { id: 0, question: 'Binary search on answer (parametric search) is used for:', options: ['Sorting', 'Optimization problems', 'Graph traversal', 'String matching'], correct: 1, difficulty: 'medium', topic: 'binary-search' },
        { id: 0, question: 'Finding peak element in array uses:', options: ['Linear scan only', 'Modified binary search', 'Sorting', 'Stack'], correct: 1, difficulty: 'medium', topic: 'binary-search' },
        { id: 0, question: 'Median of two sorted arrays optimally:', options: ['Merge then find O(n+m)', 'Binary search O(log(min(n,m)))', 'Sort all O(n log n)', 'Heap O(n)'], correct: 1, difficulty: 'hard', topic: 'binary-search' },
        { id: 0, question: 'Aggressive cows / Book allocation is solved by:', options: ['Greedy', 'Binary search on answer', 'DP', 'BFS'], correct: 1, difficulty: 'hard', topic: 'binary-search' },
    ],
    heap: [
        { id: 0, question: 'A min-heap root contains:', options: ['Maximum', 'Minimum', 'Median', 'Random'], correct: 1, difficulty: 'easy', topic: 'heap' },
        { id: 0, question: 'Insert into a heap takes:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 1, difficulty: 'easy', topic: 'heap' },
        { id: 0, question: 'Heapify an array takes:', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 1, difficulty: 'easy', topic: 'heap' },
        { id: 0, question: 'Kth largest element can be found using:', options: ['Min-heap of size k', 'Max-heap', 'Sorting only', 'Stack'], correct: 0, difficulty: 'medium', topic: 'heap' },
        { id: 0, question: 'Priority Queue is typically implemented with:', options: ['Array', 'Linked List', 'Binary Heap', 'BST'], correct: 2, difficulty: 'medium', topic: 'heap' },
        { id: 0, question: 'Top K frequent elements uses:', options: ['Sorting O(n log n)', 'Heap O(n log k)', 'Both work', 'Neither'], correct: 2, difficulty: 'medium', topic: 'heap' },
        { id: 0, question: 'Merge K sorted lists optimally uses:', options: ['Array merge', 'Min-heap of size K', 'Max-heap', 'Stack'], correct: 1, difficulty: 'hard', topic: 'heap' },
        { id: 0, question: 'Running median uses:', options: ['Sorted array', 'Two heaps (max + min)', 'Single heap', 'BST only'], correct: 1, difficulty: 'hard', topic: 'heap' },
    ],
    greedy: [
        { id: 0, question: 'Greedy algorithms make decisions that are:', options: ['Globally optimal always', 'Locally optimal at each step', 'Random', 'Exhaustive'], correct: 1, difficulty: 'easy', topic: 'greedy' },
        { id: 0, question: 'Activity Selection problem is solved by:', options: ['DP only', 'Greedy (sort by end time)', 'Backtracking', 'BFS'], correct: 1, difficulty: 'easy', topic: 'greedy' },
        { id: 0, question: 'Huffman Coding uses greedy for:', options: ['Sorting', 'Optimal prefix codes', 'Graph traversal', 'Searching'], correct: 1, difficulty: 'easy', topic: 'greedy' },
        { id: 0, question: 'Fractional Knapsack differs from 0/1 by:', options: ['Using DP', 'Allowing item fractions', 'Being NP-hard', 'No difference'], correct: 1, difficulty: 'medium', topic: 'greedy' },
        { id: 0, question: 'Jump Game can be solved greedily by tracking:', options: ['Total jumps', 'Maximum reachable index', 'Minimum energy', 'Path count'], correct: 1, difficulty: 'medium', topic: 'greedy' },
        { id: 0, question: 'Minimum platforms at a railway station uses:', options: ['DP', 'Sorting + greedy', 'BFS', 'Backtracking'], correct: 1, difficulty: 'medium', topic: 'greedy' },
        { id: 0, question: 'Job Sequencing with deadlines maximizes profit using:', options: ['FIFO', 'Sort by profit, greedy assign', 'Random', 'BFS'], correct: 1, difficulty: 'hard', topic: 'greedy' },
        { id: 0, question: 'Minimum spanning tree (Kruskal\'s) uses:', options: ['BFS', 'Greedy + Union-Find', 'DFS only', 'DP'], correct: 1, difficulty: 'hard', topic: 'greedy' },
    ],
    backtracking: [
        { id: 0, question: 'Backtracking explores solutions by:', options: ['Greedy choices', 'Building candidates and abandoning if invalid', 'Random sampling', 'DP tables'], correct: 1, difficulty: 'easy', topic: 'backtracking' },
        { id: 0, question: 'N-Queens problem is solved using:', options: ['Greedy', 'Backtracking', 'DP', 'BFS'], correct: 1, difficulty: 'easy', topic: 'backtracking' },
        { id: 0, question: 'Backtracking is a form of:', options: ['BFS', 'DFS with pruning', 'Greedy', 'Divide & conquer'], correct: 1, difficulty: 'easy', topic: 'backtracking' },
        { id: 0, question: 'Generating all subsets has complexity:', options: ['O(n)', 'O(n²)', 'O(2^n)', 'O(n!)'], correct: 2, difficulty: 'medium', topic: 'backtracking' },
        { id: 0, question: 'Sudoku solver uses:', options: ['Greedy', 'Backtracking', 'Sorting', 'BFS'], correct: 1, difficulty: 'medium', topic: 'backtracking' },
        { id: 0, question: 'Permutations of n elements total:', options: ['2^n', 'n!', 'n²', 'n*2'], correct: 1, difficulty: 'medium', topic: 'backtracking' },
        { id: 0, question: 'Word Search in a grid uses:', options: ['DP', 'Backtracking + DFS', 'BFS only', 'Sorting'], correct: 1, difficulty: 'hard', topic: 'backtracking' },
        { id: 0, question: 'Combination Sum with duplicates needs:', options: ['No special handling', 'Sorting + skip duplicates', 'Hash set', 'BFS'], correct: 1, difficulty: 'hard', topic: 'backtracking' },
    ],
    'bit-manipulation': [
        { id: 0, question: 'x & 1 checks if x is:', options: ['Positive', 'Odd', 'Power of 2', 'Zero'], correct: 1, difficulty: 'easy', topic: 'bit-manipulation' },
        { id: 0, question: 'x & (x-1) removes the:', options: ['MSB', 'Rightmost set bit', 'All bits', 'LSB'], correct: 1, difficulty: 'easy', topic: 'bit-manipulation' },
        { id: 0, question: 'XOR of a number with itself gives:', options: ['The number', '0', '1', '-1'], correct: 1, difficulty: 'easy', topic: 'bit-manipulation' },
        { id: 0, question: 'Left shift x << 1 is equivalent to:', options: ['x/2', 'x*2', 'x+1', 'x-1'], correct: 1, difficulty: 'medium', topic: 'bit-manipulation' },
        { id: 0, question: 'Finding single number in array where others appear twice:', options: ['Sorting', 'XOR all elements', 'Hash map', 'Both B and C'], correct: 3, difficulty: 'medium', topic: 'bit-manipulation' },
        { id: 0, question: 'n & (n-1) == 0 checks if n is:', options: ['Even', 'Odd', 'Power of 2', 'Negative'], correct: 2, difficulty: 'medium', topic: 'bit-manipulation' },
        { id: 0, question: 'Counting set bits in O(k) where k = set bits uses:', options: ['Right shift loop', 'Brian Kernighan\'s algorithm', 'Lookup table', 'All of the above'], correct: 1, difficulty: 'hard', topic: 'bit-manipulation' },
        { id: 0, question: 'Two numbers appearing once (others twice) can be found using:', options: ['Sorting', 'XOR + partitioning by set bit', 'Hash map only', 'Brute force'], correct: 1, difficulty: 'hard', topic: 'bit-manipulation' },
    ],
    // ─── CS SUBJECTS ──────────────────────────────────────
    os: [
        { id: 0, question: 'Which is NOT a function of an Operating System?', options: ['Memory management', 'Process management', 'Compiling code', 'File management'], correct: 2, difficulty: 'easy', topic: 'os' },
        { id: 0, question: 'A process in "ready" state is waiting for:', options: ['I/O', 'CPU allocation', 'Memory', 'Termination'], correct: 1, difficulty: 'easy', topic: 'os' },
        { id: 0, question: 'What is a thread?', options: ['A separate process', 'Lightweight process sharing memory', 'A file', 'A device'], correct: 1, difficulty: 'easy', topic: 'os' },
        { id: 0, question: 'Which scheduling algorithm can cause starvation?', options: ['Round Robin', 'FCFS', 'Priority Scheduling', 'SJF'], correct: 2, difficulty: 'medium', topic: 'os' },
        { id: 0, question: 'Deadlock requires all four conditions. Which is NOT one?', options: ['Mutual Exclusion', 'Hold & Wait', 'Preemption', 'Circular Wait'], correct: 2, difficulty: 'medium', topic: 'os' },
        { id: 0, question: 'Page replacement algorithm LRU stands for:', options: ['Least Recently Updated', 'Least Recently Used', 'Last Replaced Unit', 'Longest Running Utility'], correct: 1, difficulty: 'medium', topic: 'os' },
        { id: 0, question: 'Belady\'s anomaly occurs in which page replacement?', options: ['LRU', 'Optimal', 'FIFO', 'Clock'], correct: 2, difficulty: 'hard', topic: 'os' },
        { id: 0, question: 'The Banker\'s algorithm prevents:', options: ['Starvation', 'Deadlock', 'Race conditions', 'Thrashing'], correct: 1, difficulty: 'hard', topic: 'os' },
    ],
    cn: [
        { id: 0, question: 'How many layers does the OSI model have?', options: ['5', '6', '7', '4'], correct: 2, difficulty: 'easy', topic: 'cn' },
        { id: 0, question: 'HTTP operates at which OSI layer?', options: ['Transport', 'Network', 'Application', 'Data Link'], correct: 2, difficulty: 'easy', topic: 'cn' },
        { id: 0, question: 'IP address belongs to which layer?', options: ['Application', 'Transport', 'Network', 'Physical'], correct: 2, difficulty: 'easy', topic: 'cn' },
        { id: 0, question: 'TCP is connection-oriented. UDP is:', options: ['Also connection-oriented', 'Connectionless', 'Not a protocol', 'Session layer'], correct: 1, difficulty: 'medium', topic: 'cn' },
        { id: 0, question: 'Subnetting is used to:', options: ['Encrypt data', 'Divide a network into sub-networks', 'Speed up routing', 'Compress packets'], correct: 1, difficulty: 'medium', topic: 'cn' },
        { id: 0, question: 'DNS translates:', options: ['IP to MAC', 'Domain names to IP', 'Ports to services', 'None'], correct: 1, difficulty: 'medium', topic: 'cn' },
        { id: 0, question: 'In TCP, what ensures reliable delivery?', options: ['Checksums only', 'ACK + retransmission + sequence numbers', 'Encryption', 'Compression'], correct: 1, difficulty: 'hard', topic: 'cn' },
        { id: 0, question: 'BGP is used for:', options: ['Local routing', 'Inter-domain routing', 'Email delivery', 'DNS resolution'], correct: 1, difficulty: 'hard', topic: 'cn' },
    ],
    dbms: [
        { id: 0, question: 'SQL stands for:', options: ['Simple Query Language', 'Structured Query Language', 'Standard Query Logic', 'System Query Language'], correct: 1, difficulty: 'easy', topic: 'dbms' },
        { id: 0, question: 'Primary key must be:', options: ['Nullable', 'Unique and NOT NULL', 'Repeated', 'Foreign'], correct: 1, difficulty: 'easy', topic: 'dbms' },
        { id: 0, question: 'Which is a DDL command?', options: ['SELECT', 'INSERT', 'CREATE', 'UPDATE'], correct: 2, difficulty: 'easy', topic: 'dbms' },
        { id: 0, question: 'ACID properties ensure:', options: ['Speed', 'Transaction reliability', 'Security', 'Backup'], correct: 1, difficulty: 'medium', topic: 'dbms' },
        { id: 0, question: 'Third Normal Form (3NF) removes:', options: ['Partial dependency', 'Transitive dependency', 'Multi-valued dependency', 'All redundancy'], correct: 1, difficulty: 'medium', topic: 'dbms' },
        { id: 0, question: 'B+ Tree indexing provides search in:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 1, difficulty: 'medium', topic: 'dbms' },
        { id: 0, question: 'Two-phase locking ensures:', options: ['Deadlock freedom', 'Serializability', 'Speed', 'Recovery'], correct: 1, difficulty: 'hard', topic: 'dbms' },
        { id: 0, question: 'CAP theorem states a distributed system can guarantee at most:', options: ['1 property', '2 of 3 properties', 'All 3', 'None'], correct: 1, difficulty: 'hard', topic: 'dbms' },
    ],
    oops: [
        { id: 0, question: 'Encapsulation means:', options: ['Inheriting behavior', 'Hiding internal details', 'Overriding methods', 'Creating objects'], correct: 1, difficulty: 'easy', topic: 'oops' },
        { id: 0, question: 'Polymorphism allows:', options: ['Multiple forms of a method', 'Single inheritance only', 'No abstraction', 'Global variables'], correct: 0, difficulty: 'easy', topic: 'oops' },
        { id: 0, question: 'An abstract class can:', options: ['Be instantiated', 'Have abstract and concrete methods', 'Only have abstract methods', 'Replace interfaces'], correct: 1, difficulty: 'easy', topic: 'oops' },
        { id: 0, question: 'SOLID — "S" stands for:', options: ['Simple', 'Single Responsibility', 'Structured', 'Scalable'], correct: 1, difficulty: 'medium', topic: 'oops' },
        { id: 0, question: 'Composition over inheritance means:', options: ['Always use inheritance', 'Prefer "has-a" over "is-a"', 'Avoid both', 'Use global functions'], correct: 1, difficulty: 'medium', topic: 'oops' },
        { id: 0, question: 'Factory Pattern is used to:', options: ['Create objects without specifying class', 'Sort data', 'Manage threads', 'Cache data'], correct: 0, difficulty: 'medium', topic: 'oops' },
        { id: 0, question: 'Liskov Substitution Principle states:', options: ['Use abstractions', 'Subtypes must be substitutable for base types', 'Depend on interfaces', 'Single responsibility'], correct: 1, difficulty: 'hard', topic: 'oops' },
        { id: 0, question: 'Observer Pattern is useful for:', options: ['Caching', 'Event handling / pub-sub', 'Sorting', 'Memory management'], correct: 1, difficulty: 'hard', topic: 'oops' },
    ],
    'system-design': [
        { id: 0, question: 'Horizontal scaling means:', options: ['Bigger machine', 'More machines', 'Faster CPU', 'More RAM'], correct: 1, difficulty: 'easy', topic: 'system-design' },
        { id: 0, question: 'A load balancer distributes:', options: ['Data', 'Traffic across servers', 'Memory', 'Files'], correct: 1, difficulty: 'easy', topic: 'system-design' },
        { id: 0, question: 'CDN stands for:', options: ['Central Data Network', 'Content Delivery Network', 'Cloud Data Node', 'Core Distribution Network'], correct: 1, difficulty: 'easy', topic: 'system-design' },
        { id: 0, question: 'Caching reduces:', options: ['Security', 'Latency and DB load', 'Storage', 'Bandwidth'], correct: 1, difficulty: 'medium', topic: 'system-design' },
        { id: 0, question: 'Database sharding splits data by:', options: ['Color', 'Partition key', 'Random', 'Time only'], correct: 1, difficulty: 'medium', topic: 'system-design' },
        { id: 0, question: 'Message queues (Kafka, RabbitMQ) enable:', options: ['Synchronous only', 'Asynchronous decoupled processing', 'Direct DB access', 'File storage'], correct: 1, difficulty: 'medium', topic: 'system-design' },
        { id: 0, question: 'Consistent hashing is used in:', options: ['Sorting', 'Distributed caching/storage', 'Compression', 'Encryption'], correct: 1, difficulty: 'hard', topic: 'system-design' },
        { id: 0, question: 'Rate limiting protects against:', options: ['SQL injection', 'DDoS / abuse', 'Data loss', 'Slow queries'], correct: 1, difficulty: 'hard', topic: 'system-design' },
    ],
    security: [
        { id: 0, question: 'HTTPS uses which protocol for encryption?', options: ['FTP', 'SSL/TLS', 'SSH', 'SMTP'], correct: 1, difficulty: 'easy', topic: 'security' },
        { id: 0, question: 'SQL Injection exploits:', options: ['CSS styles', 'Unsanitized database queries', 'Network packets', 'File uploads'], correct: 1, difficulty: 'easy', topic: 'security' },
        { id: 0, question: 'Hashing is:', options: ['Reversible encryption', 'One-way function', 'Symmetric encryption', 'Key exchange'], correct: 1, difficulty: 'easy', topic: 'security' },
        { id: 0, question: 'XSS stands for:', options: ['Cross-Site Scripting', 'XML Script Standard', 'Extra Secure Socket', 'Cross-Server Sync'], correct: 0, difficulty: 'medium', topic: 'security' },
        { id: 0, question: 'CSRF attacks trick a user into:', options: ['Downloading malware', 'Performing unintended actions', 'Sharing passwords', 'Hacking DNS'], correct: 1, difficulty: 'medium', topic: 'security' },
        { id: 0, question: 'JWT tokens are used for:', options: ['File compression', 'Stateless authentication', 'Database queries', 'CSS styling'], correct: 1, difficulty: 'medium', topic: 'security' },
        { id: 0, question: 'Public-key cryptography uses:', options: ['One key', 'Two keys (public + private)', 'No keys', 'Shared secret only'], correct: 1, difficulty: 'hard', topic: 'security' },
        { id: 0, question: 'OWASP Top 10 is a list of:', options: ['Programming languages', 'Web application security risks', 'Database engines', 'OS vulnerabilities'], correct: 1, difficulty: 'hard', topic: 'security' },
    ],
    compiler: [
        { id: 0, question: 'The first phase of a compiler is:', options: ['Parsing', 'Lexical Analysis', 'Optimization', 'Code Generation'], correct: 1, difficulty: 'easy', topic: 'compiler' },
        { id: 0, question: 'A token is the output of:', options: ['Parser', 'Lexer/Scanner', 'Optimizer', 'Linker'], correct: 1, difficulty: 'easy', topic: 'compiler' },
        { id: 0, question: 'A parse tree represents:', options: ['Machine code', 'Syntactic structure', 'Memory layout', 'Network flow'], correct: 1, difficulty: 'easy', topic: 'compiler' },
        { id: 0, question: 'Context-Free Grammar is used in which phase?', options: ['Lexical analysis', 'Syntax analysis', 'Semantic analysis', 'Code generation'], correct: 1, difficulty: 'medium', topic: 'compiler' },
        { id: 0, question: 'LR parsing is:', options: ['Top-down', 'Bottom-up', 'Random', 'Neither'], correct: 1, difficulty: 'medium', topic: 'compiler' },
        { id: 0, question: 'Semantic analysis checks:', options: ['Syntax errors', 'Type errors and meaning', 'Lexical errors', 'Runtime errors'], correct: 1, difficulty: 'medium', topic: 'compiler' },
        { id: 0, question: 'Three-address code is a form of:', options: ['Source code', 'Intermediate representation', 'Machine code', 'Assembly'], correct: 1, difficulty: 'hard', topic: 'compiler' },
        { id: 0, question: 'Register allocation is an NP-hard problem solved by:', options: ['Brute force', 'Graph coloring heuristics', 'Sorting', 'Hashing'], correct: 1, difficulty: 'hard', topic: 'compiler' },
    ],
    toc: [
        { id: 0, question: 'A DFA has how many transitions per input symbol per state?', options: ['0 or more', 'Exactly 1', '2', 'Unlimited'], correct: 1, difficulty: 'easy', topic: 'toc' },
        { id: 0, question: 'Regular expressions define which type of languages?', options: ['Context-free', 'Regular', 'Recursive', 'Context-sensitive'], correct: 1, difficulty: 'easy', topic: 'toc' },
        { id: 0, question: 'A Turing Machine has:', options: ['Finite tape', 'Infinite tape', 'No tape', 'Stack only'], correct: 1, difficulty: 'easy', topic: 'toc' },
        { id: 0, question: 'Pumping Lemma is used to prove a language is:', options: ['Regular', 'NOT regular', 'Context-free', 'Decidable'], correct: 1, difficulty: 'medium', topic: 'toc' },
        { id: 0, question: 'Context-free languages are recognized by:', options: ['DFA', 'Pushdown Automata', 'Turing Machine only', 'Finite Automata'], correct: 1, difficulty: 'medium', topic: 'toc' },
        { id: 0, question: 'NFA can be converted to DFA using:', options: ['Minimization', 'Subset construction', 'Pumping', 'Reduction'], correct: 1, difficulty: 'medium', topic: 'toc' },
        { id: 0, question: 'The Halting Problem is:', options: ['Decidable', 'Undecidable', 'Regular', 'Context-free'], correct: 1, difficulty: 'hard', topic: 'toc' },
        { id: 0, question: 'P vs NP asks whether:', options: ['All problems are solvable', 'Problems verifiable in poly time are also solvable in poly time', 'NP = PSPACE', 'P = EXP'], correct: 1, difficulty: 'hard', topic: 'toc' },
    ],
};

/**
 * Generate MCQs distributed evenly across all selected topics.
 * Total is always 15 MCQs. Each topic gets floor(15/n) questions,
 * remainder questions go to the first topics round-robin.
 */
function generateMCQsFromTopics(selectedTopics: string[]): MCQ[] {
    const topics = selectedTopics.length > 0 ? selectedTopics : ['arrays'];
    const totalMCQs = 15;
    const perTopic = Math.floor(totalMCQs / topics.length);
    let remainder = totalMCQs % topics.length;

    const result: MCQ[] = [];
    topics.forEach(topic => {
        const bank = ALL_MCQ_BANKS[topic] || ALL_MCQ_BANKS['arrays'];
        const count = perTopic + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        // Pick 'count' questions from bank (shuffle then slice)
        const shuffled = [...bank].sort(() => Math.random() - 0.5);
        result.push(...shuffled.slice(0, Math.min(count, shuffled.length)));
    });

    // Re-assign sequential IDs and return
    return result.map((q, i) => ({ ...q, id: i + 1 }));
}

function generateCodingQs(topic: string): CodingQ[] {
    return [
        {
            id: 1, title: 'Two Sum', difficulty: 'easy', topic,
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
            examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
            constraints: '2 <= nums.length <= 10⁴\n-10⁹ <= nums[i] <= 10⁹',
            testCases: [
                { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
                { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' },
                { input: 'nums = [3,3], target = 6', expected: '[0, 1]' },
            ],
            starterCodes: {
                python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
                javascript: 'function twoSum(nums, target) {\n    // Write your solution here\n    return [];\n}',
                java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}',
                cpp: '#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}',
            },
        },
        {
            id: 2, title: 'Container With Most Water', difficulty: 'medium', topic,
            description: 'Given n non-negative integers a1, a2, ..., an where each represents a point at coordinate (i, ai). Find two lines that together with x-axis forms a container that holds the most water.',
            examples: 'Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49',
            constraints: 'n >= 2\n0 <= height[i] <= 10⁴',
            testCases: [
                { input: 'height = [1,8,6,2,5,4,8,3,7]', expected: '49' },
                { input: 'height = [1,1]', expected: '1' },
                { input: 'height = [4,3,2,1,4]', expected: '16' },
            ],
            starterCodes: {
                python: 'def max_area(height):\n    # Write your solution here\n    pass',
                javascript: 'function maxArea(height) {\n    // Write your solution here\n    return 0;\n}',
                java: 'class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}',
                cpp: '#include <vector>\nusing namespace std;\n\nint maxArea(vector<int>& height) {\n    // Write your solution here\n    return 0;\n}',
            },
        },
        {
            id: 3, title: '3Sum', difficulty: 'medium', topic,
            description: 'Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0.',
            examples: 'Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]',
            constraints: '3 <= nums.length <= 3000',
            testCases: [
                { input: 'nums = [-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' },
                { input: 'nums = [0,1,1]', expected: '[]' },
                { input: 'nums = [0,0,0]', expected: '[[0,0,0]]' },
            ],
            starterCodes: {
                python: 'def three_sum(nums):\n    # Write your solution here\n    pass',
                javascript: 'function threeSum(nums) {\n    // Write your solution here\n    return [];\n}',
                java: 'import java.util.*;\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}',
                cpp: '#include <vector>\nusing namespace std;\n\nvector<vector<int>> threeSum(vector<int>& nums) {\n    // Write your solution here\n    return {};\n}',
            },
        },
        {
            id: 4, title: 'Trapping Rain Water', difficulty: 'hard', topic,
            description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
            examples: 'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6',
            constraints: 'n == height.length\n1 <= n <= 2 * 10⁴',
            testCases: [
                { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
                { input: 'height = [4,2,0,3,2,5]', expected: '9' },
                { input: 'height = [1,0,1]', expected: '1' },
            ],
            starterCodes: {
                python: 'def trap(height):\n    # Write your solution here\n    pass',
                javascript: 'function trap(height) {\n    // Write your solution here\n    return 0;\n}',
                java: 'class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}',
                cpp: '#include <vector>\nusing namespace std;\n\nint trap(vector<int>& height) {\n    // Write your solution here\n    return 0;\n}',
            },
        },
        {
            id: 5, title: 'First Missing Positive', difficulty: 'hard', topic,
            description: 'Given an unsorted integer array nums, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.',
            examples: 'Input: nums = [3,4,-1,1]\nOutput: 2',
            constraints: '1 <= nums.length <= 10⁵',
            testCases: [
                { input: 'nums = [3,4,-1,1]', expected: '2' },
                { input: 'nums = [1,2,0]', expected: '3' },
                { input: 'nums = [7,8,9,11,12]', expected: '1' },
            ],
            starterCodes: {
                python: 'def first_missing_positive(nums):\n    # Write your solution here\n    pass',
                javascript: 'function firstMissingPositive(nums) {\n    // Write your solution here\n    return 0;\n}',
                java: 'class Solution {\n    public int firstMissingPositive(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}',
                cpp: '#include <vector>\nusing namespace std;\n\nint firstMissingPositive(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}',
            },
        },
    ];
}

/* Voice interview questions — large pool organized by category */
const VOICE_QUESTION_POOL: Record<string, string[]> = {
    behavioral: [
        'Tell me about a time you solved a complex technical problem. What was your approach?',
        'Describe a situation where you had to meet a tight deadline. How did you manage it?',
        'Tell me about a time you failed at something. What did you learn from it?',
        'Give an example of when you took initiative on a project without being asked.',
        'Describe a time when you received critical feedback. How did you respond?',
        'Tell me about a challenging bug you fixed. Walk me through your debugging process.',
        'Describe a situation where you had to make a difficult decision with limited information.',
        'Tell me about a time when you went above and beyond what was expected of you.',
        'Share an experience where you had to adapt to a significant change at work.',
        'Describe a time you had to convince someone to adopt your technical approach.',
    ],
    technical: [
        'How would you explain the concept of microservices to a non-technical person?',
        'What are the trade-offs between SQL and NoSQL databases for a new project?',
        'How do you ensure code quality in your projects? What practices do you follow?',
        'Explain the difference between REST and GraphQL. When would you choose one over the other?',
        'How do you approach system design for a feature that needs to handle millions of users?',
        'What is your understanding of CI/CD pipelines and why are they important?',
        'How would you design an API rate limiter? Walk me through your thought process.',
        'Explain the CAP theorem and how it affects distributed system design decisions.',
        'What strategies do you use for managing technical debt in a fast-moving codebase?',
        'How do you approach performance optimization in a web application?',
    ],
    problemSolving: [
        'What is your process for debugging a production issue under time pressure?',
        'How do you break down a large, ambiguous problem into manageable tasks?',
        'Describe your approach to optimizing a slow database query in production.',
        'How would you handle discovering a critical security vulnerability right before a release?',
        'Walk me through how you would investigate a memory leak in a production application.',
        'If you were given a codebase with no documentation, how would you get started understanding it?',
        'How do you decide between building a custom solution versus using a third-party library?',
        'Describe how you would approach migrating a monolithic application to microservices.',
        'How do you prioritize multiple urgent bugs that are reported simultaneously?',
        'What would you do if your proposed solution was rejected by the team lead? How would you respond?',
    ],
    teamwork: [
        'How do you handle disagreements with teammates about technical decisions?',
        'Describe a project where you collaborated with cross-functional teams.',
        'How do you approach code reviews? What do you look for and how do you give feedback?',
        'Tell me about a time you mentored a junior developer. What was the outcome?',
        'How do you handle a situation where a teammate is not pulling their weight?',
        'Describe a time when you had to work with someone whose communication style was very different from yours.',
        'How do you share knowledge with your team to prevent knowledge silos?',
        'Tell me about a time you had to resolve a conflict within your team.',
        'How do you onboard new team members effectively on a complex project?',
        'Describe a situation where you had to compromise on a technical decision for the teams benefit.',
    ],
    career: [
        'Where do you see yourself in 5 years as a software engineer?',
        'What motivates you to keep learning new technologies?',
        'How do you stay updated with the latest trends and developments in software engineering?',
        'What kind of engineering culture do you thrive in and why?',
        'What is the most impactful project you have worked on, and why was it meaningful to you?',
        'What areas of software engineering are you most passionate about and want to grow in?',
        'How do you balance depth of expertise in one area with breadth across multiple technologies?',
        'What would your ideal engineering role look like in terms of responsibilities?',
        'How do you measure your own growth and success as a software engineer?',
        'If you could work on any open-source project, which would it be and why?',
    ],
    situational: [
        'If you discovered that a feature you shipped last week is causing data corruption, what would you do?',
        'Your team is behind schedule on a critical project. How would you approach this situation?',
        'A stakeholder is pushing for a feature that you believe is technically infeasible in the given timeline. How do you handle it?',
        'You are asked to take over a legacy codebase with no tests. What is your first step?',
        'How would you handle a situation where two senior engineers on your team disagree about the architecture?',
        'You have been assigned to a project using a technology stack you have never worked with before. What do you do?',
        'A production deployment you pushed just caused a major outage. Walk me through your immediate actions.',
        'Your manager asks you to cut corners to deliver faster. How do you respond?',
        'You realized your code accidentally exposed user PII in logs. What steps would you take?',
        'A client reported that the application is significantly slower than it was a month ago. How would you investigate?',
    ],
};

/** Pick `count` unique random voice interview questions from different categories */
function generateVoiceQuestions(count: number = 5): string[] {
    const categories = Object.keys(VOICE_QUESTION_POOL);
    const selected: string[] = [];
    // Shuffle categories
    const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
    // Pick one question from each category until we have enough
    for (let i = 0; i < count; i++) {
        const cat = shuffledCats[i % shuffledCats.length];
        const pool = VOICE_QUESTION_POOL[cat];
        // Pick a random question that hasn't been selected yet
        const available = pool.filter(q => !selected.includes(q));
        if (available.length > 0) {
            selected.push(available[Math.floor(Math.random() * available.length)]);
        }
    }
    return selected;
}

/* ================================================================== */
/*  SCORING                                                            */
/* ================================================================== */
const MCQ_POINTS: Record<string, number> = { easy: 3, medium: 4, hard: 5 };
const CODING_POINTS: Record<string, number> = { easy: 4, medium: 8, hard: 10 };

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function MockInterviewPage() {
    const { user, loadUser, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Phase state: 'select' | 'test' | 'voice' | 'results'
    const [phase, setPhase] = useState<'select' | 'test' | 'voice' | 'results'>('select');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // Test state
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [codingQs, setCodingQs] = useState<CodingQ[]>([]);
    const [currentQ, setCurrentQ] = useState(0); // 0-14 = MCQ, 15-19 = Coding
    const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
    const [codingAnswers, setCodingAnswers] = useState<Record<number, string>>({});
    const [codingLangs, setCodingLangs] = useState<Record<number, string>>({});
    const [compileOutput, setCompileOutput] = useState<Record<number, { lines: string[]; status: 'idle' | 'running' | 'pass' | 'fail' | 'error' }>>({});
    const [codingSubmitted, setCodingSubmitted] = useState<Record<number, boolean>>({});
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
    const [testSubmitted, setTestSubmitted] = useState(false);

    // Proctoring
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [proctorMsg, setProctorMsg] = useState('');
    const lastFaceTime = useRef(Date.now());
    const proctorInterval = useRef<NodeJS.Timeout | null>(null);

    // Voice interview
    const [voiceQ, setVoiceQ] = useState(0);
    const [voiceQuestions, setVoiceQuestions] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voiceAnswers, setVoiceAnswers] = useState<string[]>([]);
    const [voiceScores, setVoiceScores] = useState<number[]>([]);
    const recognitionRef = useRef<any>(null);

    // Results
    const [mcqScore, setMcqScore] = useState(0);
    const [codingScore, setCodingScore] = useState(0);
    const [voiceTotalScore, setVoiceTotalScore] = useState(0);

    useEffect(() => { loadUser().then(() => setLoading(false)); }, []);
    useEffect(() => { if (!loading && !isAuthenticated) router.push('/auth/login'); }, [loading, isAuthenticated]);

    /* ---- Timer ---- */
    useEffect(() => {
        if (phase !== 'test' || testSubmitted) return;
        if (timeLeft <= 0) { handleSubmitTest(); return; }
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [phase, timeLeft, testSubmitted]);

    /* ---- Camera ---- */
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; }
            setCameraActive(true);
            startProctoring();
        } catch { setCameraActive(false); }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) { videoRef.current.srcObject = null; }
        if (proctorInterval.current) { clearInterval(proctorInterval.current); proctorInterval.current = null; }
        setCameraActive(false);
    };

    // Cleanup camera on component unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (proctorInterval.current) { clearInterval(proctorInterval.current); }
        };
    }, []);

    /* ---- Proctoring (canvas-based face detection) ---- */
    const startProctoring = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        proctorInterval.current = setInterval(() => {
            if (!videoRef.current || !ctx) return;
            canvas.width = videoRef.current.videoWidth || 320;
            canvas.height = videoRef.current.videoHeight || 240;
            ctx.drawImage(videoRef.current, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            // Simple skin-color detection in center region
            const cx = Math.floor(canvas.width / 2);
            const cy = Math.floor(canvas.height / 2);
            const regionSize = 80;
            let skinPixels = 0;
            let totalPixels = 0;
            for (let y = cy - regionSize; y < cy + regionSize; y++) {
                for (let x = cx - regionSize; x < cx + regionSize; x++) {
                    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
                    const idx = (y * canvas.width + x) * 4;
                    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                    // Basic skin color detection
                    if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15 && r - b > 15) {
                        skinPixels++;
                    }
                    totalPixels++;
                }
            }
            const ratio = skinPixels / totalPixels;
            if (ratio > 0.15) {
                lastFaceTime.current = Date.now();
            } else {
                const elapsed = Date.now() - lastFaceTime.current;
                if (elapsed > 3000) { // 3 seconds of no face
                    triggerWarning();
                }
            }
        }, 2000);
    };

    const triggerWarning = () => {
        setWarnings(prev => {
            const next = prev + 1;
            if (next >= 2) {
                setProctorMsg('⚠️ Multiple violations detected. Test is being auto-submitted.');
                setShowWarning(true);
                setTimeout(() => handleSubmitTest(), 2000);
            } else {
                setProctorMsg('⚠️ Warning: Please look at the screen. Your test will be auto-submitted on the next violation.');
                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 4000);
            }
            return next;
        });
    };

    /* ---- Start test ---- */
    const toggleTopic = (id: string) => {
        setSelectedTopics(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const startTest = () => {
        const primaryTopic = selectedTopics.find(id => DSA_TOPICS.map(t => t.id).includes(id)) || selectedTopics[0] || 'arrays';
        const m = generateMCQsFromTopics(selectedTopics);
        const c = generateCodingQs(primaryTopic);
        setMcqs(m);
        setCodingQs(c);
        setMcqAnswers({});
        setCodingAnswers(Object.fromEntries(c.map(q => [q.id, q.starterCodes['python']])));
        setCodingLangs(Object.fromEntries(c.map(q => [q.id, 'python'])));
        setCompileOutput({});
        setCodingSubmitted({});
        setCurrentQ(0);
        setTimeLeft(45 * 60);
        // Reset proctoring state fully
        setWarnings(0);
        setShowWarning(false);
        setProctorMsg('');
        lastFaceTime.current = Date.now();
        setTestSubmitted(false);
        setPhase('test');
        startCamera();
    };

    /* ---- Submit test ---- */
    const handleSubmitTest = () => {
        if (testSubmitted) return;
        setTestSubmitted(true);
        stopCamera();
        // Calculate MCQ score
        let mScore = 0;
        mcqs.forEach(q => {
            if (mcqAnswers[q.id] === q.correct) {
                mScore += MCQ_POINTS[q.difficulty];
            }
        });
        setMcqScore(mScore);
        // Coding score: give partial credit based on answer length (demo)
        let cScore = 0;
        codingQs.forEach(q => {
            const answer = codingAnswers[q.id] || '';
            const isSubmitted = codingSubmitted[q.id];
            const compileResult = compileOutput[q.id];
            if (isSubmitted && compileResult?.status === 'pass') {
                cScore += CODING_POINTS[q.difficulty];
            } else if (answer.length > (q.starterCodes['python']?.length || 0) + 20) {
                cScore += CODING_POINTS[q.difficulty];
            }
        });
        setCodingScore(cScore);
        // Move to voice interview after delay
        setTimeout(() => setPhase('voice'), 1500);
    };

    /* ---- Voice interview ---- */
    const speakQuestion = (text: string) => {
        if (typeof window === 'undefined') return;
        const synth = window.speechSynthesis;
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        utter.pitch = 1;
        utter.volume = 1;
        const voices = synth.getVoices();
        const english = voices.find(v => v.lang.startsWith('en'));
        if (english) utter.voice = english;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => { setIsSpeaking(false); startListening(); };
        synth.speak(utter);
    };

    const startListening = () => {
        if (typeof window === 'undefined') return;
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { setTranscript('Speech recognition not supported in this browser.'); return; }
        const recognition = new SR();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let finalTranscript = '';
        recognition.onresult = (e: any) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
                else interim += e.results[i][0].transcript;
            }
            setTranscript(finalTranscript + interim);
        };
        recognition.onerror = () => { setIsListening(false); };
        recognition.onend = () => { setIsListening(false); };
        recognition.start();
        setIsListening(true);
        setTranscript('');
    };

    const stopListening = () => {
        if (recognitionRef.current) { recognitionRef.current.stop(); }
        setIsListening(false);
    };

    const submitVoiceAnswer = () => {
        stopListening();
        const answer = transcript.trim();
        setVoiceAnswers(prev => [...prev, answer]);
        // Score based on answer quality (word count as proxy)
        const words = answer.split(/\s+/).length;
        let score = 0;
        if (words > 50) score = 9;
        else if (words > 30) score = 7;
        else if (words > 15) score = 5;
        else if (words > 5) score = 3;
        else score = 1;
        setVoiceScores(prev => [...prev, score]);
        setTranscript('');
        if (voiceQ < voiceQuestions.length - 1) {
            setVoiceQ(prev => prev + 1);
            setTimeout(() => speakQuestion(voiceQuestions[voiceQ + 1]), 1500);
        } else {
            // Calculate final and show results
            const totalVoice = [...voiceScores, score].reduce((a, b) => a + b, 0);
            setVoiceTotalScore(totalVoice);
            saveResults(mcqScore, codingScore, totalVoice);
            setTimeout(() => setPhase('results'), 1500);
        }
    };

    const startVoiceInterview = () => {
        const freshQuestions = generateVoiceQuestions(5);
        setVoiceQuestions(freshQuestions);
        setVoiceQ(0);
        setVoiceAnswers([]);
        setVoiceScores([]);
        setTranscript('');
        setTimeout(() => speakQuestion(freshQuestions[0]), 500);
    };

    useEffect(() => {
        if (phase === 'voice') startVoiceInterview();
        return () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); };
    }, [phase]);

    /* ---- Save results to localStorage for analytics ---- */
    const selectedTopicLabels = selectedTopics.map(id => TOPICS.find(t => t.id === id)?.label || id).join(', ');

    const saveResults = (mScore: number, cScore: number, vScore: number) => {
        const result = {
            id: Date.now(),
            date: new Date().toISOString(),
            topic: selectedTopicLabels,
            mcqScore: mScore,
            codingScore: cScore,
            voiceScore: vScore,
            totalScore: mScore + cScore,
            maxScore: 100,
            warnings,
        };
        const existing = JSON.parse(localStorage.getItem('mockInterviewResults') || '[]');
        existing.push(result);
        localStorage.setItem('mockInterviewResults', JSON.stringify(existing));
    };

    /* ---- Helpers ---- */
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const totalQuestions = mcqs.length + codingQs.length;
    const isCoding = currentQ >= mcqs.length;
    const currentMCQ = !isCoding ? mcqs[currentQ] : null;
    const currentCoding = isCoding ? codingQs[currentQ - mcqs.length] : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-8 h-8 border-2 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin" />
            </div>
        );
    }

    /* ================================================================ */
    /*  PHASE 1: Topic Selection                                        */
    /* ================================================================ */
    if (phase === 'select') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl"
                >
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-3xl font-black text-[#E5E7EB]">AI Mock Interview</h1>
                        <p className="text-[#6B7280] mt-2">Proctored coding test + voice interview</p>
                    </div>

                    {/* Info cards */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { icon: BookOpen, label: '15 MCQs + 5 Coding', sub: '100 marks' },
                            { icon: Camera, label: 'AI Proctored', sub: 'Webcam required' },
                            { icon: Mic, label: 'Voice Interview', sub: '5 questions' },
                        ].map((item, i) => (
                            <div key={i} className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F] text-center">
                                <item.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                                <p className="text-xs font-semibold text-[#E5E7EB]">{item.label}</p>
                                <p className="text-[10px] text-[#6B7280] mt-0.5">{item.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Category summary */}
                    <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-2 border border-[#1F1F1F] mb-4">
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-[#FBBF24]/10 text-accent">
                            💻 DSA Topics
                            <span className="px-1.5 py-0.5 rounded-full bg-[#FBBF24]/20 text-[9px] font-bold">
                                {selectedTopics.filter(id => DSA_TOPICS.map(t => t.id).includes(id)).length}/{DSA_TOPICS.length}
                            </span>
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400">
                            📚 CS Subjects
                            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-[9px] font-bold">
                                {selectedTopics.filter(id => CS_TOPICS.map(t => t.id).includes(id)).length}/{CS_TOPICS.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[#9CA3AF]">
                            Select Topics {selectedTopics.length > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#FBBF24]/10 text-accent text-[10px] font-bold">{selectedTopics.length} selected</span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedTopics(TOPICS.map(t => t.id))} className="text-[10px] text-accent hover:underline">Select All</button>
                            {selectedTopics.length > 0 && (
                                <button onClick={() => setSelectedTopics([])} className="text-[10px] text-[#6B7280] hover:text-[#9CA3AF]">Clear</button>
                            )}
                        </div>
                    </div>

                    {/* DSA Topics */}
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                        <span>💻</span> Data Structures & Algorithms
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {DSA_TOPICS.map(t => {
                            const isSelected = selectedTopics.includes(t.id);
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => toggleTopic(t.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                                        ${isSelected
                                            ? 'bg-[#FBBF24]/10 border-[#FBBF24] text-accent'
                                            : 'bg-[#111111] border-[#1F1F1F] text-[#9CA3AF] hover:border-[#FBBF24]/30 hover:text-[#E5E7EB]'
                                        }`}
                                >
                                    <span className="text-lg">{t.icon}</span>
                                    <span className="text-xs font-medium flex-1">{t.label}</span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* CS Subject Topics */}
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                        <span>📚</span> Computer Science Subjects
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        {CS_TOPICS.map(t => {
                            const isSelected = selectedTopics.includes(t.id);
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => toggleTopic(t.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                                        ${isSelected
                                            ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                                            : 'bg-[#111111] border-[#1F1F1F] text-[#9CA3AF] hover:border-purple-500/30 hover:text-[#E5E7EB]'
                                        }`}
                                >
                                    <span className="text-lg">{t.icon}</span>
                                    <span className="text-xs font-medium flex-1">{t.label}</span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex-1 text-center py-3 rounded-xl bg-[#111111] border border-[#1F1F1F] text-[#9CA3AF] hover:text-[#E5E7EB] transition-all text-sm font-medium">
                            Back to Dashboard
                        </Link>
                        <button
                            onClick={startTest}
                            disabled={selectedTopics.length === 0}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black font-bold text-sm disabled:opacity-30 hover:shadow-gold-glow transition-all flex items-center justify-center gap-2"
                        >
                            Start Interview <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ================================================================ */
    /*  PHASE 2: Written Test (MCQ + Coding)                            */
    /* ================================================================ */
    if (phase === 'test') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
                {/* Warning overlay */}
                <AnimatePresence>
                    {showWarning && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-red-900/80 flex items-center justify-center"
                        >
                            <div className="bg-[#111111] rounded-2xl p-8 border border-red-500/50 max-w-md text-center">
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-[#E5E7EB] font-bold text-lg mb-2">Proctoring Alert</p>
                                <p className="text-[#9CA3AF] text-sm">{proctorMsg}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#1F1F1F] bg-[#0A0A0A]">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-accent" />
                        <span className="text-sm font-semibold text-[#E5E7EB]">Mock Interview</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FBBF24]/10 text-accent">
                            {selectedTopicLabels}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Webcam preview */}
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-[#1F1F1F]">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            {cameraActive && (
                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </div>
                        {/* Timer */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${timeLeft < 300 ? 'bg-red-500/10 text-red-400' : 'bg-[#111111] text-[#E5E7EB]'} border border-[#1F1F1F]`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                        {/* Warnings */}
                        <div className="flex items-center gap-1 text-xs">
                            <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                            <span className={warnings > 0 ? 'text-red-400' : 'text-[#6B7280]'}>{warnings}/2 warnings</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Question nav sidebar */}
                    <div className="w-16 border-r border-[#1F1F1F] bg-[#0A0A0A] overflow-y-auto py-3 space-y-1 flex-shrink-0">
                        {Array.from({ length: totalQuestions }, (_, i) => {
                            const isAnswered = i < mcqs.length
                                ? mcqAnswers[mcqs[i]?.id] !== undefined
                                : (codingAnswers[codingQs[i - mcqs.length]?.id] || '').length > (codingQs[i - mcqs.length]?.starterCodes?.['python'] || '').length + 20;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQ(i)}
                                    className={`w-10 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-bold transition-all
                                        ${currentQ === i
                                            ? 'bg-[#FBBF24] text-black'
                                            : isAnswered
                                                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                                : 'bg-[#111111] text-[#6B7280] border border-[#1F1F1F] hover:border-[#FBBF24]/30'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main question area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-4xl mx-auto">
                            {/* Question type badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                                    ${isCoding ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {isCoding ? 'CODING' : 'MCQ'}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                                    ${(isCoding ? currentCoding?.difficulty : currentMCQ?.difficulty) === 'easy' ? 'bg-green-500/10 text-green-400' :
                                        (isCoding ? currentCoding?.difficulty : currentMCQ?.difficulty) === 'medium' ? 'bg-[#FBBF24]/10 text-[#FBBF24]' :
                                            'bg-red-500/10 text-red-400'}`}>
                                    {(isCoding ? currentCoding?.difficulty : currentMCQ?.difficulty)?.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-[#6B7280]">
                                    {isCoding ? `${CODING_POINTS[currentCoding?.difficulty || 'easy']} marks` : `${MCQ_POINTS[currentMCQ?.difficulty || 'easy']} marks`}
                                </span>
                            </div>

                            {/* MCQ */}
                            {!isCoding && currentMCQ && (
                                <div>
                                    <h2 className="text-lg font-bold text-[#E5E7EB] mb-6">
                                        Q{currentQ + 1}. {currentMCQ.question}
                                    </h2>
                                    <div className="space-y-3">
                                        {currentMCQ.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setMcqAnswers(prev => ({ ...prev, [currentMCQ.id]: i }))}
                                                className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-3
                                                    ${mcqAnswers[currentMCQ.id] === i
                                                        ? 'bg-[#FBBF24]/10 border-[#FBBF24] text-[#FBBF24]'
                                                        : 'bg-[#111111] border-[#1F1F1F] text-[#9CA3AF] hover:border-[#FBBF24]/30'
                                                    }`}
                                            >
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                                    ${mcqAnswers[currentMCQ.id] === i
                                                        ? 'bg-[#FBBF24] text-black'
                                                        : 'bg-[#1F1F1F] text-[#6B7280]'
                                                    }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="text-sm">{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Coding question */}
                            {isCoding && currentCoding && (() => {
                                const qId = currentCoding.id;
                                const currentLang = codingLangs[qId] || 'python';
                                const monacoLang = LANGUAGES.find(l => l.id === currentLang)?.monaco || 'python';
                                const output = compileOutput[qId];
                                const isQSubmitted = codingSubmitted[qId];

                                const switchLang = (lang: string) => {
                                    setCodingLangs(prev => ({ ...prev, [qId]: lang }));
                                    setCodingAnswers(prev => ({ ...prev, [qId]: currentCoding.starterCodes[lang] || '' }));
                                    setCompileOutput(prev => { const n = { ...prev }; delete n[qId]; return n; });
                                };

                                const compileCode = () => {
                                    const code = codingAnswers[qId] || '';
                                    setCompileOutput(prev => ({ ...prev, [qId]: { lines: ['⏳ Compiling...'], status: 'running' } }));

                                    setTimeout(() => {
                                        const lines: string[] = [];
                                        const starterCode = currentCoding.starterCodes[currentLang] || '';

                                        // Check for common syntax errors
                                        if (code.trim().length < 10) {
                                            setCompileOutput(prev => ({
                                                ...prev, [qId]: {
                                                    lines: [
                                                        `❌ Compilation Error`,
                                                        ``,
                                                        `  File "solution.${currentLang === 'python' ? 'py' : currentLang === 'javascript' ? 'js' : currentLang === 'java' ? 'java' : 'cpp'}", line 1`,
                                                        `  Error: Solution is empty or too short.`,
                                                        `  Please write a valid solution before compiling.`,
                                                    ],
                                                    status: 'error',
                                                }
                                            }));
                                            return;
                                        }

                                        if (code === starterCode) {
                                            setCompileOutput(prev => ({
                                                ...prev, [qId]: {
                                                    lines: [
                                                        `❌ Compilation Error`,
                                                        ``,
                                                        `  File "solution.${currentLang === 'python' ? 'py' : currentLang === 'javascript' ? 'js' : currentLang === 'java' ? 'java' : 'cpp'}"`,
                                                        `  Error: Default starter code detected.`,
                                                        `  Please implement your solution before compiling.`,
                                                    ],
                                                    status: 'error',
                                                }
                                            }));
                                            return;
                                        }

                                        // Check for syntax-like issues
                                        const hasFuncBody = code.length > starterCode.length + 15;
                                        if (!hasFuncBody) {
                                            setCompileOutput(prev => ({
                                                ...prev, [qId]: {
                                                    lines: [
                                                        `❌ Runtime Error`,
                                                        ``,
                                                        `  Traceback (most recent call last):`,
                                                        `    File "solution.${currentLang === 'python' ? 'py' : 'js'}", line 3`,
                                                        `  Error: Function body is incomplete.`,
                                                        `  Your solution does not contain enough logic to execute.`,
                                                    ],
                                                    status: 'error',
                                                }
                                            }));
                                            return;
                                        }

                                        // Simulate test case execution
                                        lines.push(`✅ Compilation Successful`);
                                        lines.push(`   Language: ${LANGUAGES.find(l => l.id === currentLang)?.label}`);
                                        lines.push(``);
                                        lines.push(`Running ${currentCoding.testCases.length} test cases...`);
                                        lines.push(`${'─'.repeat(45)}`);

                                        let passed = 0;
                                        currentCoding.testCases.forEach((tc, i) => {
                                            // Simulate: give pass if code has decent content
                                            const isPass = code.length > starterCode.length + 30 + i * 10;
                                            if (isPass) passed++;
                                            lines.push(`  Test ${i + 1}: ${tc.input}`);
                                            lines.push(`    Expected: ${tc.expected}`);
                                            lines.push(`    Result:   ${isPass ? tc.expected : 'null'}`);
                                            lines.push(`    Status:   ${isPass ? '✓ PASSED' : '✗ FAILED'}`);
                                            lines.push(``);
                                        });

                                        lines.push(`${'─'.repeat(45)}`);
                                        lines.push(`Result: ${passed}/${currentCoding.testCases.length} test cases passed`);
                                        if (passed === currentCoding.testCases.length) {
                                            lines.push(`🎉 All test cases passed!`);
                                        }
                                        lines.push(`Execution Time: ${(Math.random() * 50 + 10).toFixed(0)}ms | Memory: ${(Math.random() * 5 + 8).toFixed(1)}MB`);

                                        const status = passed === currentCoding.testCases.length ? 'pass' : 'fail';
                                        setCompileOutput(prev => ({ ...prev, [qId]: { lines, status } }));
                                    }, 1500);
                                };

                                const submitCode = () => {
                                    setCodingSubmitted(prev => ({ ...prev, [qId]: true }));
                                    if (!output || output.status === 'idle') compileCode();
                                };

                                return (
                                    <div>
                                        <h2 className="text-lg font-bold text-[#E5E7EB] mb-2">
                                            Q{currentQ + 1}. {currentCoding.title}
                                        </h2>
                                        <p className="text-sm text-[#9CA3AF] mb-3 whitespace-pre-wrap">{currentCoding.description}</p>
                                        <div className="bg-[#141414] rounded-lg p-3 border border-[#1F1F1F] mb-3">
                                            <p className="text-xs text-[#6B7280] font-semibold mb-1">Example:</p>
                                            <pre className="text-xs text-[#E5E7EB] whitespace-pre-wrap">{currentCoding.examples}</pre>
                                        </div>
                                        <p className="text-[10px] text-[#6B7280] mb-3">Constraints: {currentCoding.constraints}</p>

                                        {/* Language selector + action buttons */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1 bg-[#111111] rounded-lg p-1 border border-[#1F1F1F]">
                                                {LANGUAGES.map(lang => (
                                                    <button
                                                        key={lang.id}
                                                        onClick={() => switchLang(lang.id)}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                                            ${currentLang === lang.id
                                                                ? 'bg-[#FBBF24]/15 text-[#FBBF24]'
                                                                : 'text-[#6B7280] hover:text-[#9CA3AF]'
                                                            }`}
                                                    >
                                                        {lang.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={compileCode}
                                                    disabled={output?.status === 'running'}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#111111] border border-[#1F1F1F] text-xs font-medium text-[#9CA3AF] hover:text-[#FBBF24] hover:border-[#FBBF24]/30 disabled:opacity-40 transition-all"
                                                >
                                                    {output?.status === 'running' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                                    Compile & Run
                                                </button>
                                                <button
                                                    onClick={submitCode}
                                                    disabled={isQSubmitted}
                                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                                                        ${isQSubmitted
                                                            ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                                            : 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black hover:shadow-gold-glow'
                                                        }`}
                                                >
                                                    {isQSubmitted ? <><CheckCircle2 className="w-3 h-3" /> Submitted</> : <><Send className="w-3 h-3" /> Submit</>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Monaco editor */}
                                        <div className="h-[280px] rounded-t-xl overflow-hidden border border-[#1F1F1F] border-b-0">
                                            <MonacoEditor
                                                height="100%"
                                                language={monacoLang}
                                                value={codingAnswers[qId] || currentCoding.starterCodes[currentLang]}
                                                onChange={(val) => setCodingAnswers(prev => ({ ...prev, [qId]: val || '' }))}
                                                theme="vs-dark"
                                                options={{
                                                    fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
                                                    minimap: { enabled: false }, padding: { top: 12 },
                                                    scrollBeyondLastLine: false, automaticLayout: true,
                                                    lineNumbers: 'on', tabSize: 4, readOnly: isQSubmitted,
                                                }}
                                            />
                                        </div>

                                        {/* Output panel */}
                                        <div className={`rounded-b-xl border border-[#1F1F1F] bg-[#0D0D0D] p-3 min-h-[80px] max-h-[200px] overflow-y-auto
                                            ${output?.status === 'pass' ? 'border-green-500/30' : output?.status === 'fail' ? 'border-[#FBBF24]/30' : output?.status === 'error' ? 'border-red-500/30' : ''}`}>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Terminal className="w-3 h-3 text-[#6B7280]" />
                                                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Output</span>
                                                {output?.status === 'pass' && <span className="ml-auto text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">ALL PASSED</span>}
                                                {output?.status === 'fail' && <span className="ml-auto text-[10px] font-bold text-[#FBBF24] bg-[#FBBF24]/10 px-1.5 py-0.5 rounded">PARTIAL</span>}
                                                {output?.status === 'error' && <span className="ml-auto text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">ERROR</span>}
                                            </div>
                                            {output ? (
                                                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
                                                    {output.lines.map((line, i) => (
                                                        <span key={i} className={
                                                            line.includes('✓ PASSED') ? 'text-green-400' :
                                                                line.includes('✗ FAILED') ? 'text-red-400' :
                                                                    line.includes('❌') ? 'text-red-400' :
                                                                        line.includes('✅') ? 'text-green-400' :
                                                                            line.includes('🎉') ? 'text-[#FBBF24]' :
                                                                                line.includes('Error') ? 'text-red-300' :
                                                                                    line.startsWith('─') ? 'text-[#333]' :
                                                                                        'text-[#9CA3AF]'
                                                        }>{line}{'\n'}</span>
                                                    ))}
                                                </pre>
                                            ) : (
                                                <p className="text-xs text-[#4B5563] italic">Click "Compile & Run" to execute your code against test cases</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
                                    disabled={currentQ === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] border border-[#1F1F1F] text-sm text-[#9CA3AF] hover:text-[#E5E7EB] disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <span className="text-xs text-[#6B7280]">{currentQ + 1} / {totalQuestions}</span>
                                {currentQ < totalQuestions - 1 ? (
                                    <button
                                        onClick={() => setCurrentQ(p => p + 1)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] border border-[#1F1F1F] text-sm text-[#9CA3AF] hover:text-[#E5E7EB] transition-all"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitTest}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black font-bold text-sm hover:shadow-gold-glow transition-all"
                                    >
                                        Submit Test <Send className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ================================================================ */
    /*  PHASE 3: Voice Interview                                        */
    /* ================================================================ */
    if (phase === 'voice') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center mx-auto mb-4">
                            <Mic className="w-7 h-7 text-black" />
                        </div>
                        <h1 className="text-2xl font-black text-[#E5E7EB]">Voice Interview</h1>
                        <p className="text-sm text-[#6B7280] mt-1">Question {voiceQ + 1} of {voiceQuestions.length}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#1F1F1F] mb-8">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]"
                            animate={{ width: `${((voiceQ + 1) / voiceQuestions.length) * 100}%` }}
                        />
                    </div>

                    {/* Question card */}
                    <motion.div
                        key={voiceQ}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#111111] rounded-2xl p-6 border border-[#1F1F1F] mb-6"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            {isSpeaking ? (
                                <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0">
                                    <Volume2 className="w-4 h-4 text-[#FBBF24] animate-pulse" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0">
                                    <Brain className="w-4 h-4 text-[#FBBF24]" />
                                </div>
                            )}
                            <p className="text-sm text-[#E5E7EB] leading-relaxed">{voiceQuestions[voiceQ]}</p>
                        </div>

                        {isSpeaking && (
                            <p className="text-xs text-[#FBBF24] italic">🔊 AI is speaking...</p>
                        )}
                    </motion.div>

                    {/* Transcript */}
                    <div className="bg-[#0D0D0D] rounded-xl p-4 border border-[#1F1F1F] mb-6 min-h-[120px]">
                        <p className="text-xs text-[#6B7280] mb-2 flex items-center gap-1.5">
                            {isListening ? <><Mic className="w-3 h-3 text-red-400 animate-pulse" /> Listening...</> : <><MicOff className="w-3 h-3" /> Your response</>}
                        </p>
                        <p className="text-sm text-[#E5E7EB] whitespace-pre-wrap">
                            {transcript || (isListening ? 'Start speaking...' : 'Click the microphone to begin your answer.')}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        {!isListening && !isSpeaking && (
                            <button
                                onClick={startListening}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111111] border border-[#1F1F1F] text-sm text-[#9CA3AF] hover:text-[#FBBF24] hover:border-[#FBBF24]/30 transition-all"
                            >
                                <Mic className="w-4 h-4" /> Start Speaking
                            </button>
                        )}
                        {isListening && (
                            <button
                                onClick={submitVoiceAnswer}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black font-bold text-sm hover:shadow-gold-glow transition-all"
                            >
                                <Send className="w-4 h-4" /> Submit Answer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ================================================================ */
    /*  PHASE 4: Results                                                */
    /* ================================================================ */
    const totalWritten = mcqScore + codingScore;
    const avgVoice = voiceScores.length > 0 ? (voiceScores.reduce((a, b) => a + b, 0) / voiceScores.length).toFixed(1) : '0';
    const grade = totalWritten >= 80 ? 'A+' : totalWritten >= 65 ? 'A' : totalWritten >= 50 ? 'B' : totalWritten >= 35 ? 'C' : 'D';
    const gradeColor = totalWritten >= 65 ? 'text-green-400' : totalWritten >= 35 ? 'text-[#FBBF24]' : 'text-red-400';

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#D97706] flex items-center justify-center mx-auto mb-4"
                    >
                        <Trophy className="w-10 h-10 text-black" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-[#E5E7EB]">Interview Complete!</h1>
                    <p className="text-[#6B7280] mt-1">{selectedTopicLabels}</p>
                </div>

                {/* Score circle */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-40 h-40">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="#1F1F1F" strokeWidth="8" />
                            <motion.circle
                                cx="60" cy="60" r="52" fill="none"
                                stroke="url(#goldGrad)" strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 52}
                                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - totalWritten / 100) }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                            <defs>
                                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#FBBF24" />
                                    <stop offset="100%" stopColor="#D97706" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-[#E5E7EB]">{totalWritten}</span>
                            <span className="text-xs text-[#6B7280]">/ 100</span>
                        </div>
                    </div>
                </div>

                {/* Grade */}
                <div className="text-center mb-6">
                    <span className={`text-5xl font-black ${gradeColor}`}>{grade}</span>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F] text-center">
                        <p className="text-xs text-[#6B7280] mb-1">MCQ Score</p>
                        <p className="text-2xl font-black text-[#FBBF24]">{mcqScore}<span className="text-sm text-[#6B7280]">/60</span></p>
                    </div>
                    <div className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F] text-center">
                        <p className="text-xs text-[#6B7280] mb-1">Coding Score</p>
                        <p className="text-2xl font-black text-[#F59E0B]">{codingScore}<span className="text-sm text-[#6B7280]">/40</span></p>
                    </div>
                    <div className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F] text-center">
                        <p className="text-xs text-[#6B7280] mb-1">Voice Avg</p>
                        <p className="text-2xl font-black text-[#D97706]">{avgVoice}<span className="text-sm text-[#6B7280]">/10</span></p>
                    </div>
                </div>

                {/* Warnings */}
                {warnings > 0 && (
                    <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <p className="text-xs text-red-400">{warnings} proctoring warning{warnings > 1 ? 's' : ''} during the test</p>
                    </div>
                )}

                {/* MCQ Detail */}
                <div className="bg-[#111111] rounded-xl p-4 border border-[#1F1F1F] mb-4">
                    <h3 className="text-sm font-semibold text-[#E5E7EB] mb-3">MCQ Review</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {mcqs.map((q, i) => {
                            const answered = mcqAnswers[q.id];
                            const correct = answered === q.correct;
                            return (
                                <div key={i} className={`flex items-center justify-center w-full aspect-square rounded-lg text-xs font-bold
                                    ${answered === undefined ? 'bg-[#1F1F1F] text-[#6B7280]' : correct ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                    {i + 1}
                                    {answered !== undefined && (correct ? <CheckCircle2 className="w-3 h-3 ml-0.5" /> : <XCircle className="w-3 h-3 ml-0.5" />)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6">
                    <button
                        onClick={() => { stopCamera(); setWarnings(0); setShowWarning(false); setProctorMsg(''); setPhase('select'); setSelectedTopics([]); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111111] border border-[#1F1F1F] text-sm font-medium text-[#9CA3AF] hover:text-[#E5E7EB] transition-all"
                    >
                        <RotateCcw className="w-4 h-4" /> Retake
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-sm font-bold text-black hover:shadow-gold-glow transition-all"
                    >
                        <Home className="w-4 h-4" /> Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
