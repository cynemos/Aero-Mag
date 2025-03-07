import { supabase } from './supabase';
import type { Database } from '../types/supabase';
import type { CartItem } from '../types/database';

export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      magazine:magazines (
        id,
        title,
        price,
        cover_image_url,
        stock_status
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data as CartItem[];
};

export const addToCart = async (userId: string, magazineId: string, quantity: number = 1) => {
  // Vérifier d'abord si le magazine est disponible
  const { data: magazine, error: magazineError } = await supabase
    .from('magazines')
    .select('stock_status')
    .eq('id', magazineId)
    .single();

  if (magazineError) throw magazineError;

  if (magazine.stock_status === 'out_of_stock') {
    throw new Error('Ce magazine est épuisé');
  }

  // Vérifier si l'article existe déjà dans le panier
  const { data: existingItems, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('magazine_id', magazineId);

  if (fetchError) throw fetchError;

  if (existingItems && existingItems.length > 0) {
    throw new Error('Ce magazine est déjà dans votre panier');
  }

  // Si l'article n'existe pas, l'ajouter
  const { error } = await supabase
    .from('cart_items')
    .insert({
      user_id: userId,
      magazine_id: magazineId,
      quantity,
    });

  if (error) throw error;
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);

  if (error) throw error;
};

export const removeFromCart = async (itemId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};

export const clearCart = async (userId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
