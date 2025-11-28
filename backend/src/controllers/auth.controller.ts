import { Request, Response } from 'express';
import * as UserService from '../services/user.service';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, name, email, password } = req.body ?? {};
    const resolvedUsername = typeof username === 'string' && username.trim().length > 0
      ? username
      : typeof name === 'string'
        ? name
        : undefined;

    if (!resolvedUsername || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await UserService.registerUser(resolvedUsername, email, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await UserService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await UserService.getUserProfile(req.userId);
    return res.json({ user });
  } catch (error: any) {
    const status = error.message === 'User not found' ? 404 : 500;
    return res.status(status).json({ message: error.message });
  }
};
