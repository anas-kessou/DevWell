import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '../services';
import { queryKeys } from '../lib/queryClient';
import type {
  AddFeedbackRequest,
  FeedbackListParams,
  Feedback,
} from '../types';

/**
 * Hook: useRecentFeedback
 * Fetches recent feedback entries
 * 
 * Features:
 * - Supports limit parameter
 * - Caches results
 */
export const useRecentFeedback = (params?: FeedbackListParams) => {
  return useQuery({
    queryKey: queryKeys.feedback.recent(params?.limit),
    queryFn: () => feedbackService.getRecentFeedback(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Hook: useUserFeedback
 * Fetches current user's feedback
 */
export const useUserFeedback = () => {
  return useQuery({
    queryKey: queryKeys.feedback.user(),
    queryFn: () => feedbackService.getUserFeedback(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook: useAddFeedback
 * Submits new feedback
 * 
 * Features:
 * - Optimistic update
 * - Invalidates feedback cache on success
 * - Rollback on error
 */
export const useAddFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddFeedbackRequest) => feedbackService.addFeedback(data),
    
    // Optimistic update
    onMutate: async (newFeedback) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.feedback.user() });
      
      // Snapshot previous value
      const previousFeedback = queryClient.getQueryData(queryKeys.feedback.user());
      
      // Create optimistic feedback
      const optimisticFeedback: Feedback = {
        id: `temp-${Date.now()}`,
        userId: 'current',
        message: newFeedback.message,
        rating: newFeedback.rating,
        createdAt: new Date().toISOString(),
      };
      
      // Optimistically update cache
      queryClient.setQueryData(queryKeys.feedback.user(), (old: any) => {
        if (!old) return { feedback: [optimisticFeedback], total: 1 };
        return {
          feedback: [optimisticFeedback, ...old.feedback],
          total: old.total + 1,
        };
      });
      
      return { previousFeedback };
    },
    
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousFeedback) {
        queryClient.setQueryData(queryKeys.feedback.user(), context.previousFeedback);
      }
    },
    
    // On success, invalidate to refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
  });
};

/**
 * Hook: useDeleteFeedback
 * Deletes a feedback entry
 * 
 * Features:
 * - Optimistic removal
 * - Rollback on error
 */
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) => feedbackService.deleteFeedback(feedbackId),
    
    // Optimistic update
    onMutate: async (feedbackId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.feedback.user() });
      
      const previousFeedback = queryClient.getQueryData(queryKeys.feedback.user());
      
      // Remove feedback from cache
      queryClient.setQueryData(queryKeys.feedback.user(), (old: any) => {
        if (!old) return old;
        return {
          feedback: old.feedback.filter((f: Feedback) => f.id !== feedbackId),
          total: old.total - 1,
        };
      });
      
      return { previousFeedback };
    },
    
    onError: (_error, _variables, context) => {
      if (context?.previousFeedback) {
        queryClient.setQueryData(queryKeys.feedback.user(), context.previousFeedback);
      }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
  });
};
