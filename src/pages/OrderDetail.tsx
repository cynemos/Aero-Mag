import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, AlertCircle, Loader, FileDown } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getOrderById } from '../lib/orders';
import type { Order, OrderItem } from '../types/database';
import type { UserProfile } from '../lib/profile';
import { generateOrderPDF } from '../lib/pdf';

const ORDER_STATUS_MAP = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order & { profiles?: UserProfile, order_items: OrderItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment') as 'success' | 'cancelled' | null;
  const [processingPayment, setProcessingPayment] = useState(false);

  const isAdmin = user?.email === 'cynemos@gmail.com';

  useEffect(() => {
    const processPaymentResult = async () => {
      if (!paymentStatus || !id) return;
      
      setProcessingPayment(true);
      try {
        await handlePaymentResult(id, paymentStatus);
        
        // Recharger la commande pour avoir le statut à jour
        const updatedOrder = await getOrderById(id, user!.id, isAdmin);
        setOrder(updatedOrder);
        
        // Nettoyer l'URL
        navigate(`/orders/${id}`, { replace: true });
      } catch (err) {
        setError('Échec de la mise à jour du statut de paiement');
      } finally {
        setProcessingPayment(false);
      }
    };

    processPaymentResult();
  }, [paymentStatus, id, user, isAdmin, navigate]);

  useEffect(() => {
    if (!user || !id) {
      navigate('/orders');
      return;
    }

    const loadOrder = async () => {
      try {
        const data = await getOrderById(id, user.id, isAdmin);
        setOrder(data);
      } catch (err) {
        console.error('Error loading order:', err);
        setError(err instanceof Error ? err.message : 'Échec du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, user, navigate, isAdmin]);

  const handleBack = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/orders');
    }
  };

  const handleDownloadPDF = async (type: 'order' | 'invoice') => {
    if (!order) return;
    
    setGeneratingPDF(true);
    try {
      await generateOrderPDF(order, type);
    } catch (err) {
      setError('Erreur lors de la génération du PDF');
      console.error('Error generating PDF:', err);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (processingPayment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-lg text-gray-700">
          Traitement du paiement en cours...
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Commande introuvable</h3>
          <p className="mt-1 text-sm text-gray-500">Cette commande n'existe pas ou vous n'y avez pas accès.</p>
          <div className="mt-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isAdmin ? 'Retour au tableau de bord' : 'Retour aux commandes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP] || 
    { label: order.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 text-gray-400 hover:text-gray-500"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Commande #{order.id.slice(0, 8)}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Passée le {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <button
            onClick={() => handleDownloadPDF('order')}
            disabled={generatingPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {generatingPDF ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Télécharger le bon de commande
          </button>
          {order.status === 'shipped' && (
            <button
              onClick={() => handleDownloadPDF('invoice')}
              disabled={generatingPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {generatingPDF ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Télécharger la facture
            </button>
          )}
        </div>
      </div>

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

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Client</h3>
              <div className="mt-3 text-sm text-gray-500">
                <p className="font-medium text-gray-900">
                  {order.profiles?.email}
                </p>
                {(order.profiles?.first_name || order.profiles?.last_name) && (
                  <p className="mt-1">
                    {order.profiles?.first_name} {order.profiles?.last_name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Adresse de livraison</h3>
              <div className="mt-3 text-sm text-gray-500">
                <p>{order.shipping_address.street}</p>
                <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900">Suivi de commande</h3>
              <div className="mt-3">
                <div className="space-y-4">
                  {Object.entries(ORDER_STATUS_MAP).map(([status, info], index) => {
                    const isCurrentStatus = status === order.status;
                    const isPastStatus = Object.keys(ORDER_STATUS_MAP).indexOf(status) <= 
                      Object.keys(ORDER_STATUS_MAP).indexOf(order.status);

                    return (
                      <div key={status} className="flex items-center">
                        <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                          isCurrentStatus ? info.color :
                          isPastStatus ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                        <div className="ml-4 text-sm font-medium text-gray-900">
                          {info.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Articles commandés</h3>
            <ul className="divide-y divide-gray-200">
              {order.order_items.map((item) => (
                <li key={item.id} className="py-4 flex">
                  {item.magazine?.cover_image_url && (
                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item.magazine.cover_image_url}
                        alt={item.magazine.title}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                  )}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.magazine?.title}
                      </h4>
                      <p className="ml-4 text-sm text-gray-500">
                        {item.price_at_time.toFixed(2)} € × {item.quantity}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      N° {item.magazine?.issue_number}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Sous-total</p>
                <p>{(order.total_amount - 2).toFixed(2)} €</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-500 mt-2">
                <p>Frais de port</p>
                <p>2.00 €</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
                <p>Total</p>
                <p>{order.total_amount.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
