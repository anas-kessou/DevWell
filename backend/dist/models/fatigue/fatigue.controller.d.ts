import { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/authMiddleware';
export declare const detectFatigue: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const fetchFatigueHistory: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=fatigue.controller.d.ts.map