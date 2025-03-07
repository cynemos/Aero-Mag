import { createWorker } from 'tesseract.js';

export const performOCR = async (imageUrl: string): Promise<string> => {
  try {
    const worker = await createWorker('fra');
    
    const { data: { text } } = await worker.recognize(imageUrl);
    
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Échec de l\'extraction du texte de l\'image');
  }
};

export const extractKeywords = (text: string): string[] => {
  // Nettoyer et normaliser le texte
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Diviser en mots
  const words = cleanText.split(' ');

  // Filtrer les mots courts et les doublons
  const keywords = [...new Set(words)]
    .filter(word => word.length > 3)
    .slice(0, 10); // Limiter à 10 mots-clés

  return keywords;
};
