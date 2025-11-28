import { apiClient } from '../lib/apiClient';
import type {
  DetectFatigueRequest,
  DetectFatigueResponse,
  FatigueHistoryResponse,
  FatigueHistoryParams,
} from '../types';

/**
 * Fatigue Detection Service Layer
 * Handles all fatigue-related API calls
 */
export const fatigueService = {
  /**
   * Log a new fatigue detection event
   */
  detectFatigue: async (data: DetectFatigueRequest): Promise<DetectFatigueResponse> => {
    const response = await apiClient.post<DetectFatigueResponse>('/fatigue/detect', {
      ...data,
      capturedAt: data.capturedAt || new Date().toISOString(),
    });
    return response.data;
  },

  /**
   * Get fatigue detection history
   */
  getHistory: async (params?: FatigueHistoryParams): Promise<FatigueHistoryResponse> => {
    const response = await apiClient.get<FatigueHistoryResponse>('/fatigue/history', {
      params,
    });
    return response.data;
  },

  /**
   * Get today's fatigue logs
   */
  getTodayLogs: async (): Promise<FatigueHistoryResponse> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return fatigueService.getHistory({
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
    });
  },

  /**
   * Get fatigue statistics for a date range
   */
  getStatistics: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/fatigue/statistics', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
