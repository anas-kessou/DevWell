import { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/authMiddleware';
export declare const addFeedback: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=feedback.controller.d.ts.map