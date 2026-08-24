-- =========================================================
-- GARDIN ERP - Migração 2
-- Rode este arquivo no SQL Editor do Supabase DEPOIS do schema.sql
-- (não precisa mexer no que já existe, só adiciona o que falta)
-- =========================================================

-- Permissão: usuário pode ou não ver valores/financeiro
alter table profiles
  add column if not exists can_view_financials boolean not null default true;

-- Índice para consultas por etapa usadas nas novas filas de processo
create index if not exists idx_service_orders_stage_lookup on service_orders (current_stage, priority);

-- =========================================================
-- Como criar um colaborador SEM acesso a valores
-- (ex: alguém que só cadastra OS, sem ver financeiro)
-- =========================================================
-- 1. Crie o usuário normalmente pelo painel:
--    Authentication > Users > Add user
-- 2. Copie o UID e rode (trocando os dados):
--
-- insert into profiles (id, full_name, role, can_view_financials)
-- values ('UID-AQUI', 'Nome do Colaborador', 'comercial', false);
--
-- Se o colaborador já existe e você quer apenas tirar o acesso a valores:
--
-- update profiles set can_view_financials = false where id = 'UID-AQUI';
