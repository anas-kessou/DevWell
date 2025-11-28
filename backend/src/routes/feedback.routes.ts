import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { addFeedback, listFeedback } from '../controllers/feedback.controller';

const router = Router();

router.post('/add', authMiddleware, addFeedback);
router.get('/', listFeedback);

export default router;