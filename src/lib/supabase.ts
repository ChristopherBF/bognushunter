import { createClient } from '@supabase/supabase-js';

// Default to these values if environment variables aren't available
// In production, these would be set properly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pectjcgoyjxgrlssbfuy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'vgRaqmZGB7YU7tY2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseClient = () => {
  return supabase;
};

export interface SuggestionEvent {
  id: string;
  date: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  event_id: string;
  item: string;
  count: number;
  created_at: string;
}

export interface HuntItem {
  id: string;
  suggestion_id: string;
  wager: number;
  result: number;
  bonus: boolean;
  super_bonus: boolean;
  completed: boolean;
  created_at: string;
}
