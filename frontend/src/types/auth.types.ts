// Authentication related types
export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

export interface GetProfileResponse {
  user: User;
}
