import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, Loader } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../lib/auth';

export function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, subtotal, shippingFee, total, loading, error, loadCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadCart(user.id);
  }, [user, loadCart, navigate]);

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    await updateQuantity(itemId, newQuantity);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Votre panier est vide</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez à ajouter des magazines à votre panier !</p>
          <div className="mt-6">
            <Link
              to="/magazines"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Parcourir les Magazines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Panier</h1>

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

      <div className="mt-8">
        <div className="flow-root">
          <ul className="-my-6 divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="py-6 flex">
                {item.magazine?.cover_image_url && (
                  <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={item.magazine.cover_image_url}
                      alt={item.magazine.title}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>
                )}
                <div className="ml-4 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>
                        <Link to={`/magazines/${item.magazine_id}`}>
                          {item.magazine?.title}
                        </Link>
                      </h3>
                      <p className="ml-4">
                        {((item.magazine?.price || 0) * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-6 mt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-base text-gray-500">
            <p>Sous-total</p>
            <p>{subtotal.toFixed(2)} €</p>
          </div>
          <div className="flex justify-between text-base text-gray-500">
            <p>Frais de port</p>
            <p>{shippingFee.toFixed(2)} €</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Total</p>
            <p>{total.toFixed(2)} €</p>
          </div>
        </div>
        <div className="mt-6">
          <Link
            to="/checkout"
            className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Commander
          </Link>
        </div>
        <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
          <p>
            ou{' '}
            <Link
              to="/magazines"
              className="text-blue-600 font-medium hover:text-blue-500"
            >
              Continuer les achats<span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
