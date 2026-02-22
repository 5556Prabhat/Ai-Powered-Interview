// ─── Question Test Data ──────────────────────────────────────────────────────
// Stores test cases and function signatures for practice questions.
// Used by the test runner generator to create language-specific test harnesses.

import { QuestionMeta } from '@/lib/testRunner';

const QUESTION_TEST_DATA: Record<string, QuestionMeta> = {
    // ── Arrays & Hashing ─────────────────────────────────────────────────────
    a1: {
        functionName: { cpp: 'twoSum', python: 'two_sum', java: 'twoSum' },
        returnType: 'int[]',
        params: [
            { name: 'nums', type: 'int[]' },
            { name: 'target', type: 'int' },
        ],
        testCases: [
            { id: 1, input: 'nums = [2,7,11,15], target = 9', inputs: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { id: 2, input: 'nums = [3,2,4], target = 6', inputs: [[3, 2, 4], 6], expected: [1, 2] },
            { id: 3, input: 'nums = [3,3], target = 6', inputs: [[3, 3], 6], expected: [0, 1] },
        ],
    },
    a2: {
        functionName: { cpp: 'containsDuplicate', python: 'contains_duplicate', java: 'containsDuplicate' },
        returnType: 'bool',
        params: [{ name: 'nums', type: 'int[]' }],
        testCases: [
            { id: 1, input: 'nums = [1,2,3,1]', inputs: [[1, 2, 3, 1]], expected: true },
            { id: 2, input: 'nums = [1,2,3,4]', inputs: [[1, 2, 3, 4]], expected: false },
            { id: 3, input: 'nums = [1,1,1,3,3,4,3,2,4,2]', inputs: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
        ],
    },
    a3: {
        functionName: { cpp: 'isAnagram', python: 'is_anagram', java: 'isAnagram' },
        returnType: 'bool',
        params: [
            { name: 's', type: 'string' },
            { name: 't', type: 'string' },
        ],
        testCases: [
            { id: 1, input: 's = "anagram", t = "nagaram"', inputs: ['anagram', 'nagaram'], expected: true },
            { id: 2, input: 's = "rat", t = "car"', inputs: ['rat', 'car'], expected: false },
            { id: 3, input: 's = "listen", t = "silent"', inputs: ['listen', 'silent'], expected: true },
        ],
    },

    // ── Strings ──────────────────────────────────────────────────────────────
    s1: {
        functionName: { cpp: 'isPalindrome', python: 'is_palindrome', java: 'isPalindrome' },
        returnType: 'bool',
        params: [{ name: 's', type: 'string' }],
        testCases: [
            { id: 1, input: 's = "racecar"', inputs: ['racecar'], expected: true },
            { id: 2, input: 's = "hello"', inputs: ['hello'], expected: false },
            { id: 3, input: 's = "madam"', inputs: ['madam'], expected: true },
        ],
    },

    // ── Sliding Window ───────────────────────────────────────────────────────
    sw1: {
        functionName: { cpp: 'maxProfit', python: 'max_profit', java: 'maxProfit' },
        returnType: 'int',
        params: [{ name: 'prices', type: 'int[]' }],
        testCases: [
            { id: 1, input: 'prices = [7,1,5,3,6,4]', inputs: [[7, 1, 5, 3, 6, 4]], expected: 5 },
            { id: 2, input: 'prices = [7,6,4,3,1]', inputs: [[7, 6, 4, 3, 1]], expected: 0 },
            { id: 3, input: 'prices = [2,4,1]', inputs: [[2, 4, 1]], expected: 2 },
        ],
    },

    // ── Stack ────────────────────────────────────────────────────────────────
    st1: {
        functionName: { cpp: 'isValid', python: 'is_valid', java: 'isValid' },
        returnType: 'bool',
        params: [{ name: 's', type: 'string' }],
        testCases: [
            { id: 1, input: 's = "()"', inputs: ['()'], expected: true },
            { id: 2, input: 's = "()[]{}"', inputs: ['()[]{}'], expected: true },
            { id: 3, input: 's = "(]"', inputs: ['(]'], expected: false },
        ],
    },

    // ── Binary Search ────────────────────────────────────────────────────────
    bs1: {
        functionName: { cpp: 'search', python: 'binary_search', java: 'search' },
        returnType: 'int',
        params: [
            { name: 'nums', type: 'int[]' },
            { name: 'target', type: 'int' },
        ],
        testCases: [
            { id: 1, input: 'nums = [-1,0,3,5,9,12], target = 9', inputs: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
            { id: 2, input: 'nums = [-1,0,3,5,9,12], target = 2', inputs: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
            { id: 3, input: 'nums = [5], target = 5', inputs: [[5], 5], expected: 0 },
        ],
    },

    // ── Dynamic Programming ──────────────────────────────────────────────────
    d1: {
        functionName: { cpp: 'climbStairs', python: 'climb_stairs', java: 'climbStairs' },
        returnType: 'int',
        params: [{ name: 'n', type: 'int' }],
        testCases: [
            { id: 1, input: 'n = 2', inputs: [2], expected: 2 },
            { id: 2, input: 'n = 3', inputs: [3], expected: 3 },
            { id: 3, input: 'n = 5', inputs: [5], expected: 8 },
        ],
    },
    d3: {
        functionName: { cpp: 'coinChange', python: 'coin_change', java: 'coinChange' },
        returnType: 'int',
        params: [
            { name: 'coins', type: 'int[]' },
            { name: 'amount', type: 'int' },
        ],
        testCases: [
            { id: 1, input: 'coins = [1,5,11], amount = 11', inputs: [[1, 5, 11], 11], expected: 1 },
            { id: 2, input: 'coins = [2], amount = 3', inputs: [[2], 3], expected: -1 },
            { id: 3, input: 'coins = [1], amount = 0', inputs: [[1], 0], expected: 0 },
        ],
    },

    // ── Greedy ────────────────────────────────────────────────────────────────
    gr1: {
        functionName: { cpp: 'maxSubArray', python: 'max_sub_array', java: 'maxSubArray' },
        returnType: 'int',
        params: [{ name: 'nums', type: 'int[]' }],
        testCases: [
            { id: 1, input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', inputs: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
            { id: 2, input: 'nums = [1]', inputs: [[1]], expected: 1 },
            { id: 3, input: 'nums = [5,4,-1,7,8]', inputs: [[5, 4, -1, 7, 8]], expected: 23 },
        ],
    },
};

export function getQuestionTestData(questionId: string): QuestionMeta | null {
    return QUESTION_TEST_DATA[questionId] || null;
}

export default QUESTION_TEST_DATA;
