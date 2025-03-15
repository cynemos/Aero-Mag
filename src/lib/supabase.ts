import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const createSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key) => {
          try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.warn('Error writing to localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn('Error removing from localStorage:', error);
          }
        }
      }
    },
    global: {
      fetch: async (url, options) => {
        let attempts = 0;
        
        while (attempts < MAX_RETRIES) {
          try {
            const response = await fetch(url, options);
            
            // Handle refresh token errors silently
            if (response.status === 400) {
              const data = await response.clone().json();
              if (data.code === 'refresh_token_not_found') {
                // Clear auth data and return empty success response
                localStorage.removeItem('supabase.auth.token');
                return new Response(JSON.stringify({ user: null, session: null }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            }
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
          } catch (error) {
            attempts++;
            if (attempts === MAX_RETRIES) {
              throw error;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
          }
        }
        
        throw new Error('Max retries reached');
      }
    }
  });
};

export const supabase = createSupabaseClient();

// Utility function to retry a Supabase request
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
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
    }
  }
  
  throw new Error('Max retries reached');
};
