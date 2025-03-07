import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, AlertCircle, Loader, Search, LogIn, XCircle, Info, FileText } from 'lucide-react';
import { getMagazines } from '../lib/magazines';
import { useAuth } from '../lib/auth';
import { useCartStore } from '../stores/cartStore';
import type { Magazine } from '../types/database';

export function MagazineGrid() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const isAdmin = user?.email === 'cynemos@gmail.com';

  useEffect(() => {
    loadMagazines();
  }, []);

  const loadMagazines = async () => {
    try {
      const data = await getMagazines();
      setMagazines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement des magazines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (magazineId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isAdmin) {
      setError('En tant qu\'administrateur, vous ne pouvez pas ajouter d\'articles au panier');
      return;
    }

    setAddingToCart(magazineId);
    try {
      await addItem(user.id, magazineId, 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l\'ajout au panier');
    } finally {
      setAddingToCart(null);
    }
  };

  const matchesMagazine = (magazine: Magazine, searchTerms: string[]) => {
    const searchableFields = [
      magazine.title.toLowerCase(),
      magazine.issue_number.toLowerCase(),
      magazine.description?.toLowerCase() || '',
      ...(magazine.keywords || []).map(keyword => keyword.toLowerCase())
    ];

    return searchTerms.every(term =>
      searchableFields.some(field => field.includes(term))
    );
  };

  const groupedMagazines = useMemo(() => {
    const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);

    const filtered = magazines.filter(magazine => 
      searchTerms.length === 0 || matchesMagazine(magazine, searchTerms)
    );

    return filtered.reduce((groups, magazine) => {
      const title = magazine.title;
      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(magazine);
      return groups;
    }, {} as Record<string, Magazine[]>);
  }, [magazines, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!user && (
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-shrink-0">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Connectez-vous pour acheter des magazines
                  </h3>
                  <p className="mt-1 text-sm text-blue-100">
                    Créez un compte ou connectez-vous pour accéder à notre collection complète et effectuer des achats.
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6">
                <Link
                  to="/auth"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Notre Collection</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par titre, numéro, description ou mots-clés..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
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

      <div className="space-y-10">
        {Object.entries(groupedMagazines).map(([title, magazines]) => (
          <div key={title} className="space-y-4">
            <h2 className="text-xl font-medium text-gray-900 border-b border-gray-200 pb-2">
              {title}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {magazines.map((magazine) => (
                <div key={magazine.id} className="group relative">
                  <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 relative">
                    {magazine.cover_image_url ? (
                      <img
                        src={magazine.cover_image_url}
                        alt={magazine.title}
                        className={`w-full h-full object-cover object-center transform transition-transform group-hover:scale-105 ${
                          magazine.stock_status === 'out_of_stock' ? 'opacity-50' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Aucune image</span>
                      </div>
                    )}
                    {magazine.stock_status === 'out_of_stock' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <span className="px-2 py-1 bg-red-500 text-white text-sm font-medium rounded">
                          Épuisé
                        </span>
                      </div>
                    )}
                    {magazine.has_plan && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                          <FileText className="h-3 w-3 mr-1" />
                          Plan
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      N° {magazine.issue_number}
                    </p>
                    {magazine.publication_date && (
                      <p className="text-xs text-gray-500">
                        {new Date(magazine.publication_date).toLocaleDateString()}
                      </p>
                    )}
                    {magazine.keywords && magazine.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {magazine.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900">
                      {magazine.price ? `${magazine.price.toFixed(2)} €` : '-'}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/collection/${magazine.id}`}
                        className="w-full flex items-center justify-center px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Détails
                      </Link>
                      {!isAdmin && user && (
                        <button
                          onClick={() => handleAddToCart(magazine.id)}
                          disabled={addingToCart === magazine.id || magazine.stock_status === 'out_of_stock'}
                          className={`w-full flex items-center justify-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white ${
                            magazine.stock_status === 'out_of_stock'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                          {addingToCart === magazine.id ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : magazine.stock_status === 'out_of_stock' ? (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Épuisé
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Ajouter
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
