import { apiClient } from '../lib/apiClient';
import type {
  AddFeedbackRequest,
  AddFeedbackResponse,
  FeedbackListResponse,
  FeedbackListParams,
} from '../types';

/**
 * Feedback Service Layer
 * Handles all feedback-related API calls
 */
export const feedbackService = {
  /**
   * Submit new feedback
   */
  addFeedback: async (data: AddFeedbackRequest): Promise<AddFeedbackResponse> => {
    const response = await apiClient.post<AddFeedbackResponse>('/feedback/add', data);
    return response.data;
  },

  /**
   * Get recent feedback list
   */
  getRecentFeedback: async (params?: FeedbackListParams): Promise<FeedbackListResponse> => {
    const response = await apiClient.get<FeedbackListResponse>('/feedback/list', {
      params: {
        limit: params?.limit || 10,
      },
    });
    return response.data;
  },

  /**
   * Get all user's feedback
   */
  getUserFeedback: async (): Promise<FeedbackListResponse> => {
    const response = await apiClient.get<FeedbackListResponse>('/feedback/user');
    return response.data;
  },

  /**
   * Delete a feedback entry
   */
  deleteFeedback: async (feedbackId: string): Promise<void> => {
    await apiClient.delete(`/feedback/${feedbackId}`);
  },
};
