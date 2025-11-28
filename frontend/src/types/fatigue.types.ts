// Fatigue detection related types
export type FatigueLevel = 'alert' | 'tired' | 'rested';

export interface FatigueLog {
  id: string;
  userId: string;
  status: FatigueLevel;
  confidence: number;
  capturedAt: string;
  createdAt: string;
}

export interface DetectFatigueRequest {
  status: FatigueLevel;
  confidence: number;
  capturedAt?: string;
}

export interface DetectFatigueResponse {
  log: FatigueLog;
  msg: string;
}

export interface FatigueHistoryResponse {
  logs: FatigueLog[];
  total: number;
}

export interface FatigueHistoryParams {
  limit?: number;
  startDate?: string;
  endDate?: string;
}
