import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Book, AlertCircle, Loader, Pencil, Trash2, Search, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getOrders, updateOrderStatus } from '../lib/orders';
import { getMagazines, updateMagazine, deleteMagazine } from '../lib/magazines';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem, Magazine } from '../types/database';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'magazines'>('orders');
  const [editingMagazine, setEditingMagazine] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Magazine>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingMagazine, setDeletingMagazine] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const isAdmin = user?.email === 'cynemos@gmail.com';

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    // Charger le nombre de messages non lus
    const loadUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('count', { count: 'exact' })
          .eq('read', false)
          .eq('is_admin_message', false);

        if (error) throw error;
        setUnreadMessages(data?.length || 0);
      } catch (err) {
        console.error('Error loading unread messages count:', err);
      }
    };

    loadUnreadCount();

    // Souscrire aux nouveaux messages
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        loadUnreadCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, magazinesData] = await Promise.all([
        getOrders(user!.id, true),
        getMagazines(),
      ]);
      setOrders(ordersData);
      setMagazines(magazinesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
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
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const handleDeleteMagazine = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce magazine ?')) return;

    setDeletingMagazine(id);
    try {
      await deleteMagazine(id);
      setMagazines(magazines.filter(mag => mag.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete magazine');
    } finally {
      setDeletingMagazine(null);
    }
  };

  const startEditing = (magazine: Magazine) => {
    setEditingMagazine(magazine.id);
    setEditForm(magazine);
  };

  const cancelEditing = () => {
    setEditingMagazine(null);
    setEditForm({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const updatedMagazine = await updateMagazine(id, editForm);
      setMagazines(magazines.map(mag => 
        mag.id === id ? updatedMagazine : mag
      ));
      setEditingMagazine(null);
      setEditForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update magazine');
    }
  };

  const filteredOrders = orders.filter(order => 
    searchTerm === '' || 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.profiles?.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.profiles?.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredMagazines = magazines.filter(magazine =>
    searchTerm === '' ||
    magazine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    magazine.issue_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les commandes et les magazines depuis un seul endroit.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >            
            <Users className="h-4 w-4 mr-2" />
            Liste des Utilisateurs
          </button>
          <button
            onClick={() => navigate('/magazines/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Book className="h-4 w-4 mr-2" />
            Ajouter un Magazine
          </button>
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

      <div className="mt-4">
        <div className="relative max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={activeTab === 'orders' ? "Rechercher une commande..." : "Rechercher un magazine..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="sm:hidden">
          <select
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'orders' | 'magazines')}
          >
            <option value="orders">Commandes</option>
            <option value="magazines">Magazines</option>
          </select>
        </div>

        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              <Package className="h-5 w-5 inline-block mr-2" />
              Commandes
            </button>
            <button
              onClick={() => setActiveTab('magazines')}
              className={`${
                activeTab === 'magazines'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              <Book className="h-5 w-5 inline-block mr-2" />
              Magazines
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'orders' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Commande ID
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Client
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.profiles?.first_name} {order.profiles?.last_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="pending">En attente</option>
                          <option value="processing">En cours</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.total_amount.toFixed(2)} €
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir les détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Couverture
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Titre
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Numéro
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date de publication
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Prix
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredMagazines.map((magazine) => (
                    <tr key={magazine.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        {magazine.cover_image_url ? (
                          <img
                            src={magazine.cover_image_url}
                            alt={`Couverture de ${magazine.title}`}
                            className="h-16 w-12 object-cover rounded shadow"
                          />
                        ) : (
                          <div className="h-16 w-12 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-gray-400 text-xs">Aucune image</span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {magazine.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {magazine.issue_number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {magazine.publication_date ? new Date(magazine.publication_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {magazine.price ? `${magazine.price.toFixed(2)} €` : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/magazines/${magazine.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMagazine(magazine.id)}
                            disabled={deletingMagazine === magazine.id}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            {deletingMagazine === magazine.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Supprimer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
