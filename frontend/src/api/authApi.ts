import { apiClient } from '../lib/apiClient';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  createdAt: string;
}

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: UserProfile }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: { username?: string; bio?: string }): Promise<{ user: UserProfile }> => {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/user/account');
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
