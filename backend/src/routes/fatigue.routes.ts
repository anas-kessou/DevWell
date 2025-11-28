import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { detectFatigue, fetchFatigueHistory } from '../controllers/fatigue.controller';

const router = Router();

router.post('/detect', authMiddleware, detectFatigue);
router.get('/history', authMiddleware, fetchFatigueHistory);

export default router;
