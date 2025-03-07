import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, BookOpen } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-12">
      <div className="relative h-[500px]">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.midilibre.fr/api/v1/images/view/648470632229704e441426b8/large/image.jpg?v=2"
            alt="Collection de maquettes d'avions"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Collection de Magazines AéroModélisme
          </h1>
          <p className="mt-6 text-xl text-white max-w-3xl">
            Découvrez notre vaste collection de magazines de modélisme d'avions et de planeur. Parcourez, recherchez et achetez parmi notre sélection soigneusement choisie.
          </p>
          <div className="mt-10">
            <Link
              to="/collection"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Parcourir la Collection
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-blue-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Recherche Avancée</h3>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Trouvez des magazines spécifiques grâce à nos fonctionnalités de recherche puissantes. Filtrez par date, titre ou mots-clés.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Collection Numérique</h3>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Parcourez des numérisations haute qualité des couvertures de magazines et des informations détaillées sur chaque numéro.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Achat Facile</h3>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Achats en ligne sécurisés avec plusieurs options de paiement et livraison mondiale disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
