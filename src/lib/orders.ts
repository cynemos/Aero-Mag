import { supabase } from './supabase';
import type { Order, OrderItem } from '../types/database';
import type { UserProfile } from './profile';

// Calculate shipping fee
const calculateShippingFee = (items: { quantity: number }[]): number => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity === 0) return 0;
  if (totalQuantity === 1) return 2;
  return 2 + (totalQuantity - 1) * 0.5;
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
    // Verify stock availability
    for (const item of items) {
      const { data: magazine, error: checkError } = await supabase
        .from('magazines')
        .select('stock_status')
        .eq('id', item.magazineId)
        .single();

      if (checkError) {
        throw new Error(`Failed to check magazine availability: ${checkError.message}`);
      }

      if (!magazine) {
        throw new Error(`Magazine ${item.magazineId} not found`);
      }

      if (magazine.stock_status === 'out_of_stock') {
        throw new Error(`Magazine ${item.magazineId} is no longer available`);
      }
    }

    // Create order
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

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message || 'Unknown error'}`);
    }

    // Create order items
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
      // If order items creation fails, delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Update magazine stock status
    for (const item of items) {
      const { error: stockError } = await supabase
        .from('magazines')
        .update({ stock_status: 'out_of_stock' })
        .eq('id', item.magazineId)
        .eq('stock_status', 'available'); // Only update if still available

      if (stockError) {
        console.error('Failed to update magazine stock:', stockError);
        // Don't throw here, as the order is already created
      }
    }

    // Get complete order details
    const completeOrder = await getOrderById(order.id, userId);

    // Send order confirmation email
    try {
      await supabase.functions.invoke('send-order-confirmation', {
        body: {
          order: completeOrder,
          profile: {
            first_name: 'c',
            last_name: 'n',
            email: 'c.nectoux@digitinnovation.com'
          },
          adminEmail: 'c.nectoux@digitinnovation.com'
        }
      });
    } catch (err) {
      console.warn('Failed to send order confirmation:', err);
      // Don't block order creation if email fails
    }

    return completeOrder;
  } catch (err) {
    console.error('Error in createOrder:', err);
    throw err instanceof Error ? err : new Error('Failed to create order');
  }
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

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as (Order & { profiles: UserProfile, order_items: OrderItem[] })[];
  } catch (err) {
    console.error('Error in getOrders:', err);
    throw err;
  }
};

export const getOrderById = async (orderId: string, userId: string, isAdmin: boolean = false) => {
  try {
    const { data: orderDetails, error: orderError } = await supabase
      .rpc('get_order_details', { p_order_id: orderId })
      .single();

    if (orderError) throw orderError;
    if (!orderDetails) throw new Error('Order not found');

    if (!isAdmin && orderDetails.user_id !== userId) {
      throw new Error('Access denied');
    }

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

    if (itemsError) throw itemsError;

    return {
      ...orderDetails,
      profiles: {
        first_name: orderDetails.first_name,
        last_name: orderDetails.last_name,
        email: orderDetails.email
      },
      order_items: orderItems || []
    } as Order & { profiles: UserProfile, order_items: OrderItem[] };
  } catch (err) {
    console.error('Error in getOrderById:', err);
    throw err;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data: oldOrder, error: getError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (getError) throw getError;

    if (status === 'cancelled' && oldOrder?.status !== 'cancelled') {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('magazine_id')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) throw updateError;

      for (const item of orderItems || []) {
        const { data: otherOrders, error: checkError } = await supabase
          .from('order_items')
          .select('order_id')
          .eq('magazine_id', item.magazine_id)
          .neq('order_id', orderId);

        if (checkError) throw checkError;

        if (!otherOrders || otherOrders.length === 0) {
          const { error: stockError } = await supabase
            .from('magazines')
            .update({ stock_status: 'available' })
            .eq('id', item.magazine_id);

          if (stockError) throw stockError;
        }
      }
    } else {
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
