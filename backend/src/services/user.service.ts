import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

export const registerUser = async (username: string, email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new Error('User already exists');

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email: normalizedEmail, password: hashed });
  await user.save();

  const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email
  };
};
