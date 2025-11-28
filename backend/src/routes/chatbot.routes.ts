import express from 'express';
import * as chatbotController from '../controllers/chatbot.controller';
import protect from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Chatbot Routes
 * All routes require authentication
 */

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', protect, chatbotController.sendMessage);

// GET /api/chatbot/health - Check chatbot health
router.get('/health', protect, chatbotController.getHealth);

// GET /api/chatbot/capabilities - Get chatbot capabilities
router.get('/capabilities', protect, chatbotController.getCapabilities);

export default router;
