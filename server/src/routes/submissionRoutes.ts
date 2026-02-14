import { Router } from 'express';
import { submissionController } from '../controllers/submissionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, submissionController.submit);
router.get('/analytics', authenticate, submissionController.getAnalytics);
router.get('/mine', authenticate, submissionController.getUserSubmissions);
router.get('/:id', authenticate, submissionController.getSubmission);

export { router as submissionRoutes };
