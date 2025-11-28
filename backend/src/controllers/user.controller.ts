import { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/user.model';

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { username, bio } = req.body;
    
    const updateData: any = {};
    if (username) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findByIdAndDelete(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
