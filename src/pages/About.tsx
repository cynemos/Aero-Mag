import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="dorure text-center text-4xl font-extrabold sm:text-5xl">À propos</h1>
      <div className="filet mx-auto mt-6 max-w-xs" aria-hidden="true" />

      <div className="parchemin mt-10 space-y-8 p-8 text-xl sm:p-12">
        <section>
          <h2 className="mb-2 text-2xl font-bold">Une bibliothèque personnelle</h2>
          <p>
            Ce site est le catalogue de mes revues anciennes : aéromodélisme, Porsche, enduro, trial
            et d'autres encore. Chaque numéro y est inscrit avec sa couverture, sa date de parution
            et ses mots-clés, rangé par thème puis par revue.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Retrouver un numéro</h2>
          <p>
            Sur <Link to="/collection" className="font-semibold text-cire underline underline-offset-4">les rayonnages</Link>,
            la recherche porte sur le titre, le numéro, le thème, la description et les mots-clés.
            Pour les revues d'aéromodélisme, elle porte aussi sur le modèle du plan encarté, et un
            filtre ne garde que les numéros qui en ont un.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Consultation seulement</h2>
          <p>
            La bibliothèque se visite librement : rien à vendre, rien à commander, aucun compte à créer.
          </p>
        </section>
      </div>
    </div>
  );
}
