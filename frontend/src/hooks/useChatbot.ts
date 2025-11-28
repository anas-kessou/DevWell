import { useMutation, useQuery } from '@tanstack/react-query';
import { chatbotService } from '../services';
import { queryKeys } from '../lib/queryClient';
import type { SendMessageRequest } from '../types';

/**
 * Hook: useChatbotHealth
 * Checks if chatbot service is available
 */
export const useChatbotHealth = () => {
  return useQuery({
    queryKey: queryKeys.chatbot.health(),
    queryFn: () => chatbotService.getHealth(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook: useChatbotCapabilities
 * Gets available models and features
 */
export const useChatbotCapabilities = () => {
  return useQuery({
    queryKey: queryKeys.chatbot.capabilities(),
    queryFn: () => chatbotService.getCapabilities(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook: useSendMessage
 * Sends message to chatbot
 * 
 * Features:
 * - Automatic conversation history management
 * - Error handling
 * - Loading states
 */
export const useSendMessage = () => {
  return useMutation({
    mutationFn: (data: SendMessageRequest) => chatbotService.sendMessage(data),
    onError: (error) => {
      console.error('Chatbot error:', error);
    },
  });
};

/**
 * Hook: useChatbot
 * Complete chatbot functionality with conversation management
 * 
 * Returns conversation state and send function
 */
export const useChatbot = () => {
  const sendMessageMutation = useSendMessage();

  return {
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    data: sendMessageMutation.data,
    reset: sendMessageMutation.reset,
  };
};
