import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, FileText, Loader, Search } from 'lucide-react';
import { getMagazines, formatDate, type Magazine } from '../lib/magazines';

// Recherche sans tenir compte des accents ni des majuscules
const normaliser = (texte: string) => texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const correspond = (magazine: Magazine, termes: string[]) => {
  const champs = [
    magazine.title,
    magazine.issue_number,
    magazine.description ?? '',
    magazine.plan_model_name ?? '',
    ...(magazine.keywords ?? []),
  ].map(normaliser);
  return termes.every(terme => champs.some(champ => champ.includes(terme)));
};

export function Collection() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // La recherche est dans l'adresse (?q=…) : on peut la partager, et les mots-clés d'une fiche y renvoient
  const [params, setParams] = useSearchParams();
  const recherche = params.get('q') ?? '';
  const setRecherche = (valeur: string) => setParams(valeur ? { q: valeur } : {}, { replace: true });
  const [plansSeulement, setPlansSeulement] = useState(false);

  useEffect(() => {
    getMagazines()
      .then(setMagazines)
      .catch(err => setError(err instanceof Error ? err.message : 'Échec du chargement des revues'))
      .finally(() => setLoading(false));
  }, []);

  const { groupes, total } = useMemo(() => {
    const termes = normaliser(recherche).split(/\s+/).filter(Boolean);
    const filtres = magazines.filter(
      m => (!plansSeulement || m.has_plan) && (termes.length === 0 || correspond(m, termes))
    );
    const groupes = new Map<string, Magazine[]>();
    for (const magazine of filtres) {
      groupes.set(magazine.title, [...(groupes.get(magazine.title) ?? []), magazine]);
    }
    return { groupes: [...groupes.entries()], total: filtres.length };
  }, [magazines, recherche, plansSeulement]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">La collection</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} {total > 1 ? 'numéros' : 'numéro'}
            {total !== magazines.length && ` sur ${magazines.length}`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex items-center text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={plansSeulement}
              onChange={e => setPlansSeulement(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
            />
            Avec plan encarté
          </label>
          <div className="relative sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Titre, numéro, modèle, mot-clé…"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              aria-label="Rechercher dans la collection"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6 flex">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {!error && total === 0 && (
        <p className="text-center text-gray-500 py-16">
          {magazines.length === 0 ? 'La bibliothèque est vide pour le moment.' : 'Aucun numéro ne correspond à cette recherche.'}
        </p>
      )}

      <div className="space-y-10">
        {groupes.map(([titre, numeros]) => (
          <section key={titre} className="space-y-4">
            <h2 className="text-xl font-medium text-gray-900 border-b border-gray-200 pb-2">
              {titre} <span className="text-sm font-normal text-gray-500">· {numeros.length}</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {numeros.map(magazine => (
                <Link key={magazine.id} to={`/collection/${magazine.id}`} className="group">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 relative shadow-sm">
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
                    {magazine.has_plan && (
                      <span className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                        <FileText className="h-3 w-3 mr-1" />
                        Plan
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">N° {magazine.issue_number}</p>
                  {magazine.publication_date && (
                    <p className="text-xs text-gray-500">{formatDate(magazine.publication_date)}</p>
                  )}
                  {magazine.has_plan && magazine.plan_model_name && (
                    <p className="text-xs text-blue-700 truncate">{magazine.plan_model_name}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
