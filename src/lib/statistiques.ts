import { MOIS, type Magazine } from './magazines';
import { trierThemes } from './categories';

// Statistiques de la bibliothèque, calculées dans le navigateur à partir de la liste des numéros.

// Plage de numéros manquants, avec la parution estimée de ses bornes (revues mensuelles)
export interface Manque {
  de: number;
  a: number;
  estimation: string | null; // « avril 2007 – septembre 2013 environ »
}

export interface StatRevue {
  titre: string;
  theme: string;
  nombre: number;
  premier: number | null; // plus petit numéro (chiffres seulement)
  dernier: number | null;
  manques: Manque[];
  nbManquants: number;
  completude: number | null; // part des numéros présents entre le premier et le dernier, de 0 à 1
  horsSerie: string[]; // numéros qui ne sont pas des nombres (« HS 3 », « Spécial »…)
  debut: string | null; // première parution (AAAA-MM-01)
  fin: string | null;
  incoherences: string[]; // numéros dont la date contredit l'ordre des numéros
}

export interface Statistiques {
  total: number;
  revues: StatRevue[];
  themes: { nom: string; nombre: number; revues: number }[];
  decennies: { decennie: number; nombre: number }[];
  sansDate: number;
  avecPlan: number;
  aCompleter: { magazine: Magazine; manque: string[] }[];
  debut: string | null;
  fin: string | null;
}

const enMois = (date: string) => {
  const [annee, mois] = date.split('-').map(Number);
  return annee * 12 + mois - 1;
};
const nomDuMois = (n: number) => `${MOIS[n % 12]} ${Math.floor(n / 12)}`;

// « 69 », « n°69 », « 069 » → 69 ; « HS 3 » → null
export const numeroEntier = (numero: string) => {
  const m = numero.trim().match(/^(?:n\s*[°º.]?\s*)?0*(\d{1,5})$/i);
  return m ? Number(m[1]) : null;
};

const statRevue = (titre: string, numeros: Magazine[]): StatRevue => {
  const connus = new Map<number, Magazine>();
  const horsSerie: string[] = [];
  for (const m of numeros) {
    const n = numeroEntier(m.issue_number);
    if (n === null) horsSerie.push(m.issue_number.trim());
    else connus.set(n, m);
  }
  const liste = [...connus.keys()].sort((a, b) => a - b);
  const premier = liste[0] ?? null;
  const dernier = liste[liste.length - 1] ?? null;

  // Numéros présents ayant une date, pour estimer la parution des absents
  const dates = liste
    .filter(n => connus.get(n)!.publication_date)
    .map(n => ({ n, mois: enMois(connus.get(n)!.publication_date!) }));

  const estimer = (n: number) => {
    const avant = [...dates].reverse().find(d => d.n < n);
    const apres = dates.find(d => d.n > n);
    if (!avant || !apres || apres.mois <= avant.mois) return null;
    return Math.round(avant.mois + ((n - avant.n) * (apres.mois - avant.mois)) / (apres.n - avant.n));
  };

  const manques: Manque[] = [];
  for (let i = 1; i < liste.length; i++) {
    const de = liste[i - 1] + 1;
    const a = liste[i] - 1;
    if (de > a) continue;
    const e1 = estimer(de);
    const e2 = estimer(a);
    let estimation: string | null = null;
    if (e1 !== null && e2 !== null) {
      estimation = e1 === e2 ? `${nomDuMois(e1)} environ` : `${nomDuMois(e1)} – ${nomDuMois(e2)} environ`;
    }
    manques.push({ de, a, estimation });
  }
  const nbManquants = manques.reduce((s, m) => s + m.a - m.de + 1, 0);

  const incoherences: string[] = [];
  for (let i = 1; i < dates.length; i++) {
    if (dates[i].mois < dates[i - 1].mois) {
      incoherences.push(`n° ${dates[i - 1].n} (${nomDuMois(dates[i - 1].mois)}) paraît après le n° ${dates[i].n} (${nomDuMois(dates[i].mois)})`);
    }
  }

  const parutions = numeros.map(m => m.publication_date).filter((d): d is string => !!d).sort();
  return {
    titre,
    theme: numeros[0].category,
    nombre: numeros.length,
    premier,
    dernier,
    manques,
    nbManquants,
    completude: premier !== null && dernier !== null ? liste.length / (dernier - premier + 1) : null,
    horsSerie,
    debut: parutions[0] ?? null,
    fin: parutions[parutions.length - 1] ?? null,
    incoherences,
  };
};

export const calculerStatistiques = (magazines: Magazine[]): Statistiques => {
  const parRevue = new Map<string, Magazine[]>();
  for (const m of magazines) parRevue.set(m.title.trim(), [...(parRevue.get(m.title.trim()) ?? []), m]);
  const revues = [...parRevue.entries()]
    .map(([titre, numeros]) => statRevue(titre, numeros))
    .sort((a, b) => b.nombre - a.nombre || a.titre.localeCompare(b.titre, 'fr'));

  const themes = trierThemes(magazines.map(m => m.category)).map(nom => ({
    nom,
    nombre: magazines.filter(m => m.category === nom).length,
    revues: revues.filter(r => r.theme === nom).length,
  }));

  const parDecennie = new Map<number, number>();
  for (const m of magazines) {
    if (!m.publication_date) continue;
    const decennie = Math.floor(Number(m.publication_date.slice(0, 4)) / 10) * 10;
    parDecennie.set(decennie, (parDecennie.get(decennie) ?? 0) + 1);
  }

  const aCompleter = magazines
    .map(magazine => ({
      magazine,
      manque: [
        !magazine.cover_image_url && 'couverture',
        !magazine.publication_date && 'date de parution',
        !magazine.description && 'description',
        magazine.has_plan && !magazine.plan_model_name && 'modèle du plan',
      ].filter((x): x is string => !!x),
    }))
    .filter(f => f.manque.length > 0)
    .sort((a, b) => b.manque.length - a.manque.length);

  const parutions = magazines.map(m => m.publication_date).filter((d): d is string => !!d).sort();
  return {
    total: magazines.length,
    revues,
    themes,
    decennies: [...parDecennie.entries()].sort((a, b) => a[0] - b[0]).map(([decennie, nombre]) => ({ decennie, nombre })),
    sansDate: magazines.filter(m => !m.publication_date).length,
    avecPlan: magazines.filter(m => m.has_plan).length,
    aCompleter,
    debut: parutions[0] ?? null,
    fin: parutions[parutions.length - 1] ?? null,
  };
};

// Liste des numéros manquants, en texte (à emporter en brocante)
export const listeDesManquants = (revues: StatRevue[]) =>
  revues
    .filter(r => r.manques.length)
    .map(r => `${r.titre} : ${r.manques.map(m => (m.de === m.a ? `${m.de}` : `${m.de} à ${m.a}`)).join(', ')}`)
    .join('\n');

export const plage = (m: Manque) => (m.de === m.a ? `n° ${m.de}` : `n° ${m.de} à ${m.a}`);
