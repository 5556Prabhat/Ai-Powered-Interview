import { Router } from 'express';
import { executeController } from '../controllers/executeController';

const router = Router();

// POST /api/execute — run code in Docker sandbox
router.post('/', executeController.execute);

export { router as executeRoutes };
