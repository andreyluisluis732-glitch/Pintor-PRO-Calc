import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase URL or Anon Key is missing. Supabase features will be disabled.');
      return null;
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

export const supabase = typeof window !== 'undefined' ? getSupabase() : null;
