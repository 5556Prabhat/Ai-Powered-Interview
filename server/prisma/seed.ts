import { PrismaClient, Difficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@interviewiq.com' },
        update: {},
        create: {
            email: 'admin@interviewiq.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    // Create candidate user
    const candidatePassword = await bcrypt.hash('candidate123', 12);
    const candidate = await prisma.user.upsert({
        where: { email: 'candidate@interviewiq.com' },
        update: {},
        create: {
            email: 'candidate@interviewiq.com',
            name: 'John Doe',
            password: candidatePassword,
            role: 'CANDIDATE',
        },
    });

    // Create questions
    const questions = [
        {
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
            difficulty: 'EASY' as Difficulty,
            tags: ['Array', 'Hash Table'],
            hints: ['Try using a hash map to store complements.', 'A brute force approach would be O(n²).'],
            constraints: '2 <= nums.length <= 10⁴\n-10⁹ <= nums[i] <= 10⁹\n-10⁹ <= target <= 10⁹',
            examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
            starterCode: {
                PYTHON: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
                JAVA: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}',
                CPP: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};',
            },
            testCases: [
                { input: '[2,7,11,15]\n9', expected: '[0,1]', isHidden: false },
                { input: '[3,2,4]\n6', expected: '[1,2]', isHidden: false },
                { input: '[3,3]\n6', expected: '[0,1]', isHidden: true },
            ],
        },
        {
            title: 'Valid Parentheses',
            description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
            difficulty: 'EASY' as Difficulty,
            tags: ['Stack', 'String'],
            hints: ['Use a stack data structure.', 'Push opening brackets and pop when you see a closing bracket.'],
            constraints: '1 <= s.length <= 10⁴\ns consists of parentheses only \'()[]{}\'.',
            examples: 'Input: s = "()"\nOutput: true\n\nInput: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
            starterCode: {
                PYTHON: 'def is_valid(s):\n    # Write your solution here\n    pass',
                JAVA: 'class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}',
                CPP: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};',
            },
            testCases: [
                { input: '()', expected: 'true', isHidden: false },
                { input: '()[]{}', expected: 'true', isHidden: false },
                { input: '(]', expected: 'false', isHidden: false },
                { input: '([)]', expected: 'false', isHidden: true },
            ],
        },
        {
            title: 'Longest Substring Without Repeating Characters',
            description: 'Given a string s, find the length of the longest substring without repeating characters.',
            difficulty: 'MEDIUM' as Difficulty,
            tags: ['Hash Table', 'String', 'Sliding Window'],
            hints: ['Use a sliding window approach.', 'Keep track of character positions with a hash map.'],
            constraints: '0 <= s.length <= 5 * 10⁴\ns consists of English letters, digits, symbols and spaces.',
            examples: 'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
            starterCode: {
                PYTHON: 'def length_of_longest_substring(s):\n    # Write your solution here\n    pass',
                JAVA: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}',
                CPP: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return 0;\n    }\n};',
            },
            testCases: [
                { input: 'abcabcbb', expected: '3', isHidden: false },
                { input: 'bbbbb', expected: '1', isHidden: false },
                { input: 'pwwkew', expected: '3', isHidden: true },
            ],
        },
        {
            title: 'Merge K Sorted Lists',
            description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.',
            difficulty: 'HARD' as Difficulty,
            tags: ['Linked List', 'Heap', 'Divide and Conquer'],
            hints: ['Consider using a min-heap / priority queue.', 'You could also use divide and conquer.'],
            constraints: 'k == lists.length\n0 <= k <= 10⁴\n0 <= lists[i].length <= 500\n-10⁴ <= lists[i][j] <= 10⁴',
            examples: 'Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]',
            starterCode: {
                PYTHON: 'import heapq\n\ndef merge_k_lists(lists):\n    # Write your solution here\n    pass',
                JAVA: 'class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your solution here\n        return null;\n    }\n}',
                CPP: '#include <vector>\n#include <queue>\nusing namespace std;\n\nclass Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        // Write your solution here\n        return nullptr;\n    }\n};',
            },
            testCases: [
                { input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]', isHidden: false },
                { input: '[]', expected: '[]', isHidden: false },
                { input: '[[]]', expected: '[]', isHidden: true },
            ],
        },
    ];

    for (const q of questions) {
        const { testCases, ...questionData } = q;
        await prisma.question.create({
            data: {
                ...questionData,
                testCases: { create: testCases },
            },
        });
    }

    console.log('✅ Seeded users:', admin.email, candidate.email);
    console.log('✅ Seeded', questions.length, 'questions');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
