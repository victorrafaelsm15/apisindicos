import { createStore } from './createStore';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const newsStore = createStore('news', { orderBy: 'created_at', ascending: false });
export const eventsStore = createStore('events', { orderBy: 'event_date', ascending: true });
export const documentsStore = createStore('documents', { orderBy: 'created_at', ascending: false });
export const boardStore = createStore('board_members', { orderBy: 'display_order', ascending: true });
export const partnersStore = createStore('partners', { orderBy: 'created_at', ascending: false });
export const filiacaoStore = createStore('filiacao_solicitacoes', { orderBy: 'created_at', ascending: false });
export const eventoInscricoesStore = createStore('evento_inscricoes', { orderBy: 'created_at', ascending: false });

async function unfeatureOtherEvents(exceptId) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('events').update({ is_featured_popup: false }).neq('id', exceptId);
  } catch { /* ignore */ }
}

// Wraps eventsStore for the admin CRUD panel so at most one event can be
// marked is_featured_popup at a time.
export const eventsAdminStore = {
  ...eventsStore,
  async create(payload) {
    const record = await eventsStore.create(payload);
    if (payload.is_featured_popup) await unfeatureOtherEvents(record.id);
    return record;
  },
  async update(id, payload) {
    const record = await eventsStore.update(id, payload);
    if (payload.is_featured_popup) await unfeatureOtherEvents(id);
    return record;
  },
};
