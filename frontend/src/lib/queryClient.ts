import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient configuration for TanStack Query
 * 
 * Configuration explained:
 * - staleTime: How long data is considered fresh (5 minutes)
 * - cacheTime: How long unused data stays in cache (10 minutes)
 * - retry: Number of failed request retries (1 retry for better UX)
 * - refetchOnWindowFocus: Automatically refetch when user returns to tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});

/**
 * Query Keys Factory
 * Centralized query key management for cache invalidation
 * 
 * Pattern: ['entity', 'action', ...params]
 * Benefits:
 * - Easy to invalidate all queries of a type
 * - Type-safe with TypeScript
 * - Prevents key conflicts
 */
export const queryKeys = {
  // Auth keys
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    user: (userId: string) => [...queryKeys.auth.all, 'user', userId] as const,
  },
  
  // Fatigue keys
  fatigue: {
    all: ['fatigue'] as const,
    history: (params?: Record<string, any>) => 
      [...queryKeys.fatigue.all, 'history', params] as const,
    today: () => [...queryKeys.fatigue.all, 'today'] as const,
    statistics: (startDate: string, endDate: string) => 
      [...queryKeys.fatigue.all, 'statistics', { startDate, endDate }] as const,
  },
  
  // Feedback keys
  feedback: {
    all: ['feedback'] as const,
    list: (params?: Record<string, any>) => 
      [...queryKeys.feedback.all, 'list', params] as const,
    user: () => [...queryKeys.feedback.all, 'user'] as const,
    recent: (limit?: number) => 
      [...queryKeys.feedback.all, 'recent', limit] as const,
  },
  
  // Chatbot keys
  chatbot: {
    all: ['chatbot'] as const,
    health: () => [...queryKeys.chatbot.all, 'health'] as const,
    capabilities: () => [...queryKeys.chatbot.all, 'capabilities'] as const,
    conversation: (conversationId: string) => 
      [...queryKeys.chatbot.all, 'conversation', conversationId] as const,
  },
} as const;
