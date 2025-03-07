import { supabase, retryOperation } from './supabase';
import type { Database } from '../types/supabase';

export type Magazine = Database['public']['Tables']['magazines']['Row'];
export type InsertMagazine = Database['public']['Tables']['magazines']['Insert'];
export type UpdateMagazine = Database['public']['Tables']['magazines']['Update'];

export const getMagazines = async () => {
  try {
    const { data, error } = await retryOperation(async () => 
      supabase
        .from('magazines')
        .select('*')
        .order('publication_date', { ascending: false })
    );

    if (error) {
      console.error('Error fetching magazines:', error);
      throw new Error('Impossible de récupérer les magazines');
    }

    return data || [];
  } catch (err) {
    console.error('Error in getMagazines:', err);
    throw err;
  }
};

export const getMagazineById = async (id: string) => {
  try {
    const { data, error } = await retryOperation(async () =>
      supabase
        .from('magazines')
        .select('*')
        .eq('id', id)
        .maybeSingle()
    );

    if (error) {
      console.error('Error fetching magazine:', error);
      throw new Error('Impossible de récupérer le magazine');
    }

    if (!data) {
      throw new Error('Magazine introuvable');
    }

    return data;
  } catch (err) {
    console.error('Error in getMagazineById:', err);
    throw err;
  }
};

export const createMagazine = async (magazine: InsertMagazine) => {
  try {
    const { data, error } = await retryOperation(async () =>
      supabase
        .from('magazines')
        .insert({
          ...magazine,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
    );

    if (error) {
      console.error('Error creating magazine:', error);
      if (error.code === '23505') {
        throw new Error('Un magazine avec ce titre et ce numéro existe déjà');
      }
      throw new Error('Impossible de créer le magazine');
    }

    return data;
  } catch (err) {
    console.error('Error in createMagazine:', err);
    throw err;
  }
};

export const updateMagazine = async (id: string, magazine: UpdateMagazine) => {
  try {
    // Vérifier d'abord si le magazine existe
    const { data: existingMagazine, error: checkError } = await retryOperation(async () =>
      supabase
        .from('magazines')
        .select('id')
        .eq('id', id)
        .maybeSingle()
    );

    if (checkError) {
      console.error('Error checking magazine:', checkError);
      throw new Error('Impossible de vérifier l\'existence du magazine');
    }

    if (!existingMagazine) {
      throw new Error('Magazine introuvable');
    }

    // Effectuer la mise à jour
    const { data, error } = await retryOperation(async () =>
      supabase
        .from('magazines')
        .update({
          ...magazine,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
    );

    if (error) {
      console.error('Error updating magazine:', error);
      if (error.code === '23505') {
        throw new Error('Un magazine avec ce titre et ce numéro existe déjà');
      }
      throw new Error('Impossible de mettre à jour le magazine');
    }

    return data;
  } catch (err) {
    console.error('Error in updateMagazine:', err);
    throw err;
  }
};

export const deleteMagazine = async (id: string) => {
  try {
    const { error } = await retryOperation(async () =>
      supabase
        .from('magazines')
        .delete()
        .eq('id', id)
    );

    if (error) {
      console.error('Error deleting magazine:', error);
      throw new Error('Impossible de supprimer le magazine');
    }
  } catch (err) {
    console.error('Error in deleteMagazine:', err);
    throw err;
  }
};
