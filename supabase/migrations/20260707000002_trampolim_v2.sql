-- ============================================================
-- TRAMPOLIM v2 — perfil rico, empresas, talentos, badges.
-- Aplicar após 20260707000001. Espelha lib/types.ts.
-- ============================================================

-- Vagas: vínculo com empresa
alter table public.trampolim_vagas
  add column if not exists empresa_id text;

-- Perfil rico do candidato
alter table public.trampolim_profiles
  add column if not exists foto text,
  add column if not exists headline text not null default '',
  add column if not exists bio text not null default '',
  add column if not exists email text not null default '',
  add column if not exists telefone text not null default '',
  add column if not exists linkedin text not null default '',
  add column if not exists experiencias jsonb not null default '[]',
  add column if not exists formacao jsonb not null default '[]',
  add column if not exists idiomas jsonb not null default '[]',
  add column if not exists cv_importado boolean not null default false;

create table if not exists public.trampolim_empresas (
  id text primary key,
  nome text not null,
  logo text not null default '🏢',
  cor text not null default '#4da6ff',
  setor text not null default '',
  cidade text not null default '',
  tamanho text not null default '',
  slogan text not null default '',
  sobre text not null default '',
  selos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.trampolim_talentos (
  id text primary key,
  nome text not null,
  emoji text not null default '🚀',
  headline text not null default '',
  area text not null default '',
  senioridade text not null default '',
  cidade text not null default '',
  modelo text not null default 'remoto',
  pretensao int not null default 0,
  skills text[] not null default '{}',
  bio text not null default '',
  disponivel boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.trampolim_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_id text not null,
  em timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists public.trampolim_likes_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id text not null,
  talento_id text not null,
  em timestamptz not null default now(),
  unique (empresa_id, talento_id)
);

alter table public.trampolim_empresas enable row level security;
alter table public.trampolim_talentos enable row level security;
alter table public.trampolim_badges enable row level security;
alter table public.trampolim_likes_empresa enable row level security;

-- Leitura pública dos catálogos; escrita via service role.
drop policy if exists trampolim_empresas_read on public.trampolim_empresas;
create policy trampolim_empresas_read on public.trampolim_empresas
  for select to anon, authenticated using (true);

drop policy if exists trampolim_talentos_read on public.trampolim_talentos;
create policy trampolim_talentos_read on public.trampolim_talentos
  for select to anon, authenticated using (true);

-- MVP demo (sem auth): escrita aberta — hardening na fase de auth.
drop policy if exists trampolim_badges_rw on public.trampolim_badges;
create policy trampolim_badges_rw on public.trampolim_badges
  for all to anon, authenticated using (true) with check (true);

drop policy if exists trampolim_likes_empresa_rw on public.trampolim_likes_empresa;
create policy trampolim_likes_empresa_rw on public.trampolim_likes_empresa
  for all to anon, authenticated using (true) with check (true);
