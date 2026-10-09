-- Setup completo do backend do site APIS.
-- Rode este script no SQL Editor do seu projeto Supabase. Ele é idempotente
-- (pode ser rodado várias vezes sem erro) e cria do zero qualquer tabela ou
-- bucket que ainda não exista, então serve tanto para a primeira configuração
-- quanto para aplicar só as novidades mais recentes.
--
-- IMPORTANTE sobre o tipo do "id": o app (src/lib/createStore.js) gera o id
-- no navegador como texto, no formato "1732636800000-a1b2c3d" — NÃO é um
-- UUID. Por isso toda tabela abaixo usa "id text primary key" e não
-- "uuid ... default gen_random_uuid()".
--
-- MODELO DE ACESSO (LGPD):
-- - Visitantes (chave anônima, que fica pública no código do site) só podem
--   LER o conteúdo institucional e ENVIAR fichas/inscrições/anexos. Não
--   conseguem ler, alterar nem apagar dados pessoais.
-- - O painel admin usa login do Supabase Auth. Só contas cadastradas na
--   tabela public.admin_users (seção 2) leem os dados pessoais e editam o
--   conteúdo do site. Veja no FINAL deste arquivo como cadastrar um admin.

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
  description text,
  image_url text,
  is_featured_popup boolean default false,
  allow_registration boolean,
  external_link text
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

create table if not exists public.evento_inscricoes (
  id text primary key,
  created_at timestamptz not null default now(),
  event_id text,
  nome_completo text,
  condominio text,
  perfil text,
  telefone text,
  email text,
  status text not null default 'pendente'
);

-- Colunas novas em tabelas que já existiam antes do upload de imagem
alter table public.news add column if not exists image_url text;
alter table public.board_members add column if not exists photo_url text;
alter table public.evento_inscricoes add column if not exists status text default 'pendente';

-- Ficha de filiação: novos campos, termos de adesão e anexos
alter table public.filiacao_solicitacoes add column if not exists data_nascimento date;
alter table public.filiacao_solicitacoes add column if not exists estado_civil text;
alter table public.filiacao_solicitacoes add column if not exists endereco text;
alter table public.filiacao_solicitacoes add column if not exists bairro text;
alter table public.filiacao_solicitacoes add column if not exists cidade text;
alter table public.filiacao_solicitacoes add column if not exists cep text;
alter table public.filiacao_solicitacoes add column if not exists estado text;
-- Caminho do arquivo dentro do bucket "filiacao-anexos" (não é link público)
alter table public.filiacao_solicitacoes add column if not exists doc_identidade_path text;
alter table public.filiacao_solicitacoes add column if not exists ata_eleicao_path text;
-- Aceite dos termos e data/hora do aceite (momento do envio da ficha)
alter table public.filiacao_solicitacoes add column if not exists termo_adesao_aceito boolean not null default false;
alter table public.filiacao_solicitacoes add column if not exists declaracao_veracidade_aceita boolean not null default false;
alter table public.filiacao_solicitacoes add column if not exists termos_aceitos_em timestamptz;

-- ============================================================
-- 2) Administradores do painel
--    Lista de contas do Supabase Auth com acesso ao painel. Sem policies:
--    ninguém lê ou altera esta tabela pela API, só pelo SQL Editor.
-- ============================================================
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================
-- 3) RLS + policies das tabelas
--    Remove TODAS as policies existentes nestas tabelas (inclusive as
--    antigas que liberavam tudo para a chave anônima) e recria do zero.
-- ============================================================
do $$
declare
  t text;
  p record;
begin
  foreach t in array array['news', 'events', 'documents', 'board_members', 'partners',
                           'filiacao_solicitacoes', 'evento_inscricoes'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
  end loop;

  -- Conteúdo institucional: leitura pública, escrita só de admin
  foreach t in array array['news', 'events', 'documents', 'board_members', 'partners'] loop
    execute format('create policy "%1$s_select_public" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('create policy "%1$s_insert_admin" on public.%1$I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "%1$s_update_admin" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "%1$s_delete_admin" on public.%1$I for delete to authenticated using (public.is_admin())', t);
  end loop;

  -- Dados pessoais: qualquer um envia (sempre como "pendente"),
  -- só admin lê, altera ou apaga
  foreach t in array array['filiacao_solicitacoes', 'evento_inscricoes'] loop
    execute format('create policy "%1$s_insert_public" on public.%1$I for insert to anon, authenticated with check (status = ''pendente'')', t);
    execute format('create policy "%1$s_select_admin" on public.%1$I for select to authenticated using (public.is_admin())', t);
    execute format('create policy "%1$s_update_admin" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
  -- Fichas de filiação não são apagadas (o painel só aprova/rejeita);
  -- inscrições em eventos podem ser excluídas pelo painel.
  create policy "evento_inscricoes_delete_admin" on public.evento_inscricoes
    for delete to authenticated using (public.is_admin());
end $$;

-- ============================================================
-- 4) Storage
--    Buckets do conteúdo do site: públicos para leitura (os arquivos
--    aparecem no site sem login); upload só de admin.
--    Bucket "filiacao-anexos": PRIVADO (CNH/RG/Passaporte e Ata de
--    Eleição). Qualquer um envia pelo formulário; só admin abre, por link
--    temporário de 1 hora. O Supabase recusa arquivos acima de 10 MB ou
--    fora de PDF/JPG/PNG, além da validação feita no navegador.
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('documentos', 'documentos', true),
  ('logos-parceiros', 'logos-parceiros', true),
  ('capas-noticias', 'capas-noticias', true),
  ('fotos-diretoria', 'fotos-diretoria', true),
  ('capas-eventos', 'capas-eventos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'filiacao-anexos', 'filiacao-anexos', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
declare
  b text;
  p record;
begin
  -- Remove policies antigas que mencionam estes buckets
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') || ' ' || coalesce(with_check, ''))
          ~ '(documentos|logos-parceiros|capas-noticias|fotos-diretoria|capas-eventos|filiacao-anexos)'
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;

  foreach b in array array['documentos', 'logos-parceiros', 'capas-noticias', 'fotos-diretoria', 'capas-eventos'] loop
    execute format('create policy "%1$s_read_public" on storage.objects for select to public using (bucket_id = %2$L)', b, b);
    execute format('create policy "%1$s_insert_admin" on storage.objects for insert to authenticated with check (bucket_id = %2$L and public.is_admin())', b, b);
  end loop;

  create policy "filiacao_anexos_insert_public" on storage.objects
    for insert to anon, authenticated with check (bucket_id = 'filiacao-anexos');
  create policy "filiacao_anexos_select_admin" on storage.objects
    for select to authenticated using (bucket_id = 'filiacao-anexos' and public.is_admin());
end $$;

-- ============================================================
-- 5) COMO CADASTRAR UM ADMINISTRADOR DO PAINEL
--    a) Supabase > Authentication > Users > "Add user" > "Create new user":
--       informe e-mail e uma senha forte e marque "Auto Confirm User".
--    b) Rode a linha abaixo (descomente e troque o e-mail):
--
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'email-do-admin@exemplo.com'
-- on conflict do nothing;
--
--    Para remover um admin:
-- delete from public.admin_users
-- where user_id = (select id from auth.users where email = 'email-do-admin@exemplo.com');
-- ============================================================
