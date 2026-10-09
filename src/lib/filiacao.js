import { supabase, isSupabaseConfigured } from './supabaseClient';

// Bucket PRIVADO (ver supabase-setup.sql): os documentos pessoais não ficam
// com link público permanente. O painel admin gera links temporários.
export const ANEXOS_BUCKET = 'filiacao-anexos';

const MB = 1024 * 1024;

export const ANEXO_RULES = {
  doc_identidade: {
    label: 'CNH, RG ou Passaporte',
    exts: ['pdf', 'jpg', 'jpeg', 'png'],
    mimes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    maxBytes: 5 * MB,
    accept: 'application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png',
    formatsLabel: 'PDF, JPG ou PNG',
  },
  ata_eleicao: {
    label: 'Ata de Eleição de Síndico',
    exts: ['pdf'],
    mimes: ['application/pdf'],
    maxBytes: 10 * MB,
    accept: 'application/pdf,.pdf',
    formatsLabel: 'PDF',
  },
};

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || '');
  return m ? m[1].toLowerCase() : '';
}

// Retorna mensagem de erro em português, ou true se o arquivo for válido.
export function validateAnexo(kind, file) {
  const rule = ANEXO_RULES[kind];
  if (!file) return `Anexe o arquivo "${rule.label}".`;
  // Alguns celulares não informam o MIME type; nesse caso vale a extensão.
  const typeOk = rule.exts.includes(extOf(file.name)) && (!file.type || rule.mimes.includes(file.type));
  if (!typeOk) {
    return `Formato não aceito. Envie um arquivo ${rule.formatsLabel}.`;
  }
  if (file.size > rule.maxBytes) {
    const sizeMb = (file.size / MB).toFixed(1).replace('.', ',');
    return `Arquivo muito grande (${sizeMb} MB). O limite é ${rule.maxBytes / MB} MB.`;
  }
  return true;
}

async function uploadAnexo(folder, kind, file) {
  const path = `${folder}/${kind}.${extOf(file.name)}`;
  const { error } = await supabase.storage
    .from(ANEXOS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return path;
}

/**
 * Envia os anexos para o Storage e grava a ficha em filiacao_solicitacoes.
 * Diferente do createStore, NÃO cai para o localStorage em caso de erro:
 * uma ficha que não chegou ao banco precisa aparecer como erro para quem
 * está preenchendo, e não como "enviada".
 */
export async function submitFiliacao({ doc_identidade, ata_eleicao, ...fields }) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const [docPath, ataPath] = await Promise.all([
    uploadAnexo(id, 'doc_identidade', doc_identidade),
    uploadAnexo(id, 'ata_eleicao', ata_eleicao),
  ]);
  const record = {
    id,
    created_at: new Date().toISOString(),
    ...fields,
    doc_identidade_path: docPath,
    ata_eleicao_path: ataPath,
    status: 'pendente',
  };
  const { error } = await supabase.from('filiacao_solicitacoes').insert(record);
  if (error) throw error;
  return record;
}

// Link temporário (1 hora) para abrir um anexo no painel admin.
export async function getAnexoUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(ANEXOS_BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
