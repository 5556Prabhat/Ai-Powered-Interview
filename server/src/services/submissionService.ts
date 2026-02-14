import prisma from '../lib/prisma';
import { Language } from '@prisma/client';

export const submissionService = {
    async create(data: {
        userId: string;
        questionId: string;
        code: string;
        language: Language;
        status?: string;
        stdout?: string;
        stderr?: string;
        runtime?: number;
        memory?: number;
        passed?: number;
        total?: number;
    }) {
        return prisma.submission.create({
            data,
            include: { evaluation: true, question: true },
        });
    },

    async getById(id: string) {
        return prisma.submission.findUnique({
            where: { id },
            include: { evaluation: true, question: true },
        });
    },

    async getUserSubmissions(userId: string, questionId?: string) {
        const where: any = { userId };
        if (questionId) where.questionId = questionId;

        return prisma.submission.findMany({
            where,
            include: { evaluation: true, question: { select: { title: true, difficulty: true } } },
            orderBy: { createdAt: 'desc' },
        });
    },

    async saveEvaluation(submissionId: string, evaluation: {
        logicScore: number;
        readabilityScore: number;
        optimizationScore: number;
        edgeCaseAnalysis: string;
        suggestions: string[];
        timeComplexity: string;
        spaceComplexity: string;
        overallScore: number;
        rawResponse?: any;
    }) {
        return prisma.aIEvaluation.create({
            data: {
                submissionId,
                ...evaluation,
            },
        });
    },

    async getAnalytics(userId: string) {
        const submissions = await prisma.submission.findMany({
            where: { userId },
            include: {
                evaluation: true,
                question: { select: { difficulty: true, tags: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        const totalSubmissions = submissions.length;
        const evaluatedSubmissions = submissions.filter(s => s.evaluation);

        const avgScore = evaluatedSubmissions.length > 0
            ? evaluatedSubmissions.reduce((sum, s) => sum + (s.evaluation?.overallScore || 0), 0) / evaluatedSubmissions.length
            : 0;

        const difficultyDistribution = {
            EASY: submissions.filter(s => s.question.difficulty === 'EASY').length,
            MEDIUM: submissions.filter(s => s.question.difficulty === 'MEDIUM').length,
            HARD: submissions.filter(s => s.question.difficulty === 'HARD').length,
        };

        const tagPerformance: Record<string, { total: number; avgScore: number }> = {};
        evaluatedSubmissions.forEach(s => {
            s.question.tags.forEach(tag => {
                if (!tagPerformance[tag]) {
                    tagPerformance[tag] = { total: 0, avgScore: 0 };
                }
                tagPerformance[tag].total++;
                tagPerformance[tag].avgScore += s.evaluation?.overallScore || 0;
            });
        });

        Object.keys(tagPerformance).forEach(tag => {
            tagPerformance[tag].avgScore /= tagPerformance[tag].total;
        });

        const recentScores = evaluatedSubmissions.slice(-10).map(s => ({
            date: s.createdAt,
            score: s.evaluation?.overallScore || 0,
        }));

        return {
            totalSubmissions,
            averageScore: Math.round(avgScore * 10) / 10,
            difficultyDistribution,
            tagPerformance,
            recentScores,
            streak: calculateStreak(submissions.map(s => s.createdAt)),
        };
    },
};

function calculateStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = [...new Set(dates.map(d => {
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        return day.getTime();
    }))].sort((a, b) => b - a);

    if (uniqueDays[0] < today.getTime() - 86400000) return 0;

    for (let i = 1; i < uniqueDays.length; i++) {
        if (uniqueDays[i - 1] - uniqueDays[i] === 86400000) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
