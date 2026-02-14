import { Router } from 'express';
import { interviewController } from '../controllers/interviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/sessions', authenticate, interviewController.startSession);
router.patch('/sessions/:id/end', authenticate, interviewController.endSession);
router.get('/sessions', authenticate, interviewController.getSessions);
router.get('/sessions/:id', authenticate, interviewController.getSession);

export { router as interviewRoutes };
