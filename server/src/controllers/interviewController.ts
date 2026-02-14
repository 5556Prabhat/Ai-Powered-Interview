import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const interviewController = {
    async startSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { topic, mode } = req.body;
            const session = await prisma.interviewSession.create({
                data: {
                    userId: req.userId!,
                    topic: topic || 'General',
                    mode: mode || 'standard',
                },
                include: { messages: true },
            });
            res.status(201).json(session);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async endSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            const session = await prisma.interviewSession.update({
                where: { id: req.params.id },
                data: { status: 'completed', endedAt: new Date() },
                include: { messages: true },
            });
            res.json(session);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getSessions(req: AuthRequest, res: Response): Promise<void> {
        try {
            const sessions = await prisma.interviewSession.findMany({
                where: { userId: req.userId! },
                include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
                orderBy: { startedAt: 'desc' },
            });
            res.json(sessions);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            const session = await prisma.interviewSession.findUnique({
                where: { id: req.params.id },
                include: { messages: { orderBy: { createdAt: 'asc' } } },
            });
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json(session);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },
};
