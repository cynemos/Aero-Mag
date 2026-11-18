import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, ClipboardCopy, Lightbulb, Loader } from 'lucide-react';
import { formatDate, getMagazines, type Magazine } from '../lib/magazines';
import { calculerStatistiques, listeDesManquants, plage, type StatRevue } from '../lib/statistiques';
import { useAuth } from '../lib/auth';

const pourcent = (x: number) => `${Math.round(x * 100)} %`;
const pluriel = (n: number, mot: string, mots = `${mot}s`) => `${n} ${n > 1 ? mots : mot}`;
const lienRevue = (titre: string) => `/collection?q=${encodeURIComponent(titre)}`;

// Barre horizontale proportionnelle (répartitions, complétude)
const Barre = ({ part }: { part: number }) => (
  <div className="h-2.5 w-full overflow-hidden rounded-full bg-encre/10">
    <div className="h-full rounded-full bg-laiton" style={{ width: `${Math.max(2, Math.round(part * 100))}%` }} />
  </div>
);

const Chiffre = ({ valeur, libelle }: { valeur: string | number; libelle: string }) => (
  <div className="parchemin p-4 text-center">
    <p className="font-titre text-3xl font-bold">{valeur}</p>
    <p className="mt-1 text-sm italic opacity-80">{libelle}</p>
  </div>
);

// Pistes proposées à partir des chiffres : séries à compléter, fiches à enrichir, erreurs probables
const pistes = (revues: StatRevue[], aCompleter: number, sansDate: number, isAdmin: boolean) => {
  const idees: { cle: string; texte: React.ReactNode }[] = [];
  for (const r of revues.filter(r => r.nbManquants > 0 && r.nbManquants <= 5)) {
    idees.push({
      cle: `presque-${r.titre}`,
      texte: <>Plus que {pluriel(r.nbManquants, 'numéro')} pour une série continue de <b>{r.titre}</b> (n° {r.premier} à {r.dernier}) : {r.manques.map(plage).join(', ')}.</>,
    });
  }
  const trous = revues.flatMap(r => r.manques.map(m => ({ r, m, taille: m.a - m.de + 1 }))).sort((a, b) => b.taille - a.taille);
  if (trous[0] && trous[0].taille > 5) {
    const { r, m } = trous[0];
    idees.push({
      cle: 'trou',
      texte: <>Plus grand trou : <b>{r.titre}</b>, {plage(m)}{m.estimation ? ` (${m.estimation})` : ''}. Un lot d'occasion le comblerait d'un coup.</>,
    });
  }
  const seuls = revues.filter(r => r.nombre === 1);
  if (seuls.length) {
    idees.push({
      cle: 'seuls',
      texte: <>{seuls.length > 1 ? 'Revues' : 'Revue'} représentée{seuls.length > 1 ? 's' : ''} par un seul numéro : {seuls.map(r => r.titre).join(', ')}. Les numéros voisins sont souvent vendus ensemble.</>,
    });
  }
  const incoherentes = revues.filter(r => r.incoherences.length);
  if (incoherentes.length) {
    idees.push({
      cle: 'dates',
      texte: <>Dates à vérifier : {incoherentes.flatMap(r => r.incoherences.map(i => `${r.titre}, ${i}`)).join(' ; ')}.</>,
    });
  }
  if (sansDate) idees.push({ cle: 'sans-date', texte: <>{pluriel(sansDate, 'numéro')} sans date de parution : la date permet d'estimer celle des numéros manquants.</> });
  if (aCompleter && isAdmin) idees.push({ cle: 'fiches', texte: <>{pluriel(aCompleter, 'fiche')} à compléter (couverture, date, description ou modèle du plan) : voir la liste en bas de page.</> });
  return idees;
};

export function Recapitulatif() {
  const { isAdmin } = useAuth();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    getMagazines()
      .then(setMagazines)
      .catch(err => setError(err instanceof Error ? err.message : 'Échec du chargement des revues'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => calculerStatistiques(magazines), [magazines]);
  const manquants = listeDesManquants(stats.revues);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(`Numéros recherchés\n${manquants}`);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setError('Copie impossible : sélectionnez la liste à la main');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="h-8 w-8 animate-spin text-laiton" />
      </div>
    );
  }

  const idees = pistes(stats.revues, stats.aCompleter.length, stats.sansDate, isAdmin);
  const maxTheme = Math.max(1, ...stats.themes.map(t => t.nombre));
  const maxDecennie = Math.max(1, ...stats.decennies.map(d => d.nombre));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="dorure text-4xl font-extrabold sm:text-5xl">Le récapitulatif</h1>
        <p className="mt-2 italic text-parchemin/80">L'état de la collection, revue par revue, et ce qui lui manque.</p>
      </div>

      {error && (
        <div className="message-erreur">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {stats.total === 0 ? (
        <p className="py-16 text-center text-xl italic text-parchemin/80">Les rayonnages sont encore vides.</p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Chiffre valeur={stats.total} libelle={stats.total > 1 ? 'numéros' : 'numéro'} />
            <Chiffre valeur={stats.revues.length} libelle={stats.revues.length > 1 ? 'revues' : 'revue'} />
            <Chiffre valeur={stats.themes.length} libelle={stats.themes.length > 1 ? 'thèmes' : 'thème'} />
            <Chiffre
              valeur={stats.debut && stats.fin ? `${stats.debut.slice(0, 4)}–${stats.fin.slice(0, 4)}` : '—'}
              libelle="années couvertes"
            />
            <Chiffre valeur={stats.revues.reduce((s, r) => s + r.nbManquants, 0)} libelle="numéros manquants dans les séries" />
          </section>

          {idees.length > 0 && (
            <section className="parchemin p-5 sm:p-6">
              <h2 className="flex items-center font-titre text-2xl font-bold">
                <Lightbulb className="mr-2 h-6 w-6 text-laiton" />
                Pistes pour enrichir la collection
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                {idees.map(i => <li key={i.cle}>{i.texte}</li>)}
              </ul>
            </section>
          )}

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-titre text-2xl font-bold text-laiton-clair">Revue par revue</h2>
              {manquants && (
                <button type="button" onClick={copier} className="bouton-sobre">
                  {copie ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
                  {copie ? 'Liste copiée' : 'Copier la liste des numéros recherchés'}
                </button>
              )}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {stats.revues.map(r => (
                <article key={r.titre} className="parchemin p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-titre text-xl font-bold">
                      <Link to={lienRevue(r.titre)} className="underline-offset-4 hover:underline">{r.titre}</Link>
                    </h3>
                    <span className="whitespace-nowrap text-sm italic opacity-80">{r.theme}</span>
                  </div>
                  <p className="mt-1 text-sm">
                    {pluriel(r.nombre, 'numéro')}
                    {r.premier !== null && r.dernier !== null && r.premier !== r.dernier && ` · du n° ${r.premier} au n° ${r.dernier}`}
                    {r.debut && r.fin && ` · ${formatDate(r.debut)}${r.fin !== r.debut ? ` – ${formatDate(r.fin)}` : ''}`}
                  </p>
                  {r.completude !== null && r.premier !== r.dernier && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Série continue</span>
                        <span>{pourcent(r.completude)}</span>
                      </div>
                      <Barre part={r.completude} />
                    </div>
                  )}
                  {r.manques.length > 0 ? (
                    <div className="mt-3 text-sm">
                      <p className="font-semibold">Manquent ({r.nbManquants}) :</p>
                      <ul className="mt-1 space-y-0.5">
                        {r.manques.map(m => (
                          <li key={m.de}>
                            {plage(m)}
                            {m.estimation && <span className="italic opacity-75"> — {m.estimation}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    r.premier !== r.dernier && <p className="mt-3 text-sm italic">Série complète entre le premier et le dernier numéro.</p>
                  )}
                  {r.horsSerie.length > 0 && <p className="mt-2 text-sm">Hors-série et autres : {r.horsSerie.join(', ')}</p>}
                </article>
              ))}
            </div>
            <p className="mt-3 text-sm italic text-parchemin/70">
              Les manquants sont comptés entre le plus petit et le plus grand numéro présents ; leur date est estimée
              d'après les numéros voisins datés.
            </p>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="parchemin p-5">
              <h2 className="font-titre text-xl font-bold">Par thème</h2>
              <ul className="mt-3 space-y-3">
                {stats.themes.map(t => (
                  <li key={t.nom}>
                    <div className="mb-1 flex justify-between text-sm">
                      <Link to={`/collection?theme=${encodeURIComponent(t.nom)}`} className="hover:underline">{t.nom}</Link>
                      <span>{pluriel(t.nombre, 'numéro')} · {pluriel(t.revues, 'revue')}</span>
                    </div>
                    <Barre part={t.nombre / maxTheme} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="parchemin p-5">
              <h2 className="font-titre text-xl font-bold">Par décennie de parution</h2>
              {stats.decennies.length ? (
                <ul className="mt-3 space-y-3">
                  {stats.decennies.map(d => (
                    <li key={d.decennie}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Années {d.decennie}</span>
                        <span>{pluriel(d.nombre, 'numéro')}</span>
                      </div>
                      <Barre part={d.nombre / maxDecennie} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm italic">Aucune date de parution renseignée.</p>
              )}
              {stats.sansDate > 0 && stats.decennies.length > 0 && <p className="mt-3 text-sm italic">Sans date : {stats.sansDate}</p>}
              {stats.avecPlan > 0 && <p className="mt-3 text-sm">Plans encartés : {stats.avecPlan}</p>}
            </div>
          </section>

          {isAdmin && stats.aCompleter.length > 0 && (
            <section className="parchemin p-5">
              <h2 className="font-titre text-xl font-bold">Fiches à compléter ({stats.aCompleter.length})</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {stats.aCompleter.slice(0, 30).map(({ magazine, manque }) => (
                  <li key={magazine.id}>
                    <Link to={`/admin/revues/${magazine.id}`} className="font-semibold underline-offset-4 hover:underline">
                      {magazine.title} n° {magazine.issue_number}
                    </Link>
                    <span className="opacity-75"> — manque : {manque.join(', ')}</span>
                  </li>
                ))}
              </ul>
              {stats.aCompleter.length > 30 && <p className="mt-2 text-sm italic">… et {stats.aCompleter.length - 30} autres.</p>}
            </section>
          )}
        </>
      )}
    </div>
  );
}
