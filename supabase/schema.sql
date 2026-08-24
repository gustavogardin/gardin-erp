-- =========================================================
-- GARDIN ERP - Schema completo do banco de dados
-- Rode este arquivo inteiro no SQL Editor do Supabase
-- (Painel Supabase > SQL Editor > New query > colar > Run)
-- =========================================================

-- ---------- EXTENSÕES ----------
create extension if not exists "uuid-ossp";

-- ---------- ENUMS ----------
create type user_role as enum ('admin', 'comercial', 'designer', 'impressao', 'producao', 'instalacao', 'financeiro');
create type os_priority as enum ('normal', 'alta', 'urgente');
create type step_status as enum ('nao_iniciado', 'aguardando', 'em_andamento', 'concluido', 'atrasado', 'dependencia');
create type os_stage as enum ('entrada', 'arte', 'aprovacao', 'impressao', 'producao', 'instalacao', 'financeiro', 'concluido');
create type art_status as enum ('aguardando_criacao', 'em_criacao', 'alteracao_solicitada', 'enviado_aprovacao', 'aguardando_cliente', 'aprovado');
create type print_status as enum ('aguardando', 'na_fila', 'imprimindo', 'concluida', 'problema', 'reimpressao');
create type production_status as enum ('aguardando', 'material_separado', 'em_producao', 'aguardando_material', 'pausada', 'concluida');
create type installation_status as enum ('aguardando_agendamento', 'agendada', 'em_deslocamento', 'em_instalacao', 'concluida', 'retorno_necessario');
create type payment_status as enum ('nao_cobrado', 'a_cobrar', 'cobranca_enviada', 'parcialmente_pago', 'pago', 'vencido');

-- ---------- USUÁRIOS (perfil, vinculado ao auth.users do Supabase) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'comercial',
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- CLIENTES ----------
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  trade_name text,
  document text, -- CPF ou CNPJ
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clients_name on clients using gin (to_tsvector('portuguese', coalesce(name,'') || ' ' || coalesce(trade_name,'')));

-- ---------- ORDENS DE SERVIÇO ----------
create sequence os_number_seq start 1;

create table service_orders (
  id uuid primary key default uuid_generate_v4(),
  os_number int not null default nextval('os_number_seq') unique,
  client_id uuid not null references clients(id),
  project_name text not null,
  description text,
  quantity int,
  measurements text,
  material text,
  print_type text,
  finishing text,
  installation_location text,
  technical_notes text,
  agreed_deadline date,
  entry_date date not null default current_date,
  expected_completion_date date,
  responsible_id uuid references profiles(id),
  priority os_priority not null default 'normal',
  current_stage os_stage not null default 'entrada',
  needs_art boolean not null default false,
  needs_printing boolean not null default false,
  needs_production boolean not null default false,
  needs_installation boolean not null default false,
  is_completed boolean not null default false,
  approval_token text unique,
  approval_token_expires_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_so_stage on service_orders (current_stage);
create index idx_so_client on service_orders (client_id);

-- ---------- ETAPAS GENÉRICAS DA OS (linha do tempo de status por etapa) ----------
create table service_order_steps (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  stage os_stage not null,
  status step_status not null default 'nao_iniciado',
  responsible_id uuid references profiles(id),
  started_at timestamptz,
  completed_at timestamptz,
  deadline date,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- ARTE ----------
create table art_versions (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  version_label text not null, -- Ex: "V1", "V2", "Final"
  file_path text not null,
  uploaded_by uuid references profiles(id),
  status art_status not null default 'em_criacao',
  created_at timestamptz not null default now()
);

create table art_approvals (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  art_version_id uuid references art_versions(id),
  approved boolean,
  approver_name text,
  change_request text,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- IMPRESSÃO ----------
create table print_jobs (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  status print_status not null default 'aguardando',
  machine text,
  material_used text,
  quantity_printed int,
  meters_used numeric,
  responsible_id uuid references profiles(id),
  notes text,
  updated_at timestamptz not null default now()
);

-- ---------- PRODUÇÃO ----------
create table production_jobs (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  status production_status not null default 'aguardando',
  responsible_id uuid references profiles(id),
  notes text,
  updated_at timestamptz not null default now()
);

create table production_checklists (
  id uuid primary key default uuid_generate_v4(),
  production_job_id uuid not null references production_jobs(id) on delete cascade,
  item_label text not null,
  is_done boolean not null default false,
  sort_order int not null default 0
);

-- ---------- INSTALAÇÃO ----------
create table installations (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  status installation_status not null default 'aguardando_agendamento',
  scheduled_date date,
  scheduled_time time,
  team text,
  vehicle text,
  address text,
  notes text,
  updated_at timestamptz not null default now()
);

-- ---------- FINANCEIRO ----------
create table financials (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null unique references service_orders(id) on delete cascade,
  total_value numeric not null default 0,
  discount numeric not null default 0,
  addition numeric not null default 0,
  final_value numeric generated always as (total_value - discount + addition) stored,
  status payment_status not null default 'nao_cobrado',
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  amount numeric not null,
  payment_method text,
  due_date date,
  paid_date date,
  installment_number int,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- ARQUIVOS ----------
create table attachments (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_type text,
  category text, -- ex: 'cliente', 'referencia', 'producao_final', 'foto_antes', 'foto_depois'
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- COMENTÁRIOS INTERNOS ----------
create table comments (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid not null references service_orders(id) on delete cascade,
  author_id uuid references profiles(id),
  content text not null,
  mentions text[], -- ex: array de setores/usuários mencionados
  created_at timestamptz not null default now()
);

-- ---------- NOTIFICAÇÕES ----------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  service_order_id uuid references service_orders(id) on delete cascade,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- AUDITORIA ----------
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  service_order_id uuid references service_orders(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- FUNÇÃO + TRIGGER: registrar automaticamente no histórico (audit_logs)
-- sempre que o estágio da OS mudar
-- =========================================================
create or replace function log_service_order_stage_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into audit_logs (service_order_id, action, details)
    values (new.id, 'os_criada', jsonb_build_object('estagio', new.current_stage));
  elsif (old.current_stage is distinct from new.current_stage) then
    insert into audit_logs (service_order_id, action, details)
    values (new.id, 'mudanca_estagio', jsonb_build_object('de', old.current_stage, 'para', new.current_stage));
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_log_stage_change
after insert or update on service_orders
for each row execute function log_service_order_stage_change();

-- =========================================================
-- ROW LEVEL SECURITY
-- Regra simples para a v1: qualquer usuário autenticado (funcionário)
-- pode ler e escrever. Ajustaremos por perfil (role) nos próximos módulos,
-- quando o módulo de Permissões for implementado na interface.
-- =========================================================
alter table profiles enable row level security;
alter table clients enable row level security;
alter table service_orders enable row level security;
alter table service_order_steps enable row level security;
alter table art_versions enable row level security;
alter table art_approvals enable row level security;
alter table print_jobs enable row level security;
alter table production_jobs enable row level security;
alter table production_checklists enable row level security;
alter table installations enable row level security;
alter table financials enable row level security;
alter table payments enable row level security;
alter table attachments enable row level security;
alter table comments enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

create policy "authenticated_read_profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "authenticated_all_clients" on clients for all using (auth.role() = 'authenticated');
create policy "authenticated_all_service_orders" on service_orders for all using (auth.role() = 'authenticated');
create policy "authenticated_all_service_order_steps" on service_order_steps for all using (auth.role() = 'authenticated');
create policy "authenticated_all_art_versions" on art_versions for all using (auth.role() = 'authenticated');
create policy "authenticated_all_art_approvals" on art_approvals for all using (auth.role() = 'authenticated');
create policy "authenticated_all_print_jobs" on print_jobs for all using (auth.role() = 'authenticated');
create policy "authenticated_all_production_jobs" on production_jobs for all using (auth.role() = 'authenticated');
create policy "authenticated_all_production_checklists" on production_checklists for all using (auth.role() = 'authenticated');
create policy "authenticated_all_installations" on installations for all using (auth.role() = 'authenticated');
create policy "authenticated_all_financials" on financials for all using (auth.role() = 'authenticated');
create policy "authenticated_all_payments" on payments for all using (auth.role() = 'authenticated');
create policy "authenticated_all_attachments" on attachments for all using (auth.role() = 'authenticated');
create policy "authenticated_all_comments" on comments for all using (auth.role() = 'authenticated');
create policy "authenticated_all_notifications" on notifications for all using (auth.role() = 'authenticated');
create policy "authenticated_all_audit_logs" on audit_logs for select using (auth.role() = 'authenticated');

-- Público (sem login) poderá LER uma OS apenas via o link de aprovação de arte,
-- isso será feito por uma função server-side com service_role key, não por RLS direta.

-- =========================================================
-- STORAGE BUCKET para arquivos (rodar após criar o bucket "attachments"
-- pelo painel: Storage > New bucket > nome "attachments" > público: NÃO)
-- =========================================================
-- As policies de storage devem ser criadas pelo painel do Supabase em
-- Storage > Policies, permitindo leitura/escrita para usuários autenticados.
