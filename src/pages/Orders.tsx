import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, AlertCircle, Loader, ChevronRight, Search } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../lib/orders';
import { useAuth } from '../lib/auth';
import type { Order, OrderItem } from '../types/database';
import type { UserProfile } from '../lib/profile';

const ORDER_STATUS_MAP = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<(Order & { profiles: UserProfile, order_items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isAdmin = user?.email === 'cynemos@gmail.com';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      const data = await getOrders(user!.id, isAdmin);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la mise à jour du statut');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.profiles?.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.profiles?.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.profiles?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (orders.length === 0 && !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
          <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore passé de commande.</p>
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
      <h1 className="text-2xl font-semibold text-gray-900">
        {isAdmin ? 'Gestion des Commandes' : 'Vos Commandes'}
      </h1>

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

      <div className="mt-4 sm:flex sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={isAdmin ? "Rechercher par ID ou nom client..." : "Rechercher une commande..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(ORDER_STATUS_MAP).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {filteredOrders.map((order) => {
          const statusInfo = ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP] || 
            { label: order.status, color: 'bg-gray-100 text-gray-800' };

          return (
            <div
              key={order.id}
              className="bg-white shadow overflow-hidden sm:rounded-md cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Commande #{order.id.slice(0, 8)}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>Passée le {new Date(order.created_at).toLocaleDateString()}</p>
                      {isAdmin && order.profiles && (
                        <div className="mt-1">
                          <p className="font-medium text-gray-700">
                            {order.profiles.first_name} {order.profiles.last_name}
                          </p>
                          <p className="text-gray-500">{order.profiles.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isAdmin ? (
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(order.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`${statusInfo.color} px-2 py-1 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {Object.entries(ORDER_STATUS_MAP).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <ul className="divide-y divide-gray-200">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="py-4 flex">
                        {item.magazine?.cover_image_url && (
                          <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
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
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.total_amount.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
