import { Request, Response } from 'express';
/**
 * Chatbot Controller
 * Handles AI chatbot interactions
 */
/**
 * Send message to chatbot
 * POST /api/chatbot/message
 */
export declare const sendMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get chatbot health status
 * GET /api/chatbot/health
 */
export declare const getHealth: (req: Request, res: Response) => Promise<void>;
/**
 * Get chatbot capabilities
 * GET /api/chatbot/capabilities
 */
export declare const getCapabilities: (req: Request, res: Response) => void;
//# sourceMappingURL=chatbot.controller.d.ts.map