import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        data: {
          email_confirmed: true
        }
      }
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Identifiants de connexion invalides');
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email_confirmed: true
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('Un compte existe déjà avec cet email');
      }
      throw error;
    }

    // If signup succeeds, attempt immediate login
    if (data.user) {
      try {
        await signIn(email, password);
      } catch (err) {
        console.error('Échec de la connexion automatique après inscription:', err);
      }
    }

    return data;
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // First try to sign out without checking session
    const { error: signOutError } = await supabase.auth.signOut();
    
    // If there's no error or it's just a session_not_found error, consider it successful
    if (!signOutError || signOutError.message?.includes('session_not_found')) {
      return;
    }

    // If we get here, there was a real error
    throw signOutError;
  } catch (error) {
    // Only throw if it's a real error (not empty or session_not_found)
    if (error && 
        typeof error === 'object' && 
        Object.keys(error).length > 0 && 
        !(error instanceof Error && error.message?.includes('session_not_found'))) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    if (error) throw error;
  } catch (error) {
    console.error('Erreur de réinitialisation du mot de passe:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  } catch (error) {
    console.error('Erreur de mise à jour du mot de passe:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const { error } = await supabase.rpc('delete_user');
    if (error) throw error;
    
    // Sign out after account deletion
    await signOut();
  } catch (error) {
    console.error('Erreur de suppression du compte:', error);
    throw error;
  }
};
