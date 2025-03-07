import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // D'abord, essayons de récupérer le profil existant
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Si le profil n'existe pas, créons-en un
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) throw createError;
      return newProfile;
    }
    throw error;
  }

  return data;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
