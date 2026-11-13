import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader, Search } from 'lucide-react';
import { getMagazines, type Magazine } from '../lib/magazines';
import { aUnPlanPossible, trierThemes } from '../lib/categories';
import { Revue } from '../components/Revue';

// Recherche sans tenir compte des accents ni des majuscules
const normaliser = (texte: string) => texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const correspond = (magazine: Magazine, termes: string[]) => {
  const champs = [
    magazine.title,
    magazine.issue_number,
    magazine.category,
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
  // Recherche, thème et filtre sont dans l'adresse (?q=…&theme=…&plans=1) : on peut la partager,
  // et les mots-clés d'une fiche ou les tiroirs de l'accueil y renvoient.
  const [params, setParams] = useSearchParams();
  const recherche = params.get('q') ?? '';
  const theme = params.get('theme') ?? '';
  const plansSeulement = params.get('plans') === '1';

  const regler = (cle: string, valeur: string) => {
    const suivants = new URLSearchParams(params);
    if (valeur) suivants.set(cle, valeur);
    else suivants.delete(cle);
    setParams(suivants, { replace: true });
  };

  useEffect(() => {
    getMagazines()
      .then(setMagazines)
      .catch(err => setError(err instanceof Error ? err.message : 'Échec du chargement des revues'))
      .finally(() => setLoading(false));
  }, []);

  const themes = useMemo(() => trierThemes(magazines.map(m => m.category)), [magazines]);
  // Le filtre « plan encarté » n'a de sens que pour l'aéromodélisme
  const filtrePlanUtile = theme ? aUnPlanPossible(theme) : magazines.some(m => m.has_plan);

  const { sections, total } = useMemo(() => {
    const termes = normaliser(recherche).split(/\s+/).filter(Boolean);
    const filtres = magazines.filter(m =>
      (!theme || m.category === theme) &&
      (!plansSeulement || !filtrePlanUtile || m.has_plan) &&
      (termes.length === 0 || correspond(m, termes))
    );
    // Thème → revue → numéros
    const parTheme = new Map<string, Map<string, Magazine[]>>();
    for (const magazine of filtres) {
      const revues = parTheme.get(magazine.category) ?? new Map<string, Magazine[]>();
      revues.set(magazine.title, [...(revues.get(magazine.title) ?? []), magazine]);
      parTheme.set(magazine.category, revues);
    }
    const sections = trierThemes(parTheme.keys()).map(nom => ({ nom, revues: [...parTheme.get(nom)!.entries()] }));
    return { sections, total: filtres.length };
  }, [magazines, recherche, theme, plansSeulement, filtrePlanUtile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="h-8 w-8 animate-spin text-laiton" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="dorure text-4xl font-extrabold sm:text-5xl">Les rayonnages</h1>
          <p className="mt-2 italic text-parchemin/80">
            {total} {total > 1 ? 'numéros' : 'numéro'}
            {total !== magazines.length && ` sur ${magazines.length}`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {filtrePlanUtile && (
            <label className="inline-flex cursor-pointer items-center text-parchemin">
              <input
                type="checkbox"
                checked={plansSeulement}
                onChange={e => regler('plans', e.target.checked ? '1' : '')}
                className="mr-2 h-4 w-4 accent-[var(--laiton)]"
              />
              Avec plan encarté
            </label>
          )}
          <div className="relative sm:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-laiton" />
            <input
              type="search"
              placeholder="Titre, numéro, modèle, mot-clé…"
              value={recherche}
              onChange={e => regler('q', e.target.value)}
              aria-label="Rechercher dans la bibliothèque"
              className="champ-sombre pl-10"
            />
          </div>
        </div>
      </div>

      {themes.length > 1 && (
        <nav className="flex flex-wrap gap-x-1.5 gap-y-2 border-b border-parchemin/70" aria-label="Thèmes">
          <button onClick={() => regler('theme', '')} className={`intercalaire${theme ? '' : ' actif'}`} aria-pressed={!theme}>
            Tout
          </button>
          {themes.map(nom => (
            <button key={nom} onClick={() => regler('theme', nom)} className={`intercalaire${theme === nom ? ' actif' : ''}`} aria-pressed={theme === nom}>
              {nom}
            </button>
          ))}
        </nav>
      )}

      {error && (
        <div className="message-erreur mt-6">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!error && total === 0 && (
        <p className="py-16 text-center text-xl italic text-parchemin/80">
          {magazines.length === 0 ? 'Les rayonnages sont encore vides.' : 'Aucun numéro ne correspond à cette recherche.'}
        </p>
      )}

      <div className="mt-8 space-y-12">
        {sections.map(({ nom, revues }) => (
          <section key={nom}>
            {(!theme || sections.length > 1) && (
              <h2 className="mb-6 flex items-center gap-4 font-titre text-2xl font-bold text-laiton-clair">
                <span className="filet flex-1" aria-hidden="true" />
                {nom}
                <span className="filet flex-1" aria-hidden="true" />
              </h2>
            )}
            <div className="space-y-9">
              {revues.map(([titre, numeros]) => (
                <div key={titre}>
                  <h3 className="plaque mb-3 text-lg">
                    {titre}
                    <span className="ml-2 font-texte text-base font-normal italic">· {numeros.length}</span>
                  </h3>
                  <div className="rayonnage">
                    {numeros.map(magazine => <Revue key={magazine.id} magazine={magazine} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
