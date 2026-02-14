import prisma from '../lib/prisma';
import { Difficulty } from '@prisma/client';

export const questionService = {
    async getAll(filters?: { difficulty?: Difficulty; tags?: string[]; search?: string }) {
        const where: any = {};

        if (filters?.difficulty) {
            where.difficulty = filters.difficulty;
        }
        if (filters?.tags && filters.tags.length > 0) {
            where.tags = { hasSome: filters.tags };
        }
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return prisma.question.findMany({
            where,
            include: { testCases: { where: { isHidden: false } } },
            orderBy: { createdAt: 'desc' },
        });
    },

    async getById(id: string) {
        const question = await prisma.question.findUnique({
            where: { id },
            include: { testCases: true },
        });
        if (!question) throw new Error('Question not found');
        return question;
    },

    async create(data: {
        title: string;
        description: string;
        difficulty: Difficulty;
        tags: string[];
        hints?: string[];
        constraints?: string;
        examples?: string;
        starterCode?: any;
        testCases?: { input: string; expected: string; isHidden?: boolean }[];
    }) {
        const { testCases, ...questionData } = data;

        return prisma.question.create({
            data: {
                ...questionData,
                hints: data.hints || [],
                testCases: testCases
                    ? { create: testCases }
                    : undefined,
            },
            include: { testCases: true },
        });
    },

    async update(id: string, data: Partial<{
        title: string;
        description: string;
        difficulty: Difficulty;
        tags: string[];
        hints: string[];
        constraints: string;
        examples: string;
        starterCode: any;
    }>) {
        return prisma.question.update({
            where: { id },
            data,
            include: { testCases: true },
        });
    },

    async delete(id: string) {
        return prisma.question.delete({ where: { id } });
    },
};
