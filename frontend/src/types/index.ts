export * from './auth.types';
export * from './fatigue.types';
export * from './feedback.types';
export * from './chatbot.types';

// Gemini Live Types
export interface LogEntry {
  id: string;
  timestamp: Date;
  sender: 'user' | 'ai' | 'system';
  message: string;
  type?: 'normal' | 'alert' | 'success';
}

export interface HealthEvent {
  type: 'FATIGUE' | 'POSTURE' | 'STRESS' | 'FOCUS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}
