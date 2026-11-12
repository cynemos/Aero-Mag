import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// La bibliothèque est publique en lecture. Seuls les comptes listés dans la table
// public.admins peuvent la modifier : c'est la base qui décide (fonction is_admin()
// et règles d'accès), le site ne fait qu'afficher ou masquer les écrans d'administration.
export type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, loading: true });

export const useAuth = () => useContext(AuthContext);

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      error.message.includes('Invalid login credentials') ? 'Email ou mot de passe incorrect' : error.message
    );
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error && !error.message?.includes('session_not_found')) throw error;
};
