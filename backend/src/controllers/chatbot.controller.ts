import { Request, Response } from 'express';
import chatbotService from '../services/chatbot.service';

/**
 * Chatbot Controller
 * Handles AI chatbot interactions
 */

/**
 * Send message to chatbot
 * POST /api/chatbot/message
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, model = 'auto', conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        msg: 'Message is required and must be a string'
      });
    }

    // Validate model
    const validModels = ['gemini', 'llama', 'openrouter', 'auto'];
    if (!validModels.includes(model) && !model.startsWith('openrouter:')) {
      return res.status(400).json({
        msg: `Invalid model. Must be one of: ${validModels.join(', ')} or openrouter:model-name`
      });
    }

    // Get chatbot response
    const result = await chatbotService.chat(message, model, conversationHistory);

    if (result.success) {
      res.json({
        success: true,
        response: result.response,
        model: result.model,
        usage: result.usage || null
      });
    } else {
      // Return detailed error to help debug
      const errorMsg = result.error || 'Unknown error occurred';
      res.status(500).json({
        success: false,
        msg: errorMsg.includes('quota') ? 'API quota exceeded. Please wait a few minutes or try a different model.' : 'Chatbot error',
        error: errorMsg
      });
    }
  } catch (error: any) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      msg: 'Failed to get chatbot response',
      error: error.message
    });
  }
};

/**
 * Get chatbot health status
 * GET /api/chatbot/health
 */
export const getHealth = async (req: Request, res: Response) => {
  try {
    const health = await chatbotService.healthCheck();
    res.json(health);
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
};

/**
 * Get chatbot capabilities
 * GET /api/chatbot/capabilities
 */
export const getCapabilities = (req: Request, res: Response) => {
  res.json({
    models: [
      {
        id: 'auto',
        name: 'Auto (Recommended)',
        description: 'Intelligent routing via OpenRouter - Llama 3.3 70B',
        quota: 'Generous free tier',
        features: ['Best availability', 'Fast responses', 'Free']
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Access to 100+ AI models through unified API',
        quota: 'Varies by model, many free options',
        features: ['Multiple models', 'High availability', 'Extensible']
      }
    ],
    features: [
      'Health & productivity tips',
      'Fatigue management advice',
      'Ergonomics guidance',
      'Work-life balance suggestions',
      'DevWell feature explanations',
      'Future: Code assistance & debugging',
      'Future: Latest dev trends & research',
      'Future: Design patterns & best practices',
      'Future: innovative ideas'
    ],
    roadmap: [
      'Specialized models for code assistance',
      'Research assistant for latest tech trends',
      'Design pattern recommendations',
      'Performance optimization suggestions'
    ]
  });
};
