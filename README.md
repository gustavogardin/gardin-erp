# Gardin ERP — Sistema de Ordens de Serviço

Sistema de gestão de OS para comunicação visual, feito em **Next.js 14 + Supabase + Tailwind**.

## O que já está pronto (Módulo 1)

- Login com autenticação real (Supabase Auth)
- Banco de dados completo (todas as tabelas do projeto: clientes, OS, arte,
  impressão, produção, instalação, financeiro, comentários, notificações,
  auditoria — as próximas telas vão usar essas mesmas tabelas)
- Dashboard com indicadores
- Cadastro e listagem de Clientes
- Criação de Ordem de Serviço (com seleção de etapas necessárias)
- Página de detalhe da OS (avançar etapa, financeiro, comentários internos,
  linha do tempo automática)
- Identidade visual da Gardin (preto, dourado, branco, logo)

## O que vem nos próximos módulos

- Kanban arrastável
- Etapa de Arte (upload de versões + link público de aprovação do cliente)
- Fila de Impressão e Produção (com checklist)
- Agenda de Instalação (fotos antes/depois)
- Pagamentos parciais e gráficos de faturamento
- Upload de arquivos (Supabase Storage)
- Geração de PDF da OS + QR Code
- Permissões por perfil (esconder financeiro de quem não pode ver)
- Notificações

---

## Passo a passo para colocar no ar

### 1. Criar o projeto no Supabase (gratuito)

1. Acesse https://supabase.com e crie uma conta.
2. Crie um novo projeto (escolha uma senha forte para o banco).
3. Vá em **SQL Editor** > **New query**, cole todo o conteúdo do arquivo
   `supabase/schema.sql` deste projeto e clique em **Run**.
   Isso cria todas as tabelas, tipos e permissões do sistema.
4. Vá em **Project Settings > API** e copie:
   - `Project URL`
   - `anon public key`

### 2. Criar o primeiro usuário (você)

1. No Supabase, vá em **Authentication > Users > Add user** e crie seu
   usuário com e-mail e senha (marque "Auto Confirm User").
2. Copie o **UID** desse usuário.
3. Vá em **SQL Editor** e rode (trocando os valores):

```sql
insert into profiles (id, full_name, role)
values ('COLE-O-UID-AQUI', 'Seu Nome', 'admin');
```

### 3. Rodar o projeto no seu computador

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou superior instalado.

```bash
# dentro da pasta do projeto
npm install
cp .env.example .env.local
```

Edite o arquivo `.env.local` e cole a URL e a chave que você copiou no passo 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

Depois rode:

```bash
npm run dev
```

Acesse http://localhost:3000 e faça login com o e-mail/senha criados no passo 2.

### 4. Colocar no ar (para acessar de qualquer lugar, celular incluso)

O jeito mais simples é publicar na **Vercel** (gratuito para começar):

1. Crie uma conta em https://vercel.com (pode entrar com GitHub).
2. Suba este projeto para um repositório no GitHub (ou use `vercel` pelo
   terminal, com `npx vercel`).
3. Na Vercel, clique em **New Project**, importe o repositório.
4. Em **Environment Variables**, adicione as mesmas duas variáveis do
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. Clique em **Deploy**.

Em poucos minutos você recebe uma URL pública (tipo
`https://gardin-erp.vercel.app`) já com HTTPS, acessível por computador,
tablet e celular, com múltiplos usuários acessando ao mesmo tempo.

### 5. Criar os demais usuários (designer, produção, financeiro etc.)

Repita o passo 2 para cada colaborador, escolhendo o `role` correspondente:
`admin`, `comercial`, `designer`, `impressao`, `producao`, `instalacao`,
`financeiro`. (O controle de permissões por perfil na interface será
implementado em um próximo módulo — por enquanto todo usuário logado tem
acesso a todas as telas.)

---

## Estrutura do projeto

```
src/app/login          -> tela de login
src/app/(app)          -> área logada (sidebar + páginas)
  /dashboard
  /clientes, /clientes/novo
  /ordens, /ordens/nova, /ordens/[id]
src/lib/supabase        -> conexão com o banco (cliente/servidor/middleware)
src/components          -> componentes visuais reutilizáveis
supabase/schema.sql      -> banco de dados completo
```

Qualquer dúvida na instalação, me chame que eu te ajudo a resolver.
