import { supabase, isSupabaseConfigured } from './supabaseClient';

// Login do painel pelo Supabase Auth. Além de usuário e senha válidos, a
// conta precisa estar na tabela public.admin_users (ver supabase-setup.sql):
// é isso que as regras de acesso (RLS) do banco verificam para liberar os
// dados pessoais das fichas e inscrições.

export async function isAdmin() {
  if (!isSupabaseConfigured) return false;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

export async function login(email, password) {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).' };
  }
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    if (error.status === 429) return { ok: false, error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' };
    return { ok: false, error: 'E-mail ou senha incorretos.' };
  }
  if (!(await isAdmin())) {
    await supabase.auth.signOut();
    return { ok: false, error: 'Este usuário não tem permissão de administrador.' };
  }
  return { ok: true };
}

export async function logout() {
  await supabase.auth.signOut();
}
