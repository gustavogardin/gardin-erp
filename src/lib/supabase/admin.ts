import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Usado APENAS em rotas server-side que precisam funcionar sem o cliente
// estar logado (ex: página pública de aprovação de orçamento pelo cliente).
// Nunca importar este arquivo em um componente que roda no navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
