-- =========================================================
-- GARDIN ERP - Migração 4: Anexos (arquivos) e Checklist de Produção
-- Rode este arquivo no SQL Editor do Supabase DEPOIS da migration_3.sql
-- =========================================================

-- As tabelas "attachments" e "production_checklists" já existem desde o
-- schema.sql original — esta migração só libera o STORAGE (onde os
-- arquivos de verdade ficam guardados).

-- PASSO MANUAL (fazer pelo painel, não dá pra criar bucket por SQL):
-- 1. Vá em Storage (menu lateral) > New bucket
-- 2. Nome: attachments
-- 3. Public bucket: NÃO (deixe desmarcado)
-- 4. Create bucket

-- Depois de criar o bucket, rode o SQL abaixo para liberar o acesso:

create policy "authenticated_upload_attachments"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');

create policy "authenticated_read_attachments"
  on storage.objects for select to authenticated
  using (bucket_id = 'attachments');

create policy "authenticated_delete_attachments"
  on storage.objects for delete to authenticated
  using (bucket_id = 'attachments');
