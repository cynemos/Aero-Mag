import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader, Pencil } from 'lucide-react';
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
        <Loader className="h-8 w-8 animate-spin text-laiton" />
      </div>
    );
  }

  const retour = (
    <Link
      to={magazine ? `/collection?theme=${encodeURIComponent(magazine.category)}` : '/collection'}
      className="bouton-sobre"
    >
      <ArrowLeft className="mr-2 h-5 w-5" />
      Retour aux rayonnages
    </Link>
  );

  if (!magazine) {
    return (
      <div className="space-y-6 py-16 text-center">
        <p className="text-xl italic">Ce numéro n'est pas, ou n'est plus, sur les rayonnages.</p>
        {retour}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        {retour}
        {isAdmin && (
          <Link to={`/admin/revues/${magazine.id}`} className="bouton-sobre">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        )}
      </div>

      {/* La revue posée sur le sous-main, sa fiche de catalogue à côté */}
      <div className="sous-main p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
          <div className="mx-auto w-full max-w-sm -rotate-1 overflow-hidden rounded-[2px_6px_6px_2px] bg-bois-700 shadow-[10px_14px_30px_rgba(0,0,0,0.7)]">
            {magazine.cover_image_url ? (
              <img
                src={magazine.cover_image_url}
                alt={`Couverture de ${magazine.title} n° ${magazine.issue_number}`}
                className="block aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div className="reliure aspect-[3/4] text-2xl">
                <span>{magazine.title}</span>
                <span className="mt-2 font-texte text-lg italic">n° {magazine.issue_number}</span>
              </div>
            )}
          </div>

          <article className="fiche-catalogue rotate-[0.4deg]">
            <p className="text-sm uppercase tracking-widest text-encre-douce">{magazine.category}</p>
            <h1 className="font-titre text-3xl font-extrabold leading-[1.9rem] text-encre sm:text-4xl sm:leading-[3.8rem]">
              {magazine.title}
            </h1>
            <p><span className="text-encre-douce">Numéro ....</span> {magazine.issue_number}</p>
            {magazine.publication_date && (
              <p><span className="text-encre-douce">Parution ..</span> {formatDate(magazine.publication_date)}</p>
            )}
            {magazine.has_plan && (
              <p>
                <span className="text-encre-douce">Plan ......</span>{' '}
                <span className="font-bold text-cire">encarté{magazine.plan_model_name ? ` — ${magazine.plan_model_name}` : ''}</span>
              </p>
            )}

            {magazine.description && (
              <p className="mt-[1.9rem] whitespace-pre-line font-texte text-lg leading-[1.9rem]">{magazine.description}</p>
            )}

            {magazine.keywords && magazine.keywords.length > 0 && (
              <div className="mt-[1.9rem] pb-8">
                <h2 className="font-fiche text-sm uppercase tracking-widest text-encre-douce">Mots-clés</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {magazine.keywords.map(keyword => (
                    <Link key={keyword} to={`/collection?q=${encodeURIComponent(keyword)}`} className="mot-cle">
                      {keyword}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
