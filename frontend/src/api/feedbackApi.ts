import { apiClient } from '../lib/apiClient';

export interface FeedbackData {
  message: string;
  rating?: number;
}

export interface Feedback {
  _id: string;
  userId: string;
  message: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export const feedbackApi = {
  // Add feedback
  addFeedback: async (data: FeedbackData): Promise<{ feedback: Feedback }> => {
    const response = await apiClient.post('/feedback/add', data);
    return response.data;
  },

  // Get recent feedback
  getRecentFeedback: async (limit = 10): Promise<{ feedback: Feedback[] }> => {
    const response = await apiClient.get(`/feedback/list?limit=${limit}`);
    return response.data;
  },

  // Legacy method for compatibility
  createFeedback: async (data: { rating: number; comment?: string }) => {
    return feedbackApi.addFeedback({
      message: data.comment || '',
      rating: data.rating,
    });
  },

  getFeedback: async () => {
    const response = await feedbackApi.getRecentFeedback(100);
    return response.feedback;
  },
};
