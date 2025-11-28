"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class ChatbotService {
    constructor() {
        this.pythonPath = process.env.PYTHON_PATH || 'python3';
        this.scriptPath = path_1.default.join(__dirname, '../../chatbot/chat.py');
    }
    /**
     * Send message to chatbot and get response
     *
     * @param prompt - User's message
     * @param model - "gemini", "llama", or "auto"
     * @param conversationHistory - Previous messages for context
     * @returns Chatbot response
     */
    async chat(prompt, model = 'auto', conversationHistory = []) {
        return new Promise((resolve, reject) => {
            const input = {
                prompt,
                model,
                conversation_history: conversationHistory
            };
            // Use base64 encoding to safely pass JSON with special characters
            const inputBase64 = Buffer.from(JSON.stringify(input)).toString('base64');
            const python = (0, child_process_1.spawn)(this.pythonPath, [
                '-c',
                `
import sys
import json
import base64
sys.path.append('${path_1.default.dirname(this.scriptPath)}')
from chat import chat

input_data = json.loads(base64.b64decode('${inputBase64}').decode('utf-8'))
result = chat(
    prompt=input_data['prompt'],
    model=input_data['model'],
    conversation_history=input_data.get('conversation_history', [])
)
print(json.dumps(result))
        `
            ]);
            let output = '';
            let error = '';
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            python.stderr.on('data', (data) => {
                error += data.toString();
            });
            python.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${error}`));
                    return;
                }
                try {
                    const result = JSON.parse(output.trim());
                    resolve(result);
                }
                catch (e) {
                    reject(new Error(`Failed to parse Python output: ${output}`));
                }
            });
            python.on('error', (err) => {
                reject(new Error(`Failed to start Python: ${err.message}`));
            });
        });
    }
    /**
     * Health check - verify Python environment is set up
     */
    async healthCheck() {
        try {
            const result = await this.chat('test', 'auto', []);
            return {
                status: result.success ? 'healthy' : 'unhealthy',
                geminiAvailable: result.success,
                llamaAvailable: result.success,
                error: result.error || null
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                geminiAvailable: false,
                llamaAvailable: false
            };
        }
    }
}
exports.default = new ChatbotService();
//# sourceMappingURL=chatbot.service.js.map