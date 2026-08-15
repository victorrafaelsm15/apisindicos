import { supabase, isSupabaseConfigured } from './supabaseClient';

function sanitize(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .toLowerCase();
}

export async function uploadFile(bucket, file) {
  if (!file) return null;
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar upload de arquivos.');
  }
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${sanitize(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
