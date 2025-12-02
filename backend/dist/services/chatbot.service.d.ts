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
    private ai;
    private openRouterKey;
    constructor();
    chat(prompt: string, model?: string, conversationHistory?: ChatMessage[]): Promise<ChatResponse>;
    private chatWithGemini;
    private chatWithOpenRouter;
    healthCheck(): Promise<HealthCheckResponse>;
}
declare const _default: ChatbotService;
export default _default;
//# sourceMappingURL=chatbot.service.d.ts.map