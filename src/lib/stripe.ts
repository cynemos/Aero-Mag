import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialiser Stripe avec la clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const createPaymentSession = async (orderId: string, amount: number) => {
  try {
    // Créer une session de paiement via la fonction Edge
    const { data, error } = await supabase.functions.invoke('create-payment-session', {
      body: { orderId, amount }
    });

    if (error) throw error;
    if (!data?.sessionId) throw new Error('No session ID returned');

    // Initialiser Stripe
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Failed to initialize Stripe');

    // Rediriger vers Checkout
    const { error: redirectError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (redirectError) throw redirectError;

  } catch (err) {
    console.error('Payment session error:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to create payment session');
  }
};

export const handlePaymentResult = async (orderId: string, status: 'success' | 'cancelled') => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: status === 'success' ? 'processing' : 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;

    return status;
  } catch (err) {
    console.error('Payment result handling error:', err);
    throw new Error('Failed to update order status');
  }
};
