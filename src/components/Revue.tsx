import { Link } from 'react-router-dom';
import { formatDate, type Magazine } from '../lib/magazines';

// Une revue debout sur sa tablette : couverture (ou reliure de toile), signet « Plan »,
// et son étiquette sous la tablette. S'utilise dans un conteneur .rayonnage.
export function Revue({ magazine, avecTitre = false }: { magazine: Magazine; avecTitre?: boolean }) {
  const nom = `${magazine.title} n° ${magazine.issue_number}`;
  return (
    <Link to={`/collection/${magazine.id}`} className="revue" aria-label={nom}>
      <span className="couverture">
        {magazine.cover_image_url ? (
          <img src={magazine.cover_image_url} alt="" loading="lazy" />
        ) : (
          <span className="reliure">
            <span>{magazine.title}</span>
            <span className="mt-1 font-texte text-sm italic">n° {magazine.issue_number}</span>
          </span>
        )}
        {magazine.has_plan && <span className="signet">Plan</span>}
      </span>
      <span className="etiquette">
        {avecTitre && <span className="block truncate font-titre text-[0.9rem]">{magazine.title}</span>}
        N° {magazine.issue_number}
        {magazine.publication_date && <small>{formatDate(magazine.publication_date)}</small>}
      </span>
    </Link>
  );
}
