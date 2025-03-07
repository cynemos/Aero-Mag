import { create } from 'zustand';
import { getCartItems, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from '../lib/cart';
import type { CartItem } from '../types/database';

// Fonction pour calculer les frais de port
const calculateShippingFee = (items: CartItem[]): number => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity === 0) return 0;
  if (totalQuantity === 1) return 2;
  return 2 + (totalQuantity - 1) * 0.5;
};

interface CartStore {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  loadCart: (userId: string) => Promise<void>;
  addItem: (userId: string, magazineId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  subtotal: 0,
  shippingFee: 0,
  total: 0,

  loadCart: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const items = await getCartItems(userId);
      const subtotal = items.reduce((sum, item) => {
        return sum + (item.magazine?.price || 0) * item.quantity;
      }, 0);
      const shippingFee = calculateShippingFee(items);
      set({ 
        items, 
        subtotal,
        shippingFee,
        total: subtotal + shippingFee
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load cart' });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (userId: string, magazineId: string, quantity = 1) => {
    set({ error: null });
    try {
      await addToCart(userId, magazineId, quantity);
      await get().loadCart(userId);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add item to cart' });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ error: null });
    try {
      await updateCartItemQuantity(itemId, quantity);
      const items = get().items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const subtotal = items.reduce((sum, item) => {
        return sum + (item.magazine?.price || 0) * item.quantity;
      }, 0);
      const shippingFee = calculateShippingFee(items);
      set({ 
        items, 
        subtotal,
        shippingFee,
        total: subtotal + shippingFee
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update quantity' });
    }
  },

  removeItem: async (itemId: string) => {
    set({ error: null });
    try {
      await removeFromCart(itemId);
      const items = get().items.filter(item => item.id !== itemId);
      const subtotal = items.reduce((sum, item) => {
        return sum + (item.magazine?.price || 0) * item.quantity;
      }, 0);
      const shippingFee = calculateShippingFee(items);
      set({ 
        items, 
        subtotal,
        shippingFee,
        total: items.length > 0 ? subtotal + shippingFee : 0
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove item' });
    }
  },

  clear: async (userId: string) => {
    set({ error: null });
    try {
      await clearCart(userId);
      set({ items: [], subtotal: 0, shippingFee: 0, total: 0 });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to clear cart' });
    }
  },
}));
