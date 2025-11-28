import { spawn } from 'child_process';
import path from 'path';

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

class ChatbotService {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.scriptPath = path.join(__dirname, '../../chatbot/chat.py');
  }

  /**
   * Send message to chatbot and get response
   * 
   * @param prompt - User's message
   * @param model - "gemini", "llama", or "auto"
   * @param conversationHistory - Previous messages for context
   * @returns Chatbot response
   */
  async chat(prompt: string, model: string = 'auto', conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const input = {
        prompt,
        model,
        conversation_history: conversationHistory
      };

      // Use base64 encoding to safely pass JSON with special characters
      const inputBase64 = Buffer.from(JSON.stringify(input)).toString('base64');

      const python = spawn(this.pythonPath, [
        '-c',
        `
import sys
import json
import base64
sys.path.append('${path.dirname(this.scriptPath)}')
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
        } catch (e) {
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
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const result = await this.chat('test', 'auto', []);
      return {
        status: result.success ? 'healthy' : 'unhealthy',
        geminiAvailable: result.success,
        llamaAvailable: result.success,
        error: result.error || null
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message,
        geminiAvailable: false,
        llamaAvailable: false
      };
    }
  }
}

export default new ChatbotService();
