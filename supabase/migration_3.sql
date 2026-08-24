-- =========================================================
-- GARDIN ERP - Migração 3: Orçamentos
-- Rode este arquivo no SQL Editor do Supabase DEPOIS da migration_2.sql
-- =========================================================

create type quote_status as enum ('rascunho', 'enviado', 'aprovado', 'rejeitado');

create sequence quote_number_seq start 1;

create table quotes (
  id uuid primary key default uuid_generate_v4(),
  quote_number int not null default nextval('quote_number_seq') unique,
  client_id uuid not null references clients(id),
  title text not null,
  service_summary text,
  finishing text,
  status quote_status not null default 'rascunho',
  valid_until date,
  deadline_estimate text,
  notes text,
  approval_token text unique,
  approval_token_expires_at timestamptz,
  approved_by_name text,
  approved_at timestamptz,
  rejection_reason text,
  converted_order_id uuid references service_orders(id),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references quotes(id) on delete cascade,
  name text not null,
  measurements text,
  quantity int not null default 1,
  technical_description text, -- uma linha por bullet
  unit_value numeric not null default 0,
  needs_art boolean not null default false,
  needs_printing boolean not null default false,
  needs_production boolean not null default false,
  needs_installation boolean not null default false,
  art_already_approved boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table quotes enable row level security;
alter table quote_items enable row level security;

create policy "authenticated_all_quotes" on quotes for all using (auth.role() = 'authenticated');
create policy "authenticated_all_quote_items" on quote_items for all using (auth.role() = 'authenticated');

-- A aprovação pública (sem login) é feita por uma rota server-side usando a
-- service_role key, que ignora RLS — por isso não existe policy pública aqui.
