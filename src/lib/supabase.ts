import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

const createSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: async (url, options) => {
        let attempts = 0;
        
        while (attempts < MAX_RETRIES) {
          try {
            const response = await fetch(url, options);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
          } catch (error) {
            attempts++;
            if (attempts === MAX_RETRIES) {
              throw error;
            }
            // Attendre avant de réessayer
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
          }
        }
        
        throw new Error('Max retries reached');
      }
    }
  });
};

export const supabase = createSupabaseClient();

// Fonction utilitaire pour réessayer une requête Supabase
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      if (attempts === maxRetries) {
        throw error;
      }
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
    }
  }
  
  throw new Error('Max retries reached');
};
