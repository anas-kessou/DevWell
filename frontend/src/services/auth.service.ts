import { apiClient } from '../lib/apiClient';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types';

/**
 * Authentication Service Layer
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user and get authentication token
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  getProfile: async (): Promise<GetProfileResponse> => {
    const response = await apiClient.get<GetProfileResponse>('/auth/me');
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>('/user/profile', data);
    return response.data;
  },

  /**
   * Delete current user account
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/user/account');
  },
};

/**
 * Token Management Utilities
 */
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

/**
 * User Data Utilities
 */
export const userStorage = {
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem('user');
  },
};
