import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">À propos</h1>

      <div className="mt-8 space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Une bibliothèque personnelle</h2>
          <p>
            AéroMag est le catalogue de ma collection de revues d'aéromodélisme. Chaque numéro y est
            enregistré avec sa couverture, sa date de parution, ses mots-clés et, quand il y en a un,
            le plan encarté et le nom du modèle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">À quoi sert-elle ?</h2>
          <p>
            À retrouver vite un numéro : dans la{' '}
            <Link to="/collection" className="text-blue-700 hover:underline">collection</Link>, la recherche
            porte sur le titre, le numéro, la description, le modèle du plan et les mots-clés. Un filtre
            n'affiche que les numéros avec plan encarté.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Consultation seulement</h2>
          <p>
            Le site présente la collection : il n'y a rien à vendre ni à commander, et aucun compte
            à créer pour la consulter.
          </p>
        </section>
      </div>
    </div>
  );
}
