import { supabase, COVER_BUCKET } from './supabase';
import type { Database } from '../types/supabase';
import { AEROMODELISME, aUnPlanPossible } from './categories';

export type Magazine = Database['public']['Tables']['magazines']['Row'];
export type MagazineInput = Database['public']['Tables']['magazines']['Insert'];

const DOUBLON = '23505'; // contrainte d'unicité (titre + numéro)

export const emptyMagazine = (): MagazineInput => ({
  title: '',
  issue_number: '',
  category: AEROMODELISME,
  publication_date: null,
  double_issue: false,
  description: null,
  cover_image_url: null,
  has_plan: false,
  plan_model_name: null,
});

// Ne garde que les champs modifiables (la base gère id, created_at et updated_at)
const champs = (m: MagazineInput): MagazineInput => {
  const category = m.category?.trim() || AEROMODELISME;
  const has_plan = !!m.has_plan && aUnPlanPossible(category);
  return {
    title: m.title.trim(),
    issue_number: m.issue_number.trim(),
    category,
    publication_date: m.publication_date || null,
    double_issue: !!m.publication_date && !!m.double_issue,
    description: m.description?.trim() || null,
    cover_image_url: m.cover_image_url || null,
    has_plan,
    plan_model_name: has_plan ? m.plan_model_name?.trim() || null : null,
  };
};

export const getMagazines = async (): Promise<Magazine[]> => {
  const { data, error } = await supabase
    .from('magazines')
    .select('*')
    .order('category', { ascending: true })
    .order('title', { ascending: true })
    .order('publication_date', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Lecture des revues :', error);
    throw new Error('Impossible de récupérer les revues');
  }
  return data ?? [];
};

export const getMagazineById = async (id: string): Promise<Magazine> => {
  const { data, error } = await supabase.from('magazines').select('*').eq('id', id).maybeSingle();

  if (error) {
    console.error('Lecture de la revue :', error);
    throw new Error('Impossible de récupérer la revue');
  }
  if (!data) throw new Error('Revue introuvable');
  return data;
};

export const createMagazine = async (magazine: MagazineInput): Promise<Magazine> => {
  const { data, error } = await supabase.from('magazines').insert(champs(magazine)).select().single();

  if (error) {
    console.error('Création de la revue :', error);
    throw new Error(error.code === DOUBLON ? 'Ce numéro de cette revue existe déjà' : 'Impossible de créer la revue');
  }
  return data;
};

export const updateMagazine = async (id: string, magazine: MagazineInput): Promise<Magazine> => {
  const { data, error } = await supabase.from('magazines').update(champs(magazine)).eq('id', id).select().single();

  if (error) {
    console.error('Mise à jour de la revue :', error);
    throw new Error(error.code === DOUBLON ? 'Ce numéro de cette revue existe déjà' : 'Impossible de mettre à jour la revue');
  }
  return data;
};

export const deleteMagazine = async (id: string): Promise<void> => {
  const { data, error } = await supabase.from('magazines').delete().eq('id', id).select('cover_image_url');

  if (error) {
    console.error('Suppression de la revue :', error);
    throw new Error('Impossible de supprimer la revue');
  }
  await removeCoverByUrl(data?.[0]?.cover_image_url);
};

// Couvertures : stockage public « magazines », dossier magazine-covers/
export const uploadCover = async (file: File): Promise<string> => {
  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const path = `magazine-covers/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) throw error;

  return supabase.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
};

// Supprime du stockage une couverture envoyée par le site (ignore les adresses externes)
export const removeCoverByUrl = async (url?: string | null) => {
  if (!url) return;
  const marker = `/object/public/${COVER_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
  const { error } = await supabase.storage.from(COVER_BUCKET).remove([path]);
  if (error) console.error('Suppression de la couverture :', error);
};

export const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

// Parution saisie dans les formulaires : mois (« 7 », ou « 7+ » pour un numéro double juillet-août)
// et année sur 4 chiffres ; les deux vides si la date est inconnue.
export interface Parution { mois: string; annee: string }

export const lireParution = (date: string | null | undefined, double: boolean | undefined): Parution => {
  const [annee, mois] = (date ?? '').split('-');
  return mois ? { mois: `${parseInt(mois, 10)}${double ? '+' : ''}`, annee } : { mois: '', annee: '' };
};

export const parutionValide = ({ mois, annee }: Parution) => !!mois === !!annee && (!annee || /^\d{4}$/.test(annee));

export const dateDeParution = ({ mois, annee }: Parution) => ({
  publication_date: mois ? `${annee}-${String(parseInt(mois, 10)).padStart(2, '0')}-01` : null,
  double_issue: mois.endsWith('+'),
});

// Thème de chaque revue de la bibliothèque (celui de son premier numéro trouvé)
export const themesParTitre = (liste: Magazine[]) => {
  const themes: Record<string, string> = {};
  for (const m of liste) themes[m.title.trim()] ??= m.category;
  return themes;
};

// Revues mensuelles : seuls le mois et l'année comptent (publication_date vaut le 1er du mois).
// Numéro double : « juillet-août 1989 », ou « décembre 1989-janvier 1990 ».
export const formatDate = (date: string | null, double = false) => {
  const [annee, mois] = (date ?? '').split('-').map(Number);
  if (!annee || !mois) return '';
  if (!double) return `${MOIS[mois - 1]} ${annee}`;
  return mois === 12 ? `décembre ${annee}-janvier ${annee + 1}` : `${MOIS[mois - 1]}-${MOIS[mois]} ${annee}`;
};
