import { apiClient } from '../lib/apiClient';
import type {
  SendMessageRequest,
  SendMessageResponse,
  ChatbotHealthResponse,
  ChatbotCapabilitiesResponse,
} from '../types';

/**
 * Chatbot Service Layer
 * Handles all AI chatbot-related API calls
 */
export const chatbotService = {
  /**
   * Send message to chatbot
   */
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>('/chatbot/message', data);
    return response.data;
  },

  /**
   * Get chatbot health status
   */
  getHealth: async (): Promise<ChatbotHealthResponse> => {
    const response = await apiClient.get<ChatbotHealthResponse>('/chatbot/health');
    return response.data;
  },

  /**
   * Get chatbot capabilities
   */
  getCapabilities: async (): Promise<ChatbotCapabilitiesResponse> => {
    const response = await apiClient.get<ChatbotCapabilitiesResponse>('/chatbot/capabilities');
    return response.data;
  },
};
