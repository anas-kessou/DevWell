import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('authorization') || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ msg: 'JWT_SECRET not configured' });

    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(raw, secret) as { userId: string };

    //  Step 1: Attach userId
    req.userId = decoded.userId;

    //  Step 2: Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'User does not exist' });
    }

    // Step 3: Attach full user object
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

export default authMiddleware;
