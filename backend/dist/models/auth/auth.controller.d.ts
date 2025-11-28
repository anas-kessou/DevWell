import { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/authMiddleware';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map