import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Library, Search } from 'lucide-react';
import { getMagazines, type Magazine } from '../lib/magazines';

export function Home() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMagazines()
      .then(setMagazines)
      .catch(() => setMagazines([]))
      .finally(() => setLoaded(true));
  }, []);

  const stats = useMemo(() => ({
    numeros: magazines.length,
    titres: new Set(magazines.map(m => m.title)).size,
    plans: magazines.filter(m => m.has_plan).length,
  }), [magazines]);

  const recents = useMemo(
    () => [...magazines].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6),
    [magazines]
  );

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white px-6 py-14 sm:px-12 sm:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Ma bibliothèque de revues d'aéromodélisme
        </h1>
        <p className="mt-5 text-lg text-blue-100 max-w-2xl">
          Tous les numéros de la collection, avec leur couverture, leurs mots-clés et les plans encartés.
          Pour retrouver en quelques secondes dans quel numéro se trouve un modèle.
        </p>
        <Link
          to="/collection"
          className="mt-8 inline-flex items-center px-6 py-3 rounded-md text-base font-medium text-blue-800 bg-white hover:bg-blue-50"
        >
          <Search className="h-5 w-5 mr-2" />
          Parcourir la collection
        </Link>
      </section>

      {loaded && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icone: BookOpen, valeur: stats.numeros, libelle: stats.numeros > 1 ? 'numéros' : 'numéro' },
            { icone: Library, valeur: stats.titres, libelle: stats.titres > 1 ? 'revues différentes' : 'revue' },
            { icone: FileText, valeur: stats.plans, libelle: stats.plans > 1 ? 'plans encartés' : 'plan encarté' },
          ].map(({ icone: Icone, valeur, libelle }) => (
            <div key={libelle} className="bg-white shadow rounded-lg p-6 flex items-center">
              <Icone className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-900">{valeur}</p>
                <p className="text-sm text-gray-500">{libelle}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {recents.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Derniers ajouts</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {recents.map(magazine => (
              <Link key={magazine.id} to={`/collection/${magazine.id}`} className="group">
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                  {magazine.cover_image_url ? (
                    <img
                      src={magazine.cover_image_url}
                      alt={`${magazine.title} n° ${magazine.issue_number}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sans couverture</div>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900 truncate">{magazine.title}</p>
                <p className="text-xs text-gray-500">N° {magazine.issue_number}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
