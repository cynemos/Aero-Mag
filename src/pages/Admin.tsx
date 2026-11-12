import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, FileText, Loader, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
      [m.title, m.issue_number, m.plan_model_name ?? '', ...(m.keywords ?? [])].some(champ =>
        champ.toLowerCase().includes(terme)
      )
    );
  }, [magazines, recherche]);

  const handleDelete = async (magazine: Magazine) => {
    if (!window.confirm(`Supprimer « ${magazine.title} n° ${magazine.issue_number} » de la bibliothèque ?`)) return;
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
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gérer la bibliothèque</h1>
          <p className="text-sm text-gray-500 mt-1">
            {magazines.length} {magazines.length > 1 ? 'numéros' : 'numéro'}
          </p>
        </div>
        <Link
          to="/admin/revues/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un numéro
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mt-4 flex">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher un numéro…"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          aria-label="Rechercher un numéro"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="mt-6 overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Couverture', 'Revue', 'Numéro', 'Parution', 'Plan', ''].map(titre => (
                <th key={titre} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">{titre}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtres.map(magazine => (
              <tr key={magazine.id}>
                <td className="px-4 py-3">
                  {magazine.cover_image_url ? (
                    <img
                      src={magazine.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="h-16 w-12 object-cover rounded shadow"
                    />
                  ) : (
                    <div className="h-16 w-12 bg-gray-100 rounded" />
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{magazine.title}</td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{magazine.issue_number}</td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(magazine.publication_date) || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {magazine.has_plan ? (
                    <span className="inline-flex items-center text-blue-700">
                      <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                      {magazine.plan_model_name || 'Oui'}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end space-x-3">
                    <Link
                      to={`/admin/revues/${magazine.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                      aria-label={`Modifier ${magazine.title} n° ${magazine.issue_number}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(magazine)}
                      disabled={suppression === magazine.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Supprimer"
                      aria-label={`Supprimer ${magazine.title} n° ${magazine.issue_number}`}
                    >
                      {suppression === magazine.id ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtres.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                  {magazines.length === 0 ? 'Aucun numéro pour le moment : commencez par en ajouter un.' : 'Aucun numéro ne correspond.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
