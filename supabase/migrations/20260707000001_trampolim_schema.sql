-- ============================================================
-- TRAMPOLIM — "Tinder de empregos"
-- Schema espelhado em lib/types.ts. Aplicar num projeto Supabase
-- dedicado (free tier) e definir NEXT_PUBLIC_SUPABASE_URL +
-- NEXT_PUBLIC_SUPABASE_ANON_KEY para ativar o modo nuvem.
--
-- SEGURANÇA (MVP): sem auth, identidade = UUID de dispositivo.
-- As policies de escrita são abertas ao role anon de propósito.
-- Hardening planejado (fase 2): Supabase Anonymous Auth +
-- policies com auth.uid() — ver README > Roadmap.
-- ============================================================
create extension if not exists pgcrypto;

create table if not exists public.trampolim_vagas (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  logo text not null default '🏢',
  cor text not null default '#c8ff16',
  cargo text not null,
  area text not null,
  senioridade text not null,
  salario_min int not null,
  salario_max int not null,
  modelo text not null check (modelo in ('remoto','hibrido','presencial')),
  cidade text not null,
  skills text[] not null default '{}',
  descricao text not null,
  beneficios text[] not null default '{}',
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.trampolim_profiles (
  id uuid primary key,
  nome text not null default '',
  area text not null default '',
  senioridade text not null default '',
  cidade text not null default '',
  modelo text not null default 'remoto',
  pretensao int not null default 0,
  skills text[] not null default '{}',
  emoji text not null default '🚀',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trampolim_swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  vaga_id uuid not null references public.trampolim_vagas(id) on delete cascade,
  direcao text not null check (direcao in ('like','nope','super')),
  score int not null default 0,
  matched boolean not null default false,
  status text not null default 'em_analise',
  created_at timestamptz not null default now(),
  unique (user_id, vaga_id)
);

create table if not exists public.trampolim_mensagens (
  id uuid primary key default gen_random_uuid(),
  swipe_id uuid not null references public.trampolim_swipes(id) on delete cascade,
  autor text not null check (autor in ('candidato','empresa')),
  texto text not null,
  created_at timestamptz not null default now()
);

create index if not exists trampolim_swipes_user_idx on public.trampolim_swipes(user_id);
create index if not exists trampolim_mensagens_swipe_idx on public.trampolim_mensagens(swipe_id);
create index if not exists trampolim_vagas_ativa_idx on public.trampolim_vagas(ativa);

alter table public.trampolim_vagas enable row level security;
alter table public.trampolim_profiles enable row level security;
alter table public.trampolim_swipes enable row level security;
alter table public.trampolim_mensagens enable row level security;

-- Vagas: somente leitura pública; escrita apenas via service role.
drop policy if exists trampolim_vagas_read on public.trampolim_vagas;
create policy trampolim_vagas_read on public.trampolim_vagas
  for select to anon, authenticated using (ativa);

-- MVP demo: escrita aberta nas tabelas do candidato (sem auth).
drop policy if exists trampolim_profiles_rw on public.trampolim_profiles;
create policy trampolim_profiles_rw on public.trampolim_profiles
  for all to anon, authenticated using (true) with check (true);

drop policy if exists trampolim_swipes_rw on public.trampolim_swipes;
create policy trampolim_swipes_rw on public.trampolim_swipes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists trampolim_mensagens_rw on public.trampolim_mensagens;
create policy trampolim_mensagens_rw on public.trampolim_mensagens
  for all to anon, authenticated using (true) with check (true);
