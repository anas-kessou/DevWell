import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FatigueLog {
  id: string;
  user_id: string;
  fatigue_level: 'alert' | 'tired' | 'rested';
  confidence: number;
  timestamp: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  message: string;
  rating: number;
  created_at: string;
}
