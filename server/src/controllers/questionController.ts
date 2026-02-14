import { Request, Response } from 'express';
import { questionService } from '../services/questionService';
import { AuthRequest } from '../middleware/auth';
import { Difficulty } from '@prisma/client';

export const questionController = {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { difficulty, tags, search } = req.query;
            const questions = await questionService.getAll({
                difficulty: difficulty as Difficulty | undefined,
                tags: tags ? (tags as string).split(',') : undefined,
                search: search as string | undefined,
            });
            res.json(questions);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const question = await questionService.getById(req.params.id);
            res.json(question);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    },

    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const question = await questionService.create(req.body);
            res.status(201).json(question);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async update(req: AuthRequest, res: Response): Promise<void> {
        try {
            const question = await questionService.update(req.params.id, req.body);
            res.json(question);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async delete(req: AuthRequest, res: Response): Promise<void> {
        try {
            await questionService.delete(req.params.id);
            res.json({ message: 'Question deleted' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },
};
