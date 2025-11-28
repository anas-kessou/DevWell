import { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
export declare const updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAccount: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=user.controller.d.ts.map