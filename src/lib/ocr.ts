import { createWorker, PSM } from 'tesseract.js';

// Taille de travail de la photo : assez grande pour lire le numéro et la date, écrits petit
// (la couverture envoyée, réduite à 800 px, ne suffit pas).
const OCR_MAX_SIDE = 2200;
// Tesseract fusionne une petite ligne (numéro, date) avec le grand titre voisin, puis la perd.
// On relit donc aussi la couverture par bandes horizontales qui se chevauchent : l'une d'elles
// contient la petite ligne sans le titre entier.
const BANDES = 6;

const versPng = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Image illisible'))), 'image/png'));

// Lit le texte d'une photo de couverture : image entière, puis bandes de haut en bas,
// jusqu'à ce que « suffit » accepte le texte déjà lu (chaque bande coûte environ une seconde).
export const readCoverText = async (file: Blob, suffit: (texte: string) => boolean = () => false): Promise<string> => {
  const bitmap = await createImageBitmap(file); // orientation de l'appareil photo respectée
  const echelle = Math.min(1, OCR_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);

  const decoupe = (y: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = largeur;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponible');
    ctx.drawImage(bitmap, 0, -y, largeur, hauteur);
    return versPng(canvas);
  };

  const worker = await createWorker('fra');
  try {
    // Une couverture est faite de textes épars (titre, numéro, date, accroches)
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
    let texte = (await worker.recognize(await decoupe(0, hauteur))).data.text;
    const h = Math.round(hauteur / BANDES);
    for (let y = 0; y + h <= hauteur && !suffit(texte); y += Math.round(h / 2)) {
      texte += '\n' + (await worker.recognize(await decoupe(y, h))).data.text;
    }
    return texte;
  } finally {
    await worker.terminate();
    bitmap.close();
  }
};

// --- Lecture de la couverture : revue, numéro et date de parution ---
// Chaque information n'est proposée que si elle est reconnue ; sinon elle reste vide.

export interface CoverInfo {
  title: string | null;
  issueNumber: string | null;
  publicationDate: string | null; // AAAA-MM-01
  doubleIssue: boolean; // le numéro couvre aussi le mois suivant (juillet-août)
}

// Revues connues d'office, complétées par les titres déjà présents dans la bibliothèque
// (dès qu'un numéro d'une nouvelle revue est inscrit, son titre est reconnu sur les suivants).
export const TITRES_CONNUS = ['Modèle Magazine', 'RC Pilot', 'Flat 6', 'Moto Verte', 'Moto Journal', 'Trial Magazine'];

// Minuscules, sans accents, ponctuation remplacée par des espaces
const normaliser = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const distance = (a: string, b: string): number => {
  const ligne = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonale = ligne[0];
    ligne[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const haut = ligne[j];
      ligne[j] = Math.min(ligne[j] + 1, ligne[j - 1] + 1, diagonale + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonale = haut;
    }
  }
  return ligne[b.length];
};

// Cherche un titre connu dans le texte, en tolérant quelques erreurs de lecture
const trouverTitre = (texte: string, titres: string[]): string | null => {
  const mots = normaliser(texte).split(' ').filter(Boolean);
  const compact = mots.join('');
  let meilleur: { titre: string; score: number } | null = null;

  for (const titre of new Set(titres.map(t => t.trim()).filter(Boolean))) {
    const cible = normaliser(titre).replace(/ /g, '');
    if (cible.length < 3) continue;
    if (compact.includes(cible)) {
      if (!meilleur || meilleur.score > 0 || cible.length > normaliser(meilleur.titre).replace(/ /g, '').length) {
        meilleur = { titre, score: 0 };
      }
      continue;
    }
    if (cible.length < 5) continue; // titres courts : correspondance exacte seulement
    const nbMots = normaliser(titre).split(' ').length;
    for (let n = Math.max(1, nbMots - 1); n <= nbMots + 1; n++) {
      for (let i = 0; i + n <= mots.length; i++) {
        const fenetre = mots.slice(i, i + n).join('');
        const score = distance(fenetre, cible) / cible.length;
        if (score <= 0.2 && (!meilleur || score < meilleur.score)) meilleur = { titre, score };
      }
    }
  }
  return meilleur?.titre ?? null;
};

const MOIS: [RegExp, number][] = [
  [/janv(?:ier)?/, 1], [/fevr?(?:ier)?/, 2], [/mars/, 3], [/avr(?:il)?/, 4], [/mai/, 5], [/juin/, 6],
  [/juil(?:let)?/, 7], [/aout/, 8], [/sept(?:embre)?/, 9], [/oct(?:obre)?/, 10], [/nov(?:embre)?/, 11], [/dec(?:embre)?/, 12],
];
const MOIS_RE = MOIS.map(([re]) => re.source).join('|');

const anneePlausible = (annee: number) => annee >= 1900 && annee <= new Date().getFullYear() + 1;
const formaterDate = (annee: number, mois: number) => `${annee}-${String(mois).padStart(2, '0')}-01`;

const numeroDuMois = (mot: string | undefined) =>
  mot ? MOIS.find(([re]) => new RegExp(`^(?:${re.source})$`).test(mot))?.[1] : undefined;

// « mars 1985 », « 03/1985 » ; numéros doubles : « juillet-août 1985 »,
// « décembre 1985-janvier 1986 » (le numéro est daté de son premier mois)
const trouverDate = (texte: string): { date: string; double: boolean } | null => {
  const t = normaliser(texte);
  const annee = String.raw`((?:19|20)\d{2})`;
  const enLettres = new RegExp(String.raw`\b(${MOIS_RE})\b(?:\s+${annee})?(?:\s+(${MOIS_RE})\b)?\s+${annee}\b`, 'g');
  for (const [, mot1, annee1, mot2, annee2] of t.matchAll(enLettres)) {
    const mois = numeroDuMois(mot1);
    const an = +(annee1 ?? annee2);
    if (!mois || !anneePlausible(an)) continue;
    const suivant = numeroDuMois(mot2);
    return { date: formaterDate(an, mois), double: suivant === (mois % 12) + 1 };
  }
  // « 03/1985 », « 07-08/1985 » (double), « 15/03/1985 » (jour/mois/année : le mois compte)
  const enChiffres = /\b(\d{1,2})(?:\s*[/.-]\s*(0?[1-9]|1[0-2]))?\s*[/.-]\s*((?:19|20)\d{2})\b/g;
  for (const [, a, b, an] of texte.matchAll(enChiffres)) {
    if (!anneePlausible(+an)) continue;
    const premier = +a;
    if (b && premier >= 1 && premier <= 12 && +b === (premier % 12) + 1) {
      return { date: formaterDate(+an, premier), double: true };
    }
    const mois = b ? +b : premier;
    if (mois >= 1 && mois <= 12) return { date: formaterDate(+an, mois), double: false };
  }
  return null;
};

// « N° 123 », « n°123 », « No 123 », « Numéro 123 », « #123 »
const trouverNumero = (texte: string): string | null => {
  const m = texte.match(/(?:\bn\s*[°ºo˚*]|\bn\s*\.|\bnum[ée]ro|#)\s*\.?\s*(\d{1,4})\b/i);
  return m ? m[1] : null;
};

export const extractCoverInfo = (texte: string, titresConnus: string[] = []): CoverInfo => {
  const date = trouverDate(texte);
  return {
    title: trouverTitre(texte, [...TITRES_CONNUS, ...titresConnus]),
    issueNumber: trouverNumero(texte),
    publicationDate: date?.date ?? null,
    doubleIssue: date?.double ?? false,
  };
};
