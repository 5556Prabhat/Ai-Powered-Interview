/**
 * Task Tracker — Shared utility for daily task generation & persistence.
 *
 * Tasks change every day (date-seeded), are persisted in localStorage,
 * and feed both the Dashboard and Analytics pages with real data.
 *
 * When you have an API key in the future, uncomment fetchExtraTasks()
 * to dynamically fetch fresh tasks from an AI endpoint.
 */

/* ——————————————————————————————————————————————
   Types
   —————————————————————————————————————————————— */

export interface DailyTask {
    id: string;
    text: string;
    category: TaskCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    href: string;
    done: boolean;
}

export type TaskCategory =
    | 'DSA'
    | 'System Design'
    | 'Behavioral'
    | 'CS Fundamentals'
    | 'Coding Practice'
    | 'Mock Interview';

interface TaskTemplate {
    text: string;
    category: TaskCategory;
    difficulty: 'easy' | 'medium' | 'hard';
    href: string;
}

export interface DayStats {
    date: string;
    total: number;
    completed: number;
    categories: Record<string, number>;
}

/* ——————————————————————————————————————————————
   Task Pool — 55+ tasks across 6 categories
   —————————————————————————————————————————————— */

const TASK_POOL: TaskTemplate[] = [
    // DSA
    { text: 'Solve 2 medium array problems', category: 'DSA', difficulty: 'medium', href: '/interview' },
    { text: 'Practice binary search variations', category: 'DSA', difficulty: 'medium', href: '/interview' },
    { text: 'Solve a hard graph traversal problem', category: 'DSA', difficulty: 'hard', href: '/interview' },
    { text: 'Implement a balanced BST from scratch', category: 'DSA', difficulty: 'hard', href: '/interview' },
    { text: 'Review linked list reversal patterns', category: 'DSA', difficulty: 'easy', href: '/interview' },
    { text: 'Solve 3 easy string manipulation problems', category: 'DSA', difficulty: 'easy', href: '/interview' },
    { text: 'Practice sliding window technique', category: 'DSA', difficulty: 'medium', href: '/interview' },
    { text: 'Solve a dynamic programming problem', category: 'DSA', difficulty: 'hard', href: '/interview' },
    { text: 'Implement heap sort and priority queue', category: 'DSA', difficulty: 'medium', href: '/interview' },
    { text: 'Practice two-pointer technique on sorted arrays', category: 'DSA', difficulty: 'easy', href: '/interview' },
    { text: 'Solve a backtracking problem (N-Queens/Sudoku)', category: 'DSA', difficulty: 'hard', href: '/interview' },
    { text: 'Review hash map collision strategies', category: 'DSA', difficulty: 'medium', href: '/interview' },

    // System Design
    { text: 'Design a URL shortener system', category: 'System Design', difficulty: 'medium', href: '/chat' },
    { text: 'Study CAP theorem and its implications', category: 'System Design', difficulty: 'easy', href: '/chat' },
    { text: 'Design a real-time chat application', category: 'System Design', difficulty: 'hard', href: '/chat' },
    { text: 'Review database sharding strategies', category: 'System Design', difficulty: 'medium', href: '/chat' },
    { text: 'Study load balancing algorithms', category: 'System Design', difficulty: 'easy', href: '/chat' },
    { text: 'Design a notification delivery system', category: 'System Design', difficulty: 'hard', href: '/chat' },
    { text: 'Review caching strategies (LRU, LFU, Write-through)', category: 'System Design', difficulty: 'medium', href: '/chat' },
    { text: 'Design an API rate limiter', category: 'System Design', difficulty: 'medium', href: '/chat' },
    { text: 'Study microservices vs monolith trade-offs', category: 'System Design', difficulty: 'easy', href: '/chat' },

    // Behavioral
    { text: 'Practice STAR method for behavioral answers', category: 'Behavioral', difficulty: 'easy', href: '/mock-interview' },
    { text: 'Prepare 3 leadership experience stories', category: 'Behavioral', difficulty: 'medium', href: '/mock-interview' },
    { text: 'Record yourself answering "Tell me about a failure"', category: 'Behavioral', difficulty: 'medium', href: '/mock-interview' },
    { text: 'Write down examples of conflict resolution', category: 'Behavioral', difficulty: 'easy', href: '/mock-interview' },
    { text: 'Practice explaining a complex project in 2 minutes', category: 'Behavioral', difficulty: 'medium', href: '/mock-interview' },
    { text: 'Prepare answers for "Why this company?" variations', category: 'Behavioral', difficulty: 'easy', href: '/mock-interview' },
    { text: 'Mock answer: Describe a time you disagreed with management', category: 'Behavioral', difficulty: 'hard', href: '/mock-interview' },
    { text: 'Prepare your "career growth" narrative', category: 'Behavioral', difficulty: 'medium', href: '/mock-interview' },

    // CS Fundamentals
    { text: 'Review OS process scheduling algorithms', category: 'CS Fundamentals', difficulty: 'medium', href: '/chat' },
    { text: 'Study TCP/IP vs UDP differences', category: 'CS Fundamentals', difficulty: 'easy', href: '/chat' },
    { text: 'Review ACID properties of databases', category: 'CS Fundamentals', difficulty: 'easy', href: '/chat' },
    { text: 'Study deadlock detection and prevention', category: 'CS Fundamentals', difficulty: 'hard', href: '/chat' },
    { text: 'Review memory management (paging, segmentation)', category: 'CS Fundamentals', difficulty: 'medium', href: '/chat' },
    { text: 'Study DNS resolution process end-to-end', category: 'CS Fundamentals', difficulty: 'easy', href: '/chat' },
    { text: 'Review indexing strategies in databases', category: 'CS Fundamentals', difficulty: 'medium', href: '/chat' },
    { text: 'Study concurrency models and thread safety', category: 'CS Fundamentals', difficulty: 'hard', href: '/chat' },
    { text: 'Review REST API design best practices', category: 'CS Fundamentals', difficulty: 'easy', href: '/chat' },

    // Coding Practice
    { text: 'Write unit tests for a utility function', category: 'Coding Practice', difficulty: 'easy', href: '/interview' },
    { text: 'Refactor a function to reduce time complexity', category: 'Coding Practice', difficulty: 'medium', href: '/interview' },
    { text: 'Implement a custom Promise.all from scratch', category: 'Coding Practice', difficulty: 'hard', href: '/interview' },
    { text: 'Build a debounce/throttle function', category: 'Coding Practice', difficulty: 'medium', href: '/interview' },
    { text: 'Practice coding without IDE autocomplete', category: 'Coding Practice', difficulty: 'medium', href: '/interview' },
    { text: 'Solve a LeetCode daily challenge', category: 'Coding Practice', difficulty: 'medium', href: '/interview' },
    { text: 'Implement a basic event emitter class', category: 'Coding Practice', difficulty: 'medium', href: '/interview' },
    { text: 'Write a recursive solution then convert to iterative', category: 'Coding Practice', difficulty: 'hard', href: '/interview' },
    { text: 'Implement deep clone for nested objects', category: 'Coding Practice', difficulty: 'easy', href: '/interview' },

    // Mock Interview
    { text: 'Complete a full mock interview session', category: 'Mock Interview', difficulty: 'hard', href: '/mock-interview' },
    { text: 'Practice whiteboard coding with timer', category: 'Mock Interview', difficulty: 'medium', href: '/mock-interview' },
    { text: 'Do a 15-minute system design mock', category: 'Mock Interview', difficulty: 'hard', href: '/mock-interview' },
    { text: 'Practice voice interview with AI', category: 'Mock Interview', difficulty: 'medium', href: '/mock-interview' },
    { text: 'Review your last mock interview results', category: 'Mock Interview', difficulty: 'easy', href: '/mock-interview' },
    { text: 'Time yourself solving 2 medium problems in 30 min', category: 'Mock Interview', difficulty: 'medium', href: '/mock-interview' },
    { text: 'Practice explaining your thought process aloud', category: 'Mock Interview', difficulty: 'easy', href: '/mock-interview' },
    { text: 'Complete a behavioral + technical mock combo', category: 'Mock Interview', difficulty: 'hard', href: '/mock-interview' },
];

/* ——————————————————————————————————————————————
   Date-Seeded Pseudo-Random Number Generator
   —————————————————————————————————————————————— */

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function dateToSeed(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
        const ch = date.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash |= 0;
    }
    return Math.abs(hash);
}

/* ——————————————————————————————————————————————
   Date Helper
   —————————————————————————————————————————————— */

export function toDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ——————————————————————————————————————————————
   Task Generation
   —————————————————————————————————————————————— */

const TASKS_PER_DAY = 5;
const STORAGE_PREFIX = 'dailyTasks-';

/** Generate deterministic daily tasks based on the date */
export function generateDailyTasks(dateKey: string): DailyTask[] {
    const seed = dateToSeed(dateKey);
    const rng = seededRandom(seed);

    // Shuffle pool using Fisher-Yates with seeded RNG
    const shuffled = [...TASK_POOL];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Pick tasks ensuring category diversity
    const selected: TaskTemplate[] = [];
    const usedCategories = new Set<string>();

    // First pass: one from each category if possible
    for (const task of shuffled) {
        if (selected.length >= TASKS_PER_DAY) break;
        if (!usedCategories.has(task.category)) {
            selected.push(task);
            usedCategories.add(task.category);
        }
    }

    // Fill remaining slots
    for (const task of shuffled) {
        if (selected.length >= TASKS_PER_DAY) break;
        if (!selected.includes(task)) {
            selected.push(task);
        }
    }

    // Load saved completion state
    const saved = loadCompletionState(dateKey);

    return selected.map((t, i) => ({
        id: `${dateKey}-${i}`,
        text: t.text,
        category: t.category,
        difficulty: t.difficulty,
        href: t.href,
        done: saved.includes(`${dateKey}-${i}`),
    }));
}

/* ——————————————————————————————————————————————
   Persistence (localStorage)
   —————————————————————————————————————————————— */

function loadCompletionState(dateKey: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_PREFIX + dateKey) || '[]');
    } catch {
        return [];
    }
}

export function toggleTaskCompletion(dateKey: string, taskId: string): boolean {
    const completed = loadCompletionState(dateKey);
    let newDone: boolean;
    if (completed.includes(taskId)) {
        const idx = completed.indexOf(taskId);
        completed.splice(idx, 1);
        newDone = false;
    } else {
        completed.push(taskId);
        newDone = true;
    }
    localStorage.setItem(STORAGE_PREFIX + dateKey, JSON.stringify(completed));
    return newDone;
}

/* ——————————————————————————————————————————————
   Analytics Helpers
   —————————————————————————————————————————————— */

/** Get completion stats for a specific date */
export function getDayStats(dateKey: string): DayStats {
    const tasks = generateDailyTasks(dateKey);
    const completed = tasks.filter(t => t.done).length;
    const categories: Record<string, number> = {};
    tasks.filter(t => t.done).forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + 1;
    });
    return { date: dateKey, total: tasks.length, completed, categories };
}

/** Get stats for past N days */
export function getTaskHistory(days: number = 30): DayStats[] {
    const history: DayStats[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        history.push(getDayStats(toDateKey(d)));
    }
    return history.reverse(); // oldest first
}

/** Calculate consecutive-day streak of completing at least 1 task */
export function getStreakCount(): number {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const stats = getDayStats(toDateKey(d));
        if (stats.completed > 0) {
            streak++;
        } else {
            // Allow today to have 0 if the user hasn't started yet
            if (i === 0) continue;
            break;
        }
    }
    return streak;
}

/** Aggregate stats for analytics overview */
export function getAggregateStats(days: number = 30) {
    const history = getTaskHistory(days);
    const totalCompleted = history.reduce((sum, d) => sum + d.completed, 0);
    const totalTasks = history.reduce((sum, d) => sum + d.total, 0);
    const activeDays = history.filter(d => d.completed > 0).length;
    const avgDailyCompletion = activeDays > 0 ? totalCompleted / activeDays : 0;

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    history.forEach(d => {
        Object.entries(d.categories).forEach(([cat, count]) => {
            categoryTotals[cat] = (categoryTotals[cat] || 0) + count;
        });
    });

    // Difficulty breakdown from completed tasks
    const difficultyTotals: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    history.forEach(d => {
        const tasks = generateDailyTasks(d.date);
        tasks.filter(t => t.done).forEach(t => {
            difficultyTotals[t.difficulty]++;
        });
    });

    return {
        totalCompleted,
        totalTasks,
        activeDays,
        avgDailyCompletion,
        completionRate: totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0,
        categoryTotals,
        difficultyTotals,
        streak: getStreakCount(),
        dailyCompletions: history.map(d => d.completed),
        dailyLabels: history.map(d => {
            const md = new Date(d.date + 'T12:00:00');
            return md.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
    };
}

/* ——————————————————————————————————————————————
   API Extensibility (Future Use)
   —————————————————————————————————————————————— */

/**
 * Fetch additional tasks from an AI endpoint.
 * Uncomment and configure when you have an API key.
 *
 * Usage: const extraTasks = await fetchExtraTasks('your-api-key');
 * Then merge into TASK_POOL: TASK_POOL.push(...extraTasks);
 */
// export async function fetchExtraTasks(apiKey: string): Promise<TaskTemplate[]> {
//     const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
//     try {
//         const res = await fetch(`${API_URL}/api/generate-tasks`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${apiKey}`,
//             },
//             body: JSON.stringify({
//                 prompt: 'Generate 50 unique interview preparation tasks across DSA, System Design, Behavioral, CS Fundamentals, Coding Practice, and Mock Interview categories.',
//                 count: 50,
//             }),
//         });
//         const data = await res.json();
//         return data.tasks || [];
//     } catch (err) {
//         console.error('Failed to fetch extra tasks:', err);
//         return [];
//     }
// }

export { TASK_POOL, TASKS_PER_DAY };
