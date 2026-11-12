import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader, Pencil } from 'lucide-react';
import { getMagazineById, formatDate, type Magazine } from '../lib/magazines';
import { useAuth } from '../lib/auth';

export function MagazineView() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMagazineById(id)
      .then(setMagazine)
      .catch(() => setMagazine(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const retour = (
    <Link to="/collection" className="inline-flex items-center text-gray-600 hover:text-gray-900">
      <ArrowLeft className="h-5 w-5 mr-2" />
      Retour à la collection
    </Link>
  );

  if (!magazine) {
    return (
      <div className="text-center py-16 space-y-6">
        <p className="text-gray-700">Cette revue n'existe pas ou a été retirée de la bibliothèque.</p>
        {retour}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        {retour}
        {isAdmin && (
          <Link
            to={`/admin/revues/${magazine.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 lg:items-start">
        <div className="max-w-md mx-auto lg:mx-0 w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow">
          {magazine.cover_image_url ? (
            <img
              src={magazine.cover_image_url}
              alt={`Couverture de ${magazine.title} n° ${magazine.issue_number}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Sans couverture</div>
          )}
        </div>

        <div className="mt-8 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{magazine.title}</h1>
          <p className="mt-2 text-lg text-gray-900">N° {magazine.issue_number}</p>
          {magazine.publication_date && (
            <p className="mt-1 text-gray-500">Paru en {formatDate(magazine.publication_date)}</p>
          )}

          {magazine.has_plan && (
            <div className="mt-5 inline-flex items-center px-3 py-2 rounded-md bg-blue-50 text-blue-800">
              <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">
                Plan encarté{magazine.plan_model_name ? ` : ${magazine.plan_model_name}` : ''}
              </span>
            </div>
          )}

          {magazine.description && (
            <p className="mt-6 text-base text-gray-700 whitespace-pre-line">{magazine.description}</p>
          )}

          {magazine.keywords && magazine.keywords.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Mots-clés</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {magazine.keywords.map(keyword => (
                  <Link
                    key={keyword}
                    to={`/collection?q=${encodeURIComponent(keyword)}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
