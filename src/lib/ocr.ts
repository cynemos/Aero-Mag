import { createWorker, Worker } from 'tesseract.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const performOCR = async (imageUrl: string | File): Promise<string> => {
  let worker: Worker | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // tesseract.js v5 : la langue se passe à la création, le worker est prêt à l'emploi
      worker = await createWorker('fra');

      // Perform OCR
      const { data: { text } } = await worker.recognize(imageUrl);

      // Clean up worker
      await worker.terminate();
      worker = null;

      // If we got text, return it
      if (text.trim()) {
        return text;
      } else {
        throw new Error('No text was extracted from the image');
      }

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown OCR error');
      
      // Clean up worker if it exists
      if (worker) {
        await worker.terminate();
        worker = null;
      }

      // If this is not our last attempt, wait before retrying
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
        continue;
      }
      
      // On last attempt, throw the error
      console.error('OCR error:', error);
      throw new Error(`OCR failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
    }
  }

  // This should never be reached due to the throw in the catch block
  throw new Error('OCR failed unexpectedly');
};

// Liste de stop words français pour améliorer l'extraction des mots-clés
const frenchStopWords = [
  'alors', 'au', 'aucuns', 'aussi', 'autre', 'avant', 'avec', 'avoir', 'bon', 'car',
  'ce', 'cela', 'ces', 'ceux', 'chaque', 'ci', 'comme', 'comment', 'dans', 'des', 'du',
  'dedans', 'dehors', 'depuis', 'devrait', 'doit', 'donc', 'dos', 'droite', 'début', 'elle',
  'elles', 'en', 'encore', 'essai', 'est', 'et', 'eu', 'fait', 'faites', 'fois', 'font',
  'force', 'haut', 'hors', 'ici', 'il', 'ils', 'je', 'juste', 'la', 'le', 'les', 'leur',
  'là', 'ma', 'maintenant', 'mais', 'mes', 'mine', 'moins', 'mon', 'mot', 'même', 'ni',
  'nommés', 'notre', 'nous', 'nouveaux', 'ou', 'où', 'par', 'parce', 'parole', 'pas', 'personnes',
  'peu', 'pièce', 'plupart', 'pour', 'pourquoi', 'quand', 'que', 'quel', 'quelle', 'quelles', 'quels',
  'qui', 'sa', 'sans', 'ses', 'seulement', 'si', 'sien', 'son', 'sont', 'sous', 'soyez', 'sujet', 'sur',
  'ta', 'tandis', 'tellement', 'tels', 'tes', 'ton', 'tous', 'tout', 'trop', 'très', 'tu', 'valeur',
  'voie', 'voient', 'vont', 'votre', 'vous', 'vu', 'ça', 'étaient', 'état', 'étions', 'été', 'être',
  'page', 'pages', 'numéro', 'prix', 'euros', 'euro', 'magazine', 'magazines', 'édition', 'éditions'
];

export const extractKeywords = (text: string): string[] => {
  // Nettoyer et normaliser le texte
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\sàáâãäçèéêëìíîïñòóôõöùúûüýÿ-]/g, ' ') // Preserve French accents
    .replace(/\s+/g, ' ')
    .trim();

  // Diviser en mots
  const words = cleanText.split(' ');

  // Filtrer les mots
  const filteredWords = words.filter(word => {
    return word.length > 3 && // Mot assez long
           !frenchStopWords.includes(word) && // Pas un stop word
           !/^\d+$/.test(word) && // Pas uniquement des chiffres
           word.length < 20; // Pas trop long (probablement une erreur d'OCR)
  });

  // Comptage de la fréquence de chaque mot
  const wordCount: { [key: string]: number } = {};
  filteredWords.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Trier les mots par fréquence décroissante
  const sortedWords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a) // Trier par fréquence
    .filter(([word]) => {
      // Vérifications supplémentaires de qualité
      const hasValidChars = /^[a-zàáâãäçèéêëìíîïñòóôõöùúûüýÿ-]+$/i.test(word);
      const isReasonableLength = word.length >= 4 && word.length <= 15;
      return hasValidChars && isReasonableLength;
    })
    .map(([word]) => word);

  // Retourner les 10 premiers mots-clés
  return sortedWords.slice(0, 10);
};
