import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fatigueService } from '../services';
import { queryKeys } from '../lib/queryClient';
import type {
  DetectFatigueRequest,
  FatigueHistoryParams,
  FatigueLog,
} from '../types';

/**
 * Hook: useFatigueHistory
 * Fetches fatigue detection history
 * 
 * Features:
 * - Supports pagination and filtering
 * - Caches results
 * - Auto-refetches on window focus
 */
export const useFatigueHistory = (params?: FatigueHistoryParams) => {
  return useQuery({
    queryKey: queryKeys.fatigue.history(params),
    queryFn: () => fatigueService.getHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (fresher than default)
  });
};

/**
 * Hook: useTodayFatigueLogs
 * Fetches today's fatigue logs
 * 
 * Features:
 * - Automatically filters for today
 * - Refetches every 30 seconds for real-time monitoring
 */
export const useTodayFatigueLogs = () => {
  return useQuery({
    queryKey: queryKeys.fatigue.today(),
    queryFn: () => fatigueService.getTodayLogs(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30s
  });
};

/**
 * Hook: useFatigueStatistics
 * Fetches fatigue statistics for date range
 */
export const useFatigueStatistics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: queryKeys.fatigue.statistics(startDate, endDate),
    queryFn: () => fatigueService.getStatistics(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

/**
 * Hook: useDetectFatigue
 * Logs a new fatigue detection event
 * 
 * Features:
 * - Invalidates history cache on success
 * - Updates today's logs immediately
 * - Optimistic update for instant UI feedback
 */
export const useDetectFatigue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DetectFatigueRequest) => fatigueService.detectFatigue(data),
    
    // Optimistic update
    onMutate: async (newLog) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.fatigue.today() });
      
      // Snapshot previous value
      const previousLogs = queryClient.getQueryData(queryKeys.fatigue.today());
      
      // Optimistically update cache
      const optimisticLog: FatigueLog = {
        id: `temp-${Date.now()}`,
        userId: 'current',
        status: newLog.status,
        confidence: newLog.confidence,
        capturedAt: newLog.capturedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData(queryKeys.fatigue.today(), (old: any) => {
        if (!old) return { logs: [optimisticLog], total: 1 };
        return {
          logs: [optimisticLog, ...old.logs],
          total: old.total + 1,
        };
      });
      
      return { previousLogs };
    },
    
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(queryKeys.fatigue.today(), context.previousLogs);
      }
    },
    
    // On success, invalidate to refetch
    onSuccess: () => {
      // Invalidate all fatigue queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.fatigue.all });
    },
  });
};

/**
 * Hook: useFatigueMonitor
 * Combines history and detection for real-time monitoring
 * 
 * Returns both data and mutation function
 */
export const useFatigueMonitor = () => {
  const todayLogs = useTodayFatigueLogs();
  const detectMutation = useDetectFatigue();

  return {
    logs: todayLogs.data?.logs || [],
    total: todayLogs.data?.total || 0,
    isLoading: todayLogs.isLoading,
    isError: todayLogs.isError,
    error: todayLogs.error,
    refetch: todayLogs.refetch,
    detect: detectMutation.mutate,
    isDetecting: detectMutation.isPending,
    detectError: detectMutation.error,
  };
};
