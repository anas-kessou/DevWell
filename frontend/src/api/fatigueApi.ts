import { apiClient } from '../lib/apiClient';

export interface FatigueDetectionData {
  status: string;
  confidence: number;
  metrics?: Record<string, unknown>;
  capturedAt?: string;
}

export interface FatigueEvent {
  _id: string;
  userId: string;
  status: string;
  confidence?: number;
  metrics?: Record<string, unknown>;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const fatigueApi = {
  // Detect fatigue and create event
  detectFatigue: async (data: FatigueDetectionData): Promise<{ event: FatigueEvent }> => {
    const response = await apiClient.post('/fatigue/detect', data);
    return response.data;
  },

  // Get fatigue history
  getHistory: async (limit = 50): Promise<{ history: FatigueEvent[] }> => {
    const response = await apiClient.get(`/fatigue/history?limit=${limit}`);
    return response.data;
  },

  // Legacy methods for compatibility with existing components
  createLog: async (data: { fatigue_level: string; confidence: number }) => {
    return fatigueApi.detectFatigue({
      status: data.fatigue_level,
      confidence: data.confidence / 100, // Convert percentage to decimal
      capturedAt: new Date().toISOString(),
    });
  },

  getTodayLogs: async () => {
    const response = await fatigueApi.getHistory(100);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter events from today
    return response.history
      .filter(event => new Date(event.createdAt) >= today)
      .map(event => ({
        id: event._id,
        user_id: event.userId,
        fatigue_level: event.status as 'alert' | 'tired' | 'rested',
        confidence: (event.confidence || 0) * 100, // Convert to percentage
        timestamp: event.capturedAt,
        created_at: event.createdAt,
      }));
  },
};
