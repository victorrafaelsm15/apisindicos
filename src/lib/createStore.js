import { supabase, isSupabaseConfigured } from './supabaseClient';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function writeLocal(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export function createStore(table, { orderBy = 'created_at', ascending = false } = {}) {
  const localKey = `apis_${table}_v1`;
  return {
    async list(filters = {}) {
      if (isSupabaseConfigured) {
        try {
          let q = supabase.from(table).select('*').order(orderBy, { ascending });
          Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
          const { data, error } = await q;
          if (error) throw error;
          return data;
        } catch { /* fallback local */ }
      }
      let list = readLocal(localKey);
      Object.entries(filters).forEach(([k, v]) => { list = list.filter((i) => i[k] === v); });
      return list.sort((a, b) => {
        const av = a[orderBy] ?? ''; const bv = b[orderBy] ?? '';
        const cmp = String(av).localeCompare(String(bv));
        return ascending ? cmp : -cmp;
      });
    },
    async get(id) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
          if (error) throw error;
          return data;
        } catch { /* fallback local */ }
      }
      return readLocal(localKey).find((i) => i.id === id) || null;
    },
    async create(payload) {
      const record = { id: uid(), created_at: new Date().toISOString(), ...payload };
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from(table).insert(record).select().single();
          if (error) throw error;
          return data;
        } catch { /* fallback local */ }
      }
      const list = readLocal(localKey); list.push(record); writeLocal(localKey, list);
      return record;
    },
    async update(id, payload) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
          if (error) throw error;
          return data;
        } catch { /* fallback local */ }
      }
      const list = readLocal(localKey);
      const idx = list.findIndex((i) => i.id === id);
      if (idx >= 0) { list[idx] = { ...list[idx], ...payload }; writeLocal(localKey, list); return list[idx]; }
      return null;
    },
    async remove(id) {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;
          return true;
        } catch { /* fallback local */ }
      }
      writeLocal(localKey, readLocal(localKey).filter((i) => i.id !== id));
      return true;
    },
  };
}
