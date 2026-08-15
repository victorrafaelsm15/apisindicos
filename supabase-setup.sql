-- Setup completo do backend do site APIS.
-- Rode este script no SQL Editor do seu projeto Supabase. Ele é idempotente
-- (pode ser rodado várias vezes sem erro) e cria do zero qualquer tabela ou
-- bucket que ainda não exista, então serve tanto para a primeira configuração
-- quanto para aplicar só as novidades mais recentes.
--
-- IMPORTANTE sobre o tipo do "id": o app (src/lib/createStore.js) gera o id
-- no navegador como texto, no formato "1732636800000-a1b2c3d" — NÃO é um
-- UUID. Por isso toda tabela abaixo usa "id text primary key" e não
-- "uuid ... default gen_random_uuid()". Se a coluna id de alguma tabela já
-- existir como uuid, o insert do app falha silenciosamente (o createStore
-- captura o erro do Supabase e cai para o localStorage do navegador — os
-- dados parecem salvar, mas somem ao trocar de dispositivo/navegador).
--
-- Este script também segue o mesmo padrão de acesso já usado pelo app:
-- chave anônima (anon) com leitura e escrita liberadas, pois o login do
-- painel admin é local (sessionStorage) e não usa o Supabase Auth.

-- ============================================================
-- 0) Corrige o tipo do id de filiacao_solicitacoes, caso já exista como uuid
--    (isso pode ter acontecido se você rodou uma versão anterior deste script)
-- ============================================================
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'filiacao_solicitacoes'
      and column_name = 'id' and data_type = 'uuid'
  ) then
    alter table public.filiacao_solicitacoes alter column id drop default;
    alter table public.filiacao_solicitacoes alter column id type text using id::text;
  end if;
end $$;

-- ============================================================
-- 1) Tabelas
-- ============================================================
create table if not exists public.news (
  id text primary key,
  created_at timestamptz not null default now(),
  title text,
  subtitle text,
  category text,
  aula text,
  image_url text
);

create table if not exists public.events (
  id text primary key,
  created_at timestamptz not null default now(),
  title text,
  location text,
  event_date text,
  description text
);

create table if not exists public.documents (
  id text primary key,
  created_at timestamptz not null default now(),
  title text,
  description text,
  file_url text
);

create table if not exists public.board_members (
  id text primary key,
  created_at timestamptz not null default now(),
  name text,
  role text,
  display_order integer,
  photo_url text
);

create table if not exists public.partners (
  id text primary key,
  created_at timestamptz not null default now(),
  name text,
  logo_url text
);

create table if not exists public.filiacao_solicitacoes (
  id text primary key,
  created_at timestamptz not null default now(),
  nome_completo text not null,
  cpf_cnpj text not null,
  email text not null,
  telefone text not null,
  condominio text,
  categoria text not null,
  status text not null default 'pendente'
);

-- Colunas novas em tabelas que já existiam antes do upload de imagem
alter table public.news add column if not exists image_url text;
alter table public.board_members add column if not exists photo_url text;

-- ============================================================
-- 2) RLS + policies (anon: select/insert/update/delete, igual ao padrão
--    já usado pelo restante do app)
-- ============================================================
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.documents enable row level security;
alter table public.board_members enable row level security;
alter table public.partners enable row level security;
alter table public.filiacao_solicitacoes enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['news', 'events', 'documents', 'board_members', 'partners'] loop
    execute format('drop policy if exists "%1$s_select_anon" on public.%1$s', t);
    execute format('create policy "%1$s_select_anon" on public.%1$s for select to anon using (true)', t);

    execute format('drop policy if exists "%1$s_insert_anon" on public.%1$s', t);
    execute format('create policy "%1$s_insert_anon" on public.%1$s for insert to anon with check (true)', t);

    execute format('drop policy if exists "%1$s_update_anon" on public.%1$s', t);
    execute format('create policy "%1$s_update_anon" on public.%1$s for update to anon using (true) with check (true)', t);

    execute format('drop policy if exists "%1$s_delete_anon" on public.%1$s', t);
    execute format('create policy "%1$s_delete_anon" on public.%1$s for delete to anon using (true)', t);
  end loop;
end $$;

-- filiacao_solicitacoes: sem delete (o painel só aprova/rejeita, nunca apaga)
drop policy if exists "filiacao_select_anon" on public.filiacao_solicitacoes;
create policy "filiacao_select_anon" on public.filiacao_solicitacoes
  for select to anon using (true);

drop policy if exists "filiacao_insert_anon" on public.filiacao_solicitacoes;
create policy "filiacao_insert_anon" on public.filiacao_solicitacoes
  for insert to anon with check (true);

drop policy if exists "filiacao_update_anon" on public.filiacao_solicitacoes;
create policy "filiacao_update_anon" on public.filiacao_solicitacoes
  for update to anon using (true) with check (true);

-- ============================================================
-- 3) Buckets de Storage para upload de arquivos
--    Públicos para leitura, pois os arquivos aparecem no site
--    institucional sem exigir login.
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('documentos', 'documentos', true),
  ('logos-parceiros', 'logos-parceiros', true),
  ('capas-noticias', 'capas-noticias', true),
  ('fotos-diretoria', 'fotos-diretoria', true)
on conflict (id) do nothing;

do $$
declare
  b text;
begin
  foreach b in array array['documentos', 'logos-parceiros', 'capas-noticias', 'fotos-diretoria'] loop
    execute format('drop policy if exists "%1$s_read_public" on storage.objects', b);
    execute format('create policy "%1$s_read_public" on storage.objects for select to public using (bucket_id = %2$L)', b, b);

    execute format('drop policy if exists "%1$s_write_anon" on storage.objects', b);
    execute format('create policy "%1$s_write_anon" on storage.objects for insert to anon with check (bucket_id = %2$L)', b, b);
  end loop;
end $$;
