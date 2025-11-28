// Central export for all types
export * from './auth.types';
export * from './fatigue.types';
export * from './feedback.types';
export * from './chatbot.types';

// Common API types
export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
