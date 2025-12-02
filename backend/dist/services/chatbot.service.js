"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const library_service_1 = require("./library.service");
class ChatbotService {
    constructor() {
        this.ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.openRouterKey = process.env.OPENROUTER_API_KEY || '';
    }
    async chat(prompt, model = 'auto', conversationHistory = []) {
        try {
            // 1. Retrieve Context from Library (RAG)
            const contextItems = await library_service_1.libraryService.search(prompt);
            let contextString = '';
            if (contextItems.length > 0) {
                contextString = "\n\nRelevant Context from Personal Library:\n" +
                    contextItems.map(item => `[Source: ${item.source}]\n${item.text}`).join('\n\n');
            }
            // 2. Prepare System Prompt
            const systemPrompt = `You are DevWell, an expert AI developer companion. 
      Your goal is to help the developer with health, productivity, and coding.
      
      If the user asks a question that can be answered using the "Relevant Context" provided below, use it to answer accurately.
      If the context is not relevant, ignore it.
      
      ${contextString}`;
            // 3. Route to Model
            if (model === 'gemini' || (model === 'auto' && !this.openRouterKey)) {
                return this.chatWithGemini(prompt, systemPrompt, conversationHistory);
            }
            else {
                // Default to OpenRouter (Llama 3.3) for 'auto', 'llama', 'openrouter'
                const targetModel = model === 'llama' ? 'meta-llama/llama-3.3-70b-instruct:free' :
                    (model.startsWith('openrouter:') ? model.split(':')[1] || 'meta-llama/llama-3.3-70b-instruct:free' :
                        'meta-llama/llama-3.3-70b-instruct:free');
                return this.chatWithOpenRouter(prompt, targetModel, systemPrompt, conversationHistory);
            }
        }
        catch (error) {
            console.error('Chat error:', error);
            return {
                success: false,
                response: 'Sorry, I encountered an error processing your request.',
                model: 'error',
                error: error.message
            };
        }
    }
    async chatWithGemini(prompt, systemInstruction, history) {
        try {
            const model = this.ai.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
                systemInstruction
            });
            const chat = model.startChat({
                history: history.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }))
            });
            const result = await chat.sendMessage(prompt);
            const response = result.response.text();
            return {
                success: true,
                response,
                model: 'gemini-2.0-flash-exp'
            };
        }
        catch (error) {
            throw new Error(`Gemini Error: ${error.message}`);
        }
    }
    async chatWithOpenRouter(prompt, model, systemInstruction, history) {
        if (!this.openRouterKey) {
            throw new Error("OpenRouter API Key not configured");
        }
        const messages = [
            { role: 'system', content: systemInstruction },
            ...history,
            { role: 'user', content: prompt }
        ];
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.openRouterKey}`,
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "DevWell AI Assistant",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                messages
            })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(`OpenRouter Error: ${data.error.message}`);
        }
        return {
            success: true,
            response: data.choices[0].message.content,
            model: model
        };
    }
    async healthCheck() {
        return {
            status: 'healthy',
            geminiAvailable: !!process.env.GEMINI_API_KEY,
            llamaAvailable: !!process.env.OPENROUTER_API_KEY,
            error: null
        };
    }
}
exports.default = new ChatbotService();
//# sourceMappingURL=chatbot.service.js.map