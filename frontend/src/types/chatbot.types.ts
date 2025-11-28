// Chatbot related types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatbotModel {
  id: 'gemini' | 'llama' | 'openrouter' | 'auto';
  name: string;
  description: string;
  quota?: string;
  features?: string[];
}

export interface SendMessageRequest {
  message: string;
  model?: 'gemini' | 'llama' | 'openrouter' | 'auto';
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface SendMessageResponse {
  success: boolean;
  response: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatbotHealthResponse {
  status: 'healthy' | 'unhealthy' | 'error';
  geminiAvailable: boolean;
  llamaAvailable: boolean;
  error?: string;
}

export interface ChatbotCapabilitiesResponse {
  models: ChatbotModel[];
  features: string[];
}
