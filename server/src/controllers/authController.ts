import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export const authController = {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, password, role } = req.body;
            const result = await authService.register(email, name, password, role);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    },

    async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const user = await authService.getProfile(req.userId!);
            res.json(user);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    },
};
