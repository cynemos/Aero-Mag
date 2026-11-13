import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getMagazines, type Magazine } from '../lib/magazines';
import { trierThemes } from '../lib/categories';
import { Revue } from '../components/Revue';

const pluriel = (n: number, un: string, plusieurs: string) => (n > 1 ? plusieurs : un);

export function Home() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMagazines()
      .then(setMagazines)
      .catch(() => setMagazines([]))
      .finally(() => setLoaded(true));
  }, []);

  const themes = useMemo(() => {
    const comptes = new Map<string, number>();
    for (const m of magazines) comptes.set(m.category, (comptes.get(m.category) ?? 0) + 1);
    return trierThemes(comptes.keys()).map(theme => ({ theme, nombre: comptes.get(theme)! }));
  }, [magazines]);

  const stats = useMemo(() => [
    { valeur: magazines.length, libelle: pluriel(magazines.length, 'numéro', 'numéros') },
    { valeur: new Set(magazines.map(m => m.title)).size, libelle: pluriel(new Set(magazines.map(m => m.title)).size, 'revue', 'revues') },
    { valeur: themes.length, libelle: pluriel(themes.length, 'thème', 'thèmes') },
    { valeur: magazines.filter(m => m.has_plan).length, libelle: pluriel(magazines.filter(m => m.has_plan).length, 'plan encarté', 'plans encartés') },
  ], [magazines, themes]);

  const recents = useMemo(
    () => [...magazines].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 7),
    [magazines]
  );

  return (
    <div className="space-y-14">
      {/* Fronton */}
      <section className="boiserie px-6 py-14 text-center sm:px-12 sm:py-20">
        <p className="font-titre text-sm uppercase tracking-[0.35em] text-laiton-clair/90">Collection personnelle</p>
        <h1 className="dorure mx-auto mt-4 max-w-4xl text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
          La bibliothèque des revues anciennes
        </h1>
        <div className="filet mx-auto mt-8 max-w-md" aria-hidden="true" />
        <p className="mx-auto mt-8 max-w-2xl text-xl italic text-parchemin/90 sm:text-2xl">
          Aéromodélisme, Porsche, enduro, trial… Des décennies de numéros, rangés sur leurs rayonnages,
          à feuilleter par thème, par revue ou par mot-clé.
        </p>
        <Link to="/collection" className="bouton-laiton mt-10 text-lg">
          <Search className="mr-2 h-5 w-5" />
          Entrer dans la bibliothèque
        </Link>
      </section>

      {/* Fichier : les tiroirs de chiffres */}
      {loaded && (
        <section aria-label="La collection en chiffres">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(({ valeur, libelle }) => (
              <div key={libelle} className="tiroir">
                <div className="porte-etiquette">
                  <p className="font-titre text-4xl font-extrabold leading-none">{valeur}</p>
                  <p className="mt-1 font-fiche text-sm uppercase tracking-wide text-encre-douce">{libelle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Les thèmes */}
      {themes.length > 0 && (
        <section>
          <h2 className="plaque mb-6 text-xl">Par thème</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {themes.map(({ theme, nombre }) => (
              <Link key={theme} to={`/collection?theme=${encodeURIComponent(theme)}`} className="tiroir">
                <div className="porte-etiquette">
                  <p className="font-titre text-xl font-bold leading-tight">{theme}</p>
                  <p className="mt-1 font-fiche text-sm text-encre-douce">
                    {nombre} {pluriel(nombre, 'numéro', 'numéros')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Derniers numéros rangés */}
      {recents.length > 0 && (
        <section>
          <h2 className="plaque mb-6 text-xl">Derniers numéros rangés</h2>
          <div className="rayonnage">
            {recents.map(magazine => <Revue key={magazine.id} magazine={magazine} avecTitre />)}
          </div>
        </section>
      )}

      {loaded && magazines.length === 0 && (
        <p className="text-center text-xl italic text-parchemin/80">
          Les rayonnages sont encore vides : les premiers numéros arrivent.
        </p>
      )}
    </div>
  );
}
