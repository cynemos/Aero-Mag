import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, LogIn, XCircle, Loader, FileText } from 'lucide-react';
import { getMagazineById } from '../lib/magazines';
import { useAuth } from '../lib/auth';
import { useCartStore } from '../stores/cartStore';
import type { Magazine } from '../types/database';

export function MagazinePublicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCartStore();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const isAdmin = user?.email === 'cynemos@gmail.com';

  useEffect(() => {
    if (!id) return;
    loadMagazine();
  }, [id]);

  const loadMagazine = async () => {
    try {
      const data = await getMagazineById(id!);
      setMagazine(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement du magazine');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isAdmin) {
      setError('En tant qu\'administrateur, vous ne pouvez pas ajouter d\'articles au panier');
      return;
    }

    if (!magazine) return;

    setAddingToCart(true);
    try {
      await addItem(user.id, magazine.id, 1);
      navigate('/cart');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l\'ajout au panier');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!magazine) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Magazine introuvable</h3>
          <p className="mt-1 text-sm text-gray-500">Le magazine que vous recherchez n'existe pas.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/collection')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Retour à la collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/collection')}
        className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour à la collection
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Image */}
        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
          {magazine.cover_image_url ? (
            <img
              src={magazine.cover_image_url}
              alt={magazine.title}
              className="w-full h-full object-center object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">Aucune image</span>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {magazine.title}
          </h1>
          <div className="mt-3">
            <h2 className="sr-only">Informations du magazine</h2>
            <p className="text-lg text-gray-900">
              N° {magazine.issue_number}
            </p>
          </div>

          {magazine.publication_date && (
            <div className="mt-3">
              <p className="text-gray-500">
                Date de publication: {new Date(magazine.publication_date).toLocaleDateString()}
              </p>
            </div>
          )}

          {magazine.has_plan && (
            <div className="mt-4 flex items-center">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="ml-2 text-sm font-medium text-blue-700">
                Plan inclus : {magazine.plan_model_name}
              </span>
            </div>
          )}

          {magazine.description && (
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                {magazine.description}
              </div>
            </div>
          )}

          {magazine.keywords && magazine.keywords.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Mots-clés</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {magazine.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col space-y-4">
            <p className="text-2xl text-gray-900">
              {magazine.price ? `${magazine.price.toFixed(2)} €` : 'Prix non disponible'}
            </p>

            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || magazine.stock_status === 'out_of_stock'}
                className={`max-w-xs flex-1 flex items-center justify-center px-8 py-3 border border-transparent rounded-md text-base font-medium text-white ${
                  magazine.stock_status === 'out_of_stock'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {addingToCart ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : magazine.stock_status === 'out_of_stock' ? (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Épuisé
                  </>
                ) : (
                  <>
                    {user ? (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Ajouter au panier
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Se connecter pour acheter
                      </>
                    )}
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
