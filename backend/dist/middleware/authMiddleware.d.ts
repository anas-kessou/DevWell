import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    userId?: string;
    user?: any;
}
declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default authMiddleware;
//# sourceMappingURL=authMiddleware.d.ts.map