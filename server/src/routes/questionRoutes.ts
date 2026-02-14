import { Router } from 'express';
import { questionController } from '../controllers/questionController';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.get('/', questionController.getAll);
router.get('/:id', questionController.getById);
router.post('/', authenticate, roleGuard('ADMIN'), questionController.create);
router.put('/:id', authenticate, roleGuard('ADMIN'), questionController.update);
router.delete('/:id', authenticate, roleGuard('ADMIN'), questionController.delete);

export { router as questionRoutes };
