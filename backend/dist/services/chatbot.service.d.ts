/**
 * DevWell AI Chatbot Service
 *
 * Communicates with Python chatbot script to provide AI assistance via OpenRouter.
 *
 * Current: Health & productivity assistance
 * Future: Code assistance, research, design patterns, tech trends
 */
interface ChatMessage {
    role: string;
    content: string;
}
interface ChatResponse {
    success: boolean;
    response: string;
    model: string;
    error?: string;
    usage?: any;
}
interface HealthCheckResponse {
    status: string;
    geminiAvailable: boolean;
    llamaAvailable: boolean;
    error?: string | null;
}
declare class ChatbotService {
    private pythonPath;
    private scriptPath;
    constructor();
    /**
     * Send message to chatbot and get response
     *
     * @param prompt - User's message
     * @param model - "gemini", "llama", or "auto"
     * @param conversationHistory - Previous messages for context
     * @returns Chatbot response
     */
    chat(prompt: string, model?: string, conversationHistory?: ChatMessage[]): Promise<ChatResponse>;
    /**
     * Health check - verify Python environment is set up
     */
    healthCheck(): Promise<HealthCheckResponse>;
}
declare const _default: ChatbotService;
export default _default;
//# sourceMappingURL=chatbot.service.d.ts.map