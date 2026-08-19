-- ============================================================================
-- Finan — Schema completo (tabelas + RLS) para rodar no SQL Editor do Supabase
-- ============================================================================
-- Este script é idempotente na maior parte (usa "if not exists" onde possível),
-- mas é pensado para rodar uma única vez em um projeto novo.

-- ----------------------------------------------------------------------------
-- Extensões
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  nome       text not null,
  tipo       text not null check (tipo in ('entrada', 'saida', 'ambos')),
  cor        text,
  created_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories (user_id);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- transactions
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  valor                  numeric(12, 2) not null check (valor > 0),
  tipo                   text not null check (tipo in ('entrada', 'saida')),
  forma_pagamento        text check (forma_pagamento in ('credito', 'debito', 'outro')),
  categoria_id           uuid references public.categories (id) on delete set null,
  descricao              text,
  data                   date not null,
  parcela_atual          int,
  parcela_total          int,
  grupo_parcelamento_id  uuid,
  created_at             timestamptz not null default now()
);

create index if not exists transactions_user_id_data_idx on public.transactions (user_id, data desc);
create index if not exists transactions_grupo_parcelamento_idx on public.transactions (grupo_parcelamento_id);
create index if not exists transactions_categoria_id_idx on public.transactions (categoria_id);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- self_loans ("Devo a mim mesmo")
-- ----------------------------------------------------------------------------
create table if not exists public.self_loans (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  valor          numeric(12, 2) not null check (valor > 0),
  data           date not null,
  descricao      text,
  status         text not null default 'pendente' check (status in ('pendente', 'pago')),
  data_pagamento date,
  created_at     timestamptz not null default now()
);

create index if not exists self_loans_user_id_status_idx on public.self_loans (user_id, status);

alter table public.self_loans enable row level security;

create policy "self_loans_select_own" on public.self_loans
  for select using (auth.uid() = user_id);
create policy "self_loans_insert_own" on public.self_loans
  for insert with check (auth.uid() = user_id);
create policy "self_loans_update_own" on public.self_loans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "self_loans_delete_own" on public.self_loans
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- investment_goals (Metas de investimento)
-- ----------------------------------------------------------------------------
create table if not exists public.investment_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  nome       text not null,
  valor_alvo numeric(12, 2),
  prazo      date,
  created_at timestamptz not null default now()
);

create index if not exists investment_goals_user_id_idx on public.investment_goals (user_id);

alter table public.investment_goals enable row level security;

create policy "investment_goals_select_own" on public.investment_goals
  for select using (auth.uid() = user_id);
create policy "investment_goals_insert_own" on public.investment_goals
  for insert with check (auth.uid() = user_id);
create policy "investment_goals_update_own" on public.investment_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "investment_goals_delete_own" on public.investment_goals
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- investment_contributions (Aportes / resgates)
-- ----------------------------------------------------------------------------
create table if not exists public.investment_contributions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  goal_id    uuid not null references public.investment_goals (id) on delete cascade,
  valor      numeric(12, 2) not null, -- pode ser negativo (resgate)
  data       date not null,
  descricao  text,
  created_at timestamptz not null default now()
);

create index if not exists investment_contributions_goal_id_idx on public.investment_contributions (goal_id);
create index if not exists investment_contributions_user_id_data_idx on public.investment_contributions (user_id, data);

alter table public.investment_contributions enable row level security;

create policy "investment_contributions_select_own" on public.investment_contributions
  for select using (auth.uid() = user_id);
create policy "investment_contributions_insert_own" on public.investment_contributions
  for insert with check (auth.uid() = user_id);
create policy "investment_contributions_update_own" on public.investment_contributions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "investment_contributions_delete_own" on public.investment_contributions
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Categorias padrão para novos usuários
-- Ao criar uma conta (novo registro em auth.users), populamos categorias
-- sugeridas automaticamente. O usuário pode editar/apagar livremente depois.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.categories (user_id, nome, tipo, cor) values
    (new.id, 'Alimentação',    'saida',   '#f97316'),
    (new.id, 'Transporte',     'saida',   '#3b82f6'),
    (new.id, 'Moradia',        'saida',   '#8b5cf6'),
    (new.id, 'Lazer',          'saida',   '#ec4899'),
    (new.id, 'Saúde',          'saida',   '#ef4444'),
    (new.id, 'Salário/Renda',  'entrada', '#22c55e'),
    (new.id, 'Investimento',   'ambos',   '#14b8a6'),
    (new.id, 'Outros',         'ambos',   '#64748b');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute function public.handle_new_user_categories();

-- ============================================================================
-- Fim do schema.
-- ============================================================================
