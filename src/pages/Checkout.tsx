import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../lib/auth';
import { createOrder } from '../lib/orders';
import { getUserProfile } from '../lib/profile';
import { supabase } from '../lib/supabase';

interface UnavailableItem {
  title: string;
  issue_number: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, shippingFee, total, clear } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [unavailableItems, setUnavailableItems] = useState<UnavailableItem[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    const loadProfile = async () => {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.id);
        if (profile.address) {
          setShippingAddress(profile.address);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    loadProfile();
  }, [items.length, navigate, user]);

  const checkStockAvailability = async () => {
    const unavailable: UnavailableItem[] = [];

    for (const item of items) {
      const { data: magazine, error } = await supabase
        .from('magazines')
        .select('stock_status, title, issue_number')
        .eq('id', item.magazine_id)
        .single();

      if (error) {
        throw new Error('Error checking stock availability');
      }

      if (magazine.stock_status === 'out_of_stock') {
        unavailable.push({
          title: magazine.title,
          issue_number: magazine.issue_number
        });
      }
    }

    return unavailable;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnavailableItems([]);

    try {
      const unavailable = await checkStockAvailability();
      if (unavailable.length > 0) {
        setUnavailableItems(unavailable);
        const unavailableText = unavailable
          .map(item => `${item.title} n°${item.issue_number}`)
          .join(', ');
        setError(`The following magazines are no longer available: ${unavailableText}`);
        return;
      }

      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleConfirmOrder = async () => {
    if (!user) return;

    setProcessingPayment(true);
    setError(null);

    try {
      // Check availability again
      const unavailable = await checkStockAvailability();
      if (unavailable.length > 0) {
        setUnavailableItems(unavailable);
        const unavailableText = unavailable
          .map(item => `${item.title} n°${item.issue_number}`)
          .join(', ');
        throw new Error(`The following magazines are no longer available: ${unavailableText}`);
      }

      const orderItems = items.map(item => ({
        magazineId: item.magazine_id,
        quantity: item.quantity,
        price: item.magazine?.price || 0,
      }));

      // Create order
      const order = await createOrder(user.id, orderItems, shippingAddress);

      await clear(user.id);
      navigate(`/orders/${order.id}`);
      
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
      setShowConfirmation(false);
    } finally {
      setProcessingPayment(false);
      setRetryCount(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payment</h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      required
                      value={shippingAddress.street}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      required
                      value={shippingAddress.postal_code}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={shippingAddress.country}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Verify Order
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-10 lg:mt-0">
          <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

          <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="flex py-6 px-4 sm:px-6">
                  {item.magazine?.cover_image_url && (
                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item.magazine.cover_image_url}
                        alt={item.magazine.title}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                  )}
                  <div className="ml-6 flex-1 flex flex-col">
                    <div className="flex">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.magazine?.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex-1 pt-2 flex items-end justify-between">
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {((item.magazine?.price || 0) * item.quantity).toFixed(2)} €
                      </p>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
              <div className="space-y-2">
                <div className="flex justify-between text-base text-gray-500">
                  <p>Subtotal</p>
                  <p>{subtotal.toFixed(2)} €</p>
                </div>
                <div className="flex justify-between text-base text-gray-500">
                  <p>Shipping</p>
                  <p>{shippingFee.toFixed(2)} €</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>{total.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Order Confirmation
                  </h3>

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900">Shipping Address</h4>
                    <p className="mt-2 text-sm text-gray-600">
                      {shippingAddress.street}<br />
                      {shippingAddress.postal_code} {shippingAddress.city}<br />
                      {shippingAddress.country}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900">Ordered Items</h4>
                    <ul className="mt-2 divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.id} className="py-3 flex justify-between">
                          <div className="flex items-center">
                            {item.magazine?.cover_image_url && (
                              <img
                                src={item.magazine.cover_image_url}
                                alt={item.magazine.title}
                                className="h-16 w-12 object-cover rounded"
                              />
                            )}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {item.magazine?.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {((item.magazine?.price || 0) * item.quantity).toFixed(2)} €
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <p>Subtotal</p>
                        <p>{subtotal.toFixed(2)} €</p>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <p>Shipping</p>
                        <p>{shippingFee.toFixed(2)} €</p>
                      </div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Total</p>
                        <p>{total.toFixed(2)} €</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={processingPayment}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processingPayment ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    'Confirm Order'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Modify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
