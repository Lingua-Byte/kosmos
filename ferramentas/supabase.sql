-- KOSMOS · conta na nuvem (Supabase)
-- Cole tudo isto em: Supabase → SQL Editor → New query → Run.
-- Cria a tabela do progresso: uma linha por jogador, e cada um só lê e grava a própria.

create table if not exists public.progresso (
  usuario uuid primary key references auth.users (id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.progresso enable row level security;

drop policy if exists "jogador lê o próprio progresso" on public.progresso;
create policy "jogador lê o próprio progresso" on public.progresso
  for select using (auth.uid() = usuario);

drop policy if exists "jogador cria o próprio progresso" on public.progresso;
create policy "jogador cria o próprio progresso" on public.progresso
  for insert with check (auth.uid() = usuario);

drop policy if exists "jogador atualiza o próprio progresso" on public.progresso;
create policy "jogador atualiza o próprio progresso" on public.progresso
  for update using (auth.uid() = usuario) with check (auth.uid() = usuario);
