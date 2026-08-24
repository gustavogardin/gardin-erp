# Gardin ERP — Sistema de Ordens de Serviço

Sistema de gestão de OS para comunicação visual, feito em **Next.js 14 + Supabase + Tailwind**.

## Atualização mais recente: Arquivos + Checklist de Produção

- **Anexar arquivos (JPG ou PDF)** na OS, marcando a categoria: Arte,
  Impressão, Produção ou Geral — aparecem como miniatura (imagem) ou ícone
  (PDF), com link temporário de 1h por segurança.
- **Checklist de Produção**: dentro da OS, adicione as sub-etapas que
  aquele trabalho precisa (ex: Serraria, Pintura, Recorte de adesivo,
  Aplicação de adesivo) e marque cada uma conforme for concluindo. É livre
  — você escreve o nome da etapa que quiser, um checklist diferente pra
  cada OS.

### Rodar a atualização no seu Supabase já publicado

1. **Criar o bucket de arquivos** (só pelo painel, não é SQL):
   Supabase > Storage > New bucket > nome `attachments` > deixe
   "Public bucket" **desmarcado** > Create bucket.
2. Supabase > SQL Editor > New query > cole `supabase/migration_4.sql` > Run
   (isso libera o acesso ao bucket que você acabou de criar).
3. Suba os arquivos novos/alterados no GitHub (`src` e `supabase`) — a Vercel
   republica sozinha.

Não precisa mexer em nenhuma variável de ambiente nova para esta atualização.

## Atualização anterior: módulo de Orçamentos

- **Orçamentos por item**: monte um orçamento com vários itens, cada um com
  descritivo técnico (uma característica por linha), medidas, quantidade,
  valor, e quais setores aquele item passa (arte/impressão/produção/instalação).
- **PDF do orçamento**: gera automaticamente no visual da Gardin.
- **Aprovação pelo cliente sem login**: gere um link e envie — o cliente
  aprova ou pede alteração direto pelo celular, sem precisar de conta.
- **Converter em OS com um clique**: depois de aprovado, o botão "Converter em
  Ordem de Serviço" já cria a OS com os setores certos marcados e o valor
  preenchido.

### Rodar a atualização no seu Supabase já publicado

1. Supabase > SQL Editor > New query > cole `supabase/migration_3.sql` > Run.
2. Pegue a **service_role key**: Supabase > Project Settings > API Keys >
   aba "Legacy anon, service_role API keys" > copie a chave `service_role`
   (⚠️ essa é diferente da `anon` — nunca compartilhe ou exponha no navegador).
3. Na Vercel: Project > Settings > Environment Variables > adicione uma nova:
   - Nome: `SUPABASE_SERVICE_ROLE_KEY`
   - Valor: a chave que você copiou
   - Clique em Save, depois em Deployments > vá nos "..." do último deploy >
     **Redeploy** (as variáveis de ambiente só entram em vigor num novo deploy).
4. Suba os arquivos novos/alterados no GitHub (`src` e `supabase`) — a Vercel
   republica sozinha.

## Atualização anterior

- **Acesso sem financeiro**: dá pra criar um colaborador que só cadastra OS e não
  vê nenhum valor (dashboard, detalhe da OS e formulário de nova OS escondem
  os campos financeiros automaticamente). Veja `supabase/migration_2.sql`.
- **Edição da OS**: agora dá pra editar qualquer OS já criada (inclusive
  corrigir o valor que ficou faltando) em "OS > Editar".
- **PDF da Ordem de Serviço**: botão "🖨️ PDF" na OS abre uma versão para
  impressão/PDF com a logo e dados da Gardin, no estilo do modelo de
  orçamento/OS que você mandou. Para editar dados da empresa que aparecem
  no PDF (CNPJ, dados bancários, condições comerciais), edite
  `src/lib/company.ts`.
- **Abas de processo**: a barra lateral agora tem "Arte", "Impressão",
  "Produção" e "Instalação" — cada uma mostra a fila de OS naquela etapa,
  com botão para avançar direto.

### Rodar a atualização no seu Supabase já publicado

1. Supabase > SQL Editor > New query.
2. Cole o conteúdo de `supabase/migration_2.sql` e rode.
3. Suba os arquivos novos/alterados no GitHub (mesma tela de upload de
   antes) — a Vercel republica sozinha em 1-2 minutos.

### Criar um colaborador sem acesso a valores

1. Supabase > Authentication > Users > Add user (como antes).
2. Copie o UID e rode no SQL Editor:

```sql
insert into profiles (id, full_name, role, can_view_financials)
values ('UID-AQUI', 'Nome do Colaborador', 'comercial', false);
```

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
