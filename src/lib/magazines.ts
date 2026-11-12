import { supabase, COVER_BUCKET } from './supabase';
import type { Database } from '../types/supabase';

export type Magazine = Database['public']['Tables']['magazines']['Row'];
export type MagazineInput = Database['public']['Tables']['magazines']['Insert'];

const DOUBLON = '23505'; // contrainte d'unicité (titre + numéro)

export const emptyMagazine = (): MagazineInput => ({
  title: '',
  issue_number: '',
  publication_date: null,
  description: null,
  cover_image_url: null,
  keywords: [],
  has_plan: false,
  plan_model_name: null,
});

// Ne garde que les champs modifiables (la base gère id, created_at et updated_at)
const champs = (m: MagazineInput): MagazineInput => ({
  title: m.title.trim(),
  issue_number: m.issue_number.trim(),
  publication_date: m.publication_date || null,
  description: m.description?.trim() || null,
  cover_image_url: m.cover_image_url || null,
  keywords: m.keywords?.length ? m.keywords : null,
  has_plan: !!m.has_plan,
  plan_model_name: m.has_plan ? m.plan_model_name?.trim() || null : null,
});

export const getMagazines = async (): Promise<Magazine[]> => {
  const { data, error } = await supabase
    .from('magazines')
    .select('*')
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

export const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '';
