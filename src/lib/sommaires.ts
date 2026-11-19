import { numeroEntier } from './statistiques';

// Sommaires repris des pages archivées (Wayback Machine) du site de l'éditeur, rangés par
// revue dans public/sommaires/ : { "120": { "texte": "…", "source": "https://web.archive.org/…" } }.
// Le site de l'éditeur n'a plus ces pages, et les archives ne sont pas lisibles directement
// depuis le navigateur : le fichier est construit une fois pour toutes (voir README).
const FICHIERS: Record<string, string> = {
  'rs magazine': '/sommaires/rs-magazine.json',
};

export interface Sommaire {
  texte: string;
  source: string;
}

const cle = (titre: string) => titre.trim().toLowerCase().replace(/\s+/g, ' ');
const chargements = new Map<string, Promise<Record<string, Sommaire>>>();

export const sommaireConnu = (titre: string) => cle(titre) in FICHIERS;

// Sommaire d'un numéro, ou null s'il n'est pas dans les archives (hors-série compris)
export const chercherSommaire = async (titre: string, numero: string): Promise<Sommaire | null> => {
  const fichier = FICHIERS[cle(titre)];
  const n = numeroEntier(numero);
  if (!fichier || n === null) return null;
  if (!chargements.has(fichier)) {
    chargements.set(
      fichier,
      fetch(fichier).then(r => {
        if (!r.ok) throw new Error('Sommaires indisponibles');
        return r.json();
      }),
    );
  }
  try {
    return (await chargements.get(fichier)!)[String(n)] ?? null;
  } catch (err) {
    chargements.delete(fichier); // nouvel essai au prochain appel
    throw err;
  }
};

// Texte enregistré dans la description de la fiche
export const texteDuSommaire = (s: Sommaire) => `${s.texte}\n\n(Sommaire repris de rsmagazine.fr, archives Wayback Machine.)`;
