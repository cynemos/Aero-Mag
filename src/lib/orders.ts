import { supabase } from './supabase';
import type { Order, OrderItem } from '../types/database';
import type { UserProfile } from './profile';

// Fonction pour calculer les frais de port
const calculateShippingFee = (items: { quantity: number }[]): number => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity === 0) return 0;
  if (totalQuantity === 1) return 2;
  return 2 + (totalQuantity - 1) * 0.5;
};

export const getOrders = async (userId: string, isAdmin: boolean = false) => {
  try {
    let query = supabase
      .from('order_details')
      .select(`
        *,
        order_items (
          *,
          magazine:magazines (
            id,
            title,
            issue_number,
            cover_image_url,
            stock_status
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Si ce n'est pas l'admin, filtrer uniquement les commandes de l'utilisateur
    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data as (Order & { profiles: UserProfile, order_items: OrderItem[] })[];
  } catch (err) {
    console.error('Error in getOrders:', err);
    throw err;
  }
};

export const getOrderById = async (orderId: string, userId: string, isAdmin: boolean = false) => {
  try {
    // Utiliser la fonction get_order_details pour récupérer les détails de la commande
    const { data: orderDetails, error: orderError } = await supabase
      .rpc('get_order_details', { p_order_id: orderId })
      .single();

    if (orderError) {
      console.error('Error in getOrderById:', orderError);
      throw orderError;
    }

    if (!orderDetails) {
      throw new Error('Commande introuvable');
    }

    // Vérifier que l'utilisateur a le droit d'accéder à cette commande
    if (!isAdmin && orderDetails.user_id !== userId) {
      throw new Error('Accès non autorisé à cette commande');
    }

    // Récupérer les articles de la commande
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        magazine:magazines (
          id,
          title,
          issue_number,
          cover_image_url
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      throw itemsError;
    }

    // Restructurer les données pour correspondre au format attendu
    const order = {
      ...orderDetails,
      profiles: {
        first_name: orderDetails.first_name,
        last_name: orderDetails.last_name,
        email: orderDetails.email
      },
      order_items: orderItems || []
    };

    return order as Order & { profiles: UserProfile, order_items: OrderItem[] };
  } catch (err) {
    console.error('Error in getOrderById:', err);
    throw err;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    // Commencer par récupérer l'ancien statut de la commande
    const { data: oldOrder, error: getError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (getError) throw getError;

    // Si on annule une commande qui n'était pas déjà annulée
    if (status === 'cancelled' && oldOrder?.status !== 'cancelled') {
      // Récupérer les articles de la commande
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('magazine_id')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Mettre à jour le statut de la commande
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Pour chaque magazine de la commande, vérifier s'il doit redevenir disponible
      for (const item of orderItems || []) {
        // Vérifier si le magazine est dans d'autres commandes non annulées
        const { data: otherOrders, error: checkError } = await supabase
          .from('order_items')
          .select('order_id')
          .eq('magazine_id', item.magazine_id)
          .neq('order_id', orderId);

        if (checkError) throw checkError;

        // Si c'était la seule commande pour ce magazine, le rendre à nouveau disponible
        if (!otherOrders || otherOrders.length === 0) {
          const { error: stockError } = await supabase
            .from('magazines')
            .update({ stock_status: 'available' })
            .eq('id', item.magazine_id);

          if (stockError) throw stockError;
        }
      }
    } else {
      // Si ce n'est pas une annulation, mettre simplement à jour le statut
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    }
  } catch (err) {
    console.error('Error in updateOrderStatus:', err);
    throw err;
  }
};

export const createOrder = async (
  userId: string,
  items: { magazineId: string; quantity: number; price: number }[],
  shippingAddress: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  }
) => {
  const shippingFee = calculateShippingFee(items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  try {
    // Vérifier que tous les magazines sont disponibles
    for (const item of items) {
      const { data: magazine, error: checkError } = await supabase
        .from('magazines')
        .select('stock_status')
        .eq('id', item.magazineId)
        .single();

      if (checkError) {
        console.error('Error checking magazine availability:', checkError);
        throw new Error('Erreur lors de la vérification de la disponibilité des magazines');
      }

      if (!magazine) {
        throw new Error('Magazine introuvable');
      }

      if (magazine.stock_status === 'out_of_stock') {
        throw new Error(`Le magazine ${item.magazineId} n'est plus disponible`);
      }
    }

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        total_amount: total,
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Erreur lors de la création de la commande');
    }

    if (!order) {
      throw new Error('Erreur lors de la création de la commande');
    }

    // Créer les éléments de la commande
    const orderItems = items.map(item => ({
      order_id: order.id,
      magazine_id: item.magazineId,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // En cas d'erreur, supprimer la commande
      await supabase.from('orders').delete().eq('id', order.id);
      console.error('Error creating order items:', itemsError);
      throw new Error('Erreur lors de la création des articles de la commande');
    }

    // Marquer les magazines comme épuisés
    for (const item of items) {
      const { error: stockError } = await supabase
        .from('magazines')
        .update({ stock_status: 'out_of_stock' })
        .eq('id', item.magazineId);

      if (stockError) {
        console.error('Error updating magazine stock:', stockError);
        // Ne pas bloquer la création de la commande si la mise à jour du stock échoue
      }
    }

    // Récupérer la commande complète avec les détails
    const completeOrder = await getOrderById(order.id, userId);

    // Envoyer la notification par email
    try {
      await supabase.functions.invoke('send-order-confirmation', {
        body: {
          order: completeOrder,
          adminEmail: 'cynemos@gmail.com'
        }
      });
    } catch (err) {
      console.error('Failed to send order confirmation:', err);
      // Ne pas bloquer la création de la commande si l'envoi de l'email échoue
    }

    return completeOrder;
  } catch (err) {
    console.error('Error in createOrder:', err);
    throw err instanceof Error ? err : new Error('Erreur lors de la création de la commande');
  }
};
