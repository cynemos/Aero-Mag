import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { deleteMagazine, getMagazines, formatDate, type Magazine } from '../lib/magazines';

export function Admin() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [suppression, setSuppression] = useState<string | null>(null);

  useEffect(() => {
    getMagazines()
      .then(setMagazines)
      .catch(err => setError(err instanceof Error ? err.message : 'Échec du chargement des revues'))
      .finally(() => setLoading(false));
  }, []);

  const filtres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return magazines;
    return magazines.filter(m =>
      [m.title, m.issue_number, m.category, m.plan_model_name ?? '', ...(m.keywords ?? [])].some(champ =>
        champ.toLowerCase().includes(terme)
      )
    );
  }, [magazines, recherche]);

  const handleDelete = async (magazine: Magazine) => {
    if (!window.confirm(`Retirer « ${magazine.title} n° ${magazine.issue_number} » de la bibliothèque ?`)) return;
    setSuppression(magazine.id);
    setError(null);
    try {
      await deleteMagazine(magazine.id);
      setMagazines(liste => liste.filter(m => m.id !== magazine.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la suppression');
    } finally {
      setSuppression(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="h-8 w-8 animate-spin text-laiton" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="dorure text-4xl font-extrabold sm:text-5xl">Le registre</h1>
          <p className="mt-2 italic text-parchemin/80">
            {magazines.length} {magazines.length > 1 ? 'numéros inscrits' : 'numéro inscrit'}
          </p>
        </div>
        <Link to="/admin/revues/new" className="bouton-laiton">
          <Plus className="mr-2 h-5 w-5" />
          Inscrire un numéro
        </Link>
      </div>

      {error && (
        <div className="message-erreur mt-5" role="alert">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-laiton" />
        <input
          type="search"
          placeholder="Rechercher un numéro…"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          aria-label="Rechercher un numéro"
          className="champ-sombre pl-10"
        />
      </div>

      <div className="parchemin mt-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-encre/60">
              {['Couverture', 'Thème', 'Revue', 'Numéro', 'Parution', 'Plan', ''].map(titre => (
                <th key={titre} className="px-4 py-3 text-left font-titre text-base font-bold">{titre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtres.map(magazine => (
              <tr key={magazine.id} className="border-b border-encre/15 last:border-0 hover:bg-laiton/15">
                <td className="px-4 py-2">
                  {magazine.cover_image_url ? (
                    <img src={magazine.cover_image_url} alt="" loading="lazy" className="h-16 w-12 rounded-sm object-cover shadow-md" />
                  ) : (
                    <div className="reliure h-16 w-12 !p-0 text-[0.5rem]" aria-hidden="true" />
                  )}
                </td>
                <td className="px-4 py-2 text-encre-douce">{magazine.category}</td>
                <td className="px-4 py-2 font-semibold">{magazine.title}</td>
                <td className="whitespace-nowrap px-4 py-2">{magazine.issue_number}</td>
                <td className="whitespace-nowrap px-4 py-2 text-encre-douce">{formatDate(magazine.publication_date) || '—'}</td>
                <td className="px-4 py-2 text-cire">{magazine.has_plan ? magazine.plan_model_name || 'Oui' : <span className="text-encre-douce">—</span>}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-3">
                    <Link
                      to={`/admin/revues/${magazine.id}`}
                      className="text-encre hover:text-laiton-fonce"
                      title="Modifier"
                      aria-label={`Modifier ${magazine.title} n° ${magazine.issue_number}`}
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(magazine)}
                      disabled={suppression === magazine.id}
                      className="text-cire hover:brightness-75 disabled:opacity-50"
                      title="Retirer"
                      aria-label={`Retirer ${magazine.title} n° ${magazine.issue_number}`}
                    >
                      {suppression === magazine.id ? <Loader className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtres.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center italic text-encre-douce">
                  {magazines.length === 0 ? 'Le registre est vierge : inscrivez un premier numéro.' : 'Aucun numéro ne correspond.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
