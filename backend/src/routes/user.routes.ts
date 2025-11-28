import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { updateProfile, deleteAccount } from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// Update user profile (username, bio, etc.)
router.put('/profile', updateProfile);

// Delete user account
router.delete('/account', deleteAccount);

export default router;
